// Journey bookings, served by the Laravel API
// (POST {apiBaseUrl}/journeys/{slug}/price-quote, POST {apiBaseUrl}/journey-bookings).
//
// The backend is the only authority on price. This module may ask it what a
// party would pay so the form can show a real figure, and it sends what the
// customer typed — but it never sends a price: the booking endpoint has no
// field for one, and the total that ends up on the record is the one the
// backend worked out for itself.
//
// Category counts need no exact ages. Older clients can still send ages.
//
// Every call returns a `status` rather than throwing:
//
//   'ok'      — the API answered.
//   'invalid' — the API rejected the values (422). `errors` names one
//               message per field, under the form's own field names.
//   'stale'   — the price moved while the form was open (409). Nothing the
//               customer typed is wrong and nothing was recorded; the page
//               shows them the new figure and asks again. A separate status
//               from 'invalid' because the remedy is different.
//   'demo'    — no API base URL is configured. Deliberate demo mode (see
//               .env.example). Nothing was sent, and the page says so
//               rather than confirming a booking that went nowhere.
//   'error'   — the API could not be reached or answered with a fault.
//
// Private and Group are different promises about the vehicle — an exclusive
// car, or a seat shared with other bookings — so the type is always sent and
// never inferred from the party size. The backend refuses a mismatch rather
// than reclassifying, and this module's job is to make sure the page asks
// the question before it gets that far.

/**
 * The booking types and their party limits.
 *
 * Read from the journey detail payload (`pricing.booking_types`), so the
 * form validates the same bounds the backend enforces. The fallbacks below
 * exist only for demo journeys with no API payload and must stay in step
 * with config('journeys.party') on the backend — which is why the real
 * numbers travel with the payload rather than living here.
 *
 * `sharesVehicle` is the whole difference, and the page has to say it: a
 * Group customer is agreeing to travel with other people's bookings.
 */
export function journeyBookingTypes(bookingTypes = []) {
  const fallbacks = [
    { value: 'private', minTravelers: 1, maxTravelers: 3, sharesVehicle: false },
    { value: 'group', minTravelers: 4, maxTravelers: 255, sharesVehicle: true },
  ]

  const labels = {
    private: {
      label: 'Private',
      summary: 'A vehicle for your party alone',
      detail: 'Your own vehicle and driver. Nobody else joins your journey.',
    },
    group: {
      label: 'Group',
      summary: 'Share transportation with other travellers',
      detail: 'You travel in a shared vehicle with other bookings on the same day. A lower price per person, and the company of other travellers.',
    },
  }

  return fallbacks.map(fallback => {
    const supplied = bookingTypes.find(type => type.value === fallback.value)

    return {
      ...fallback,
      ...(supplied
        ? {
            minTravelers: supplied.min_travelers,
            maxTravelers: supplied.max_travelers,
            sharesVehicle: Boolean(supplied.shares_vehicle),
          }
        : {}),
      ...labels[fallback.value],
    }
  })
}

/** The type a party of this size may be sold, or null when it may not. */
export function journeyBookingTypeFor(types, value) {
  return types.find(type => type.value === value) ?? null
}

/** Whether this party size suits the chosen type. */
export function journeyPartySizeAccepted(type, travelers) {
  if (!type) return false

  return travelers >= type.minTravelers && travelers <= type.maxTravelers
}

// Bounds come from AgeBandPricing through the journey detail API. The
// fallbacks keep the same policy for demo journeys without an API payload.
export function journeyTravelerCategories(ageBands = []) {
  return [
    { key: 'adults', band: 'adult', label: 'Adults (13+)', single: 'adult', description: 'Full adult price', min: 1, minAge: 13, maxAge: null },
    { key: 'children', band: 'child', label: 'Children (5–12)', single: 'child', description: '50% of adult price', min: 0, minAge: 5, maxAge: 12 },
    { key: 'youngChildren', band: 'infant', label: 'Young Children (under 5)', single: 'young child', description: 'Free', min: 0, minAge: 0, maxAge: 4 },
  ].map(category => {
    const band = ageBands.find(band => band.band === category.band)
    return band ? { ...category, minAge: band.min_age, maxAge: band.max_age } : category
  })
}

export function validJourneyChildAge(age, category) {
  if (age === null || age === '' || age === undefined) return false
  const years = Number(age)
  return Number.isInteger(years) && years >= category.minAge && years <= category.maxAge
}

const DEMO = { status: 'demo' }

