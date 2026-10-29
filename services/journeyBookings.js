// Journey bookings, served by the Laravel API
// (POST {apiBaseUrl}/journeys/{slug}/price-quote, POST {apiBaseUrl}/journey-bookings).
//
// The backend is the only authority on price. This module may ask it what a
// party would pay so the form can show a real figure, and it sends what the
// customer typed — but it never sends a price: the booking endpoint has no
// field for one, and the total that ends up on the record is the one the
// backend worked out for itself.
//
// Children are sent one by one, because each is priced on their own age.
// `age` is the child's age ON THE TRAVEL DATE, which is what the form asks
// for in as many words: an age by itself carries no birthday and cannot be
// aged forward without inventing one.
//
// Every call returns a `status` rather than throwing:
//
//   'ok'      — the API answered.
//   'invalid' — the API rejected the values (422). `errors` names one
//               message per field, under the form's own field names.
//   'demo'    — no API base URL is configured. Deliberate demo mode (see
//               .env.example). Nothing was sent, and the page says so
//               rather than confirming a booking that went nowhere.
//   'error'   — the API could not be reached or answered with a fault.

const DEMO = { status: 'demo' }

function endpoint(apiBaseUrl, path) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`
}

function statusCodeOf(error) {
  return error?.response?.status ?? error?.statusCode ?? error?.status ?? null
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

/** The travellers, in the shape the API's contract names. */
export function travellersPayload({ adults, children } = {}) {
  return {
    adults_count: Number(adults) || 0,
    children: (children ?? [])
      .map(child => (child?.dateOfBirth ? { date_of_birth: child.dateOfBirth } : { age: Number(child?.age) }))
      .filter(child => child.date_of_birth || Number.isInteger(child.age)),
  }
}

/**
 * What this party would pay for this journey on this date.
 *
 * Creates nothing and reserves nothing — there is no departure inventory —
 * so it is safe to call as the form is filled in.
 */
export async function fetchJourneyPrice(apiBaseUrl, slug, { travelDate, adults, children, language } = {}) {
  if (!apiBaseUrl) return DEMO

  try {
    const response = await $fetch(endpoint(apiBaseUrl, `/journeys/${encodeURIComponent(slug)}/price-quote`), {
      method: 'POST',
      query: { lang: language },
      headers: { Accept: 'application/json' },
      body: { travel_date: travelDate, ...travellersPayload({ adults, children }) },
      retry: 0,
      timeout: 8000,
    })

    return { status: 'ok', quote: response?.data ?? null }
  } catch (error) {
    if (statusCodeOf(error) === 422) return { status: 'invalid', errors: errorsOf(error) }
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
        full_name: booking.fullName,
        phone_country_code: booking.phoneCode,
        phone_number: booking.phoneNumber,
        ...(booking.email ? { email: booking.email } : {}),
        ...(booking.notes ? { notes: booking.notes } : {}),
        travel_date: booking.travelDate,
        ...travellersPayload({ adults: booking.adults, children: booking.children }),
      },
      retry: 0,
      timeout: 12000,
    })

    return { status: 'ok', booking: response?.data ?? null, message: response?.message ?? '' }
  } catch (error) {
    if (statusCodeOf(error) === 422) return { status: 'invalid', errors: errorsOf(error) }
    if (import.meta.server) console.warn(`[journey-bookings] submit: ${error?.message || error}`)

    return { status: 'error', message: error?.message || String(error) }
  }
}