function endpoint(apiBaseUrl, path) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`
}

function statusCodeOf(error) {
  return error?.response?.status ?? error?.statusCode ?? error?.status ?? null
}

function messageOf(error) {
  const payload = error?.response?._data ?? error?.data ?? {}

  return typeof payload.message === 'string' ? payload.message : ''
}

function errorsOf(error) {
  const payload = error?.response?._data ?? error?.data ?? {}
  const fields = payload.errors ?? {}
  const messages = {}

  for (const [field, value] of Object.entries(fields)) {
    messages[field] = Array.isArray(value) ? value[0] : String(value)
  }

  return messages
}

/**
 * The travellers, in the shape the API's contract names.
 *
 * `travelers_count` is sent as a CHECK, not as the total: the backend counts
 * the party itself and refuses a figure that disagrees. Sending it turns a
 * silent mismatch — the two sides looking at different parties — into a
 * message somebody can act on.
 */
export function travellersPayload({ bookingType, adults, children, childrenCount, youngChildrenCount } = {}) {
  if (childrenCount !== undefined || youngChildrenCount !== undefined) {
    return {
      ...(bookingType ? { booking_type: bookingType } : {}),
      adults_count: Number(adults) || 0,
      children_count: Number(childrenCount) || 0,
      young_children_count: Number(youngChildrenCount) || 0,
      travelers_count: (Number(adults) || 0) + (Number(childrenCount) || 0) + (Number(youngChildrenCount) || 0),
    }
  }
  const party = (children ?? [])
    .map(child => (child?.dateOfBirth ? { date_of_birth: child.dateOfBirth } : { age: Number(child?.age) }))
    .filter(child => child.date_of_birth || Number.isInteger(child.age))

  return {
    ...(bookingType ? { booking_type: bookingType } : {}),
    adults_count: Number(adults) || 0,
    children: party,
    travelers_count: (Number(adults) || 0) + party.length,
  }
}

/**
 * What this party would pay for this journey on this date.
 *
 * Creates nothing and reserves nothing — there is no departure inventory —
 * so it is safe to call as the form is filled in.
 */
export async function fetchJourneyPrice(apiBaseUrl, slug, { travelDate, bookingType, adults, children, childrenCount, youngChildrenCount, selectedOptions, language } = {}) {
  if (!apiBaseUrl) return DEMO

  try {
    const response = await $fetch(endpoint(apiBaseUrl, `/journeys/${encodeURIComponent(slug)}/price-quote`), {
      method: 'POST',
      query: { lang: language },
      headers: { Accept: 'application/json' },
      body: { travel_date: travelDate, ...(selectedOptions?.length ? { selected_options: selectedOptions } : {}), ...travellersPayload({ bookingType, adults, children, childrenCount, youngChildrenCount }) },
      retry: 0,
      timeout: 8000,
    })

    return { status: 'ok', quote: response?.data ?? null }
  } catch (error) {
    // A journey with no operating costs configured for this party size, or
    // no exchange rate set, answers 422 with a message and no field errors.
    // Reported as given rather than rendered as a price of zero.
    if (statusCodeOf(error) === 422) return { status: 'invalid', errors: errorsOf(error), message: messageOf(error) }
    if (import.meta.server) console.warn(`[journey-bookings] quote ${slug}: ${error?.message || error}`)

    return { status: 'error', message: error?.message || String(error) }
  }
}

/**
 * Sends the request. The guest is given a reference back and told the team
 * will be in touch; nothing here confirms a booking, because confirming one
 * is a conversation somebody has to have.
 */
export async function submitJourneyBooking(apiBaseUrl, booking, language) {
  if (!apiBaseUrl) return DEMO

  try {
    const response = await $fetch(endpoint(apiBaseUrl, '/journey-bookings'), {
      method: 'POST',
      query: { lang: language },
      headers: { Accept: 'application/json' },
      body: {
        journey_id: booking.journeyId,
        ...(booking.selectedOptions?.length ? { selected_options: booking.selectedOptions } : {}),
        full_name: booking.fullName,
        phone_country_code: booking.phoneCode,
        phone_number: booking.phoneNumber,
        ...(booking.email ? { email: booking.email } : {}),
        ...(booking.notes ? { notes: booking.notes } : {}),
        travel_date: booking.travelDate,
        // Evidence of which quote the customer was looking at. It cannot set
        // a price — the backend recalculates and books at its own figure —
        // and can only cause a refusal, so the customer is never charged a
        // number they did not see.
        ...(booking.quoteToken ? { quote_token: booking.quoteToken } : {}),
        ...travellersPayload({
          bookingType: booking.bookingType,
          adults: booking.adults,
          children: booking.children,
          childrenCount: booking.childrenCount,
          youngChildrenCount: booking.youngChildrenCount,
        }),
      },
      retry: 0,
      timeout: 12000,
    })

    return { status: 'ok', booking: response?.data ?? null, message: response?.message ?? '' }
  } catch (error) {
    // 409: the price moved while the form was open. Nothing was recorded and
    // nothing the customer typed is wrong, so this is not a validation
    // failure — the page fetches the new figure and asks them to accept it.
    if (statusCodeOf(error) === 409) return { status: 'stale', message: messageOf(error) }
    if (statusCodeOf(error) === 422) return { status: 'invalid', errors: errorsOf(error), message: messageOf(error) }
    if (import.meta.server) console.warn(`[journey-bookings] submit: ${error?.message || error}`)

    return { status: 'error', message: error?.message || String(error) }
  }
}

/** Missing cost or markup rows cannot be requested. Older API payloads use server validation. */
export function journeyConfigurationAvailable(configurations, bookingType, travelers, priceOnRequestAbove = null) {
  if (bookingType === 'group' && Number.isInteger(priceOnRequestAbove) && travelers > priceOnRequestAbove) return true
  if (!Array.isArray(configurations)) return true
  return configurations.some(row => row.booking_type === bookingType && row.traveler_count === travelers)
}
