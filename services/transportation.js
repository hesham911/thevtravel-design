// The transfer request's delivery, served by the Laravel API
// (POST {apiBaseUrl}/transportation-bookings).
//
// The contract is the API's own, read from TransportationBookingRequest and
// CreateGuestTransportationBooking. Three things about it shape this module:
//
//   * The form's own names differ from the API's. `pickup_address` is
//     `pickup_location`, the country selector's dial code is
//     `phone_country_code`, and the trip type is a machine value
//     (`one_way`, `return`) rather than the label the radio shows. The
//     mapping lives here, in the module that owns the contract, so the
//     component never has to know the API's spelling.
//
//   * The return leg and the waiting duration are *prohibited* rather than
//     optional when they do not apply: `return_at` on a one-way trip, or
//     `estimated_waiting_minutes` with nobody asked to wait, is a 422, not
//     a silently ignored key. A guest who picks Return, fills the return
//     time and goes back to One way must therefore send neither — so the
//     payload is built from the trip type outwards and never from whatever
//     the form happens to still be holding.
//
//   * `pickup_at` is read as the instant it names. The API parses the
//     submitted string and converts it to the application timezone (UTC),
//     so a wall-clock time with no offset would be read as UTC and a Cairo
//     morning would become a Cairo afternoon. Every timestamp here carries
//     the service's own offset.
//
// Like the contact form, this returns a `status` rather than throwing:
//
//   'ok'        — the request is recorded. `reference` is the guest's.
//   'invalid'   — the API rejected values (422). `errors` names one message
//                 per form field it rejected.
//   'throttled' — too many requests from this address (429).
//   'demo'      — no API base URL is configured. Nothing was sent, so the
//                 flow says so rather than handing out a reference nobody
//                 can quote.
//   'error'     — unreachable, a server failure, or an answer in a shape
//                 this contract does not recognise.

/**
 * The timezone the cars actually drive in.
 *
 * A guest asking for a 10:00 pickup means 10:00 in Egypt whether they are
 * booking from Cairo, Berlin or Sydney, so the date and time they pick are
 * read here and never in the browser's own zone. Egypt observes DST, so the
 * offset is resolved per date rather than fixed at +02:00.
 */
export const SERVICE_TIME_ZONE = 'Africa/Cairo'

/** Radio label → the API's trip type. The labels are also the i18n keys. */
export const TRIP_TYPE = Object.freeze({ 'One way': 'one_way', Return: 'return' })

/** The API's own numeric bounds, so the form can say what is out of range in the guest's language. */
export const WAITING_MINUTES = Object.freeze({ min: 5, max: 1440 })

/**
 * The API's `regex` rule on `phone_number`: digits, spaces and hyphens, a
 * digit first, six to twenty characters. Held here so the form rejects a
 * number the API would, in the guest's own language, instead of sending it
 * and translating a 422.
 */
export const PHONE_NUMBER_PATTERN = /^[0-9][0-9\s-]{5,19}$/

/** API field → form field, so a rejection can be shown beside the input that caused it. */
const FORM_FIELD = Object.freeze({
  full_name: 'full_name',
  phone_country_code: 'phone_number',
  phone_number: 'phone_number',
  email: 'email',
  notes: 'notes',
  pickup_location: 'pickup_address',
  dropoff_location: 'dropoff_address',
  address_details: 'address_details',
  pickup_at: 'time',
  trip_type: 'trip_type',
  return_at: 'return_time',
  return_dropoff_location: 'return_dropoff_address',
  driver_waiting_requested: 'driver_waiting',
  estimated_waiting_minutes: 'waiting_minutes',
  adults_count: 'adults',
  children_count: 'children',
  infants_count: 'infants',
  luggage_count: 'luggage',
})

const ZONE_PARTS = new Intl.DateTimeFormat('en-US', { timeZone: SERVICE_TIME_ZONE, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { timeZone: SERVICE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const DAY_MS = 86400000

/**
 * The service zone's wall clock at an instant, as the number `Date.UTC`
 * gives those same digits.
 *
 * The difference between this and the instant is the zone's offset there,
 * which is how every offset below is measured: no engine is asked for an
 * offset string, so there is no format to parse and no DST table to carry.
 */
function wallClockAsUtc(epochMs) {
  const parts = ZONE_PARTS.formatToParts(epochMs)
  const value = type => Number(parts.find(part => part.type === type)?.value)
  // Midnight comes back as hour 24 in some engines under hour12: false.
  return Date.UTC(value('year'), value('month') - 1, value('day'), value('hour') % 24, value('minute'), value('second'))
}

function formatOffset(minutes) {
  const sign = minutes < 0 ? '-' : '+'
  const absolute = Math.abs(minutes)
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`
}

/** `<input type="time">` gives "HH:MM", some agents "HH:MM:SS". Both mean the same minute. */
function minuteOf(timeText) {
  const parts = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(String(timeText ?? '').trim())
  return parts ? `${parts[1]}:${parts[2]}` : null
}

function dayOf(dateText) {
  const day = String(dateText ?? '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
}

/**
 * The instant a wall clock in the service zone names.
 *
 * `target` is the guest's date and time read as if it were UTC, so an
 * instant `e` is the one they meant exactly when `wallClockAsUtc(e)` comes
 * back as `target`. Solving that needs the offset, and the offset depends on
 * the instant, so the offsets in force around the day are tried and the ones
 * that check out are kept.
 *
 * Egypt changes its clocks, which makes two wall clocks a year unusual:
 *
 *   * The hour repeated when the clocks go back names two instants. The
 *     earlier is used — a driver an hour early beats a driver an hour late.
 *   * The hour skipped when they go forward names none. Rather than refuse
 *     it, the request is shifted forward past the gap, which is the one
 *     reading that is still a real instant; the dispatcher confirms the
 *     time with the guest in any case.
 */
function instantOf(target) {
  const offsets = new Set([target - DAY_MS, target, target + DAY_MS].map(probe => wallClockAsUtc(probe) - probe))
  const candidates = [...offsets].map(offset => target - offset).filter(epochMs => wallClockAsUtc(epochMs) === target)

  // No candidate: a skipped hour. The smallest offset of the day is the one
  // in force just before the gap, so using it lands just after the gap
  // rather than back on the previous evening.
  return candidates.length ? Math.min(...candidates) : target - Math.min(...offsets)
}

/**
 * A date and a time the guest picked, as the instant they name in the
 * service's zone.
 *
 * Returns `{ iso, epochMs }`: the string the API is sent, and the same
 * moment as a number so the form can compare it against now and against the
 * other leg without reparsing. `null` when either half is missing or
 * malformed — the form reports that as a missing field, not as a date the
 * API has to reject.
 */
export function serviceInstant(dateText, timeText) {
  const day = dayOf(dateText)
  const minute = minuteOf(timeText)
  if (!day || !minute) return null

  const target = Date.parse(`${day}T${minute}:00Z`)
  if (Number.isNaN(target)) return null

  const epochMs = instantOf(target)

  return { iso: `${day}T${minute}:00${formatOffset((target - epochMs) / 60000)}`, epochMs }
}

/** Today in the service's zone, as `YYYY-MM-DD`: the earliest date a guest may pick. */
export function serviceToday(now = new Date()) {
  const parts = DATE_FORMAT.formatToParts(now)
  const value = type => parts.find(part => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/** A whole number within the API's bounds, or `null` when the field is blank. */
function count(value, { min, max }) {
  const number = typeof value === 'number' ? value : Number(text(value))
  if (!Number.isInteger(number) || number < min || number > max) return null
  return number
}

/**
 * The request body.
 *
 * Built from the trip type outwards: a one-way request carries no return
 * leg and no waiting duration whatever the form still holds, because the
 * API prohibits those keys rather than ignoring them. Blank optional text
 * is left out rather than sent empty, so an unanswered field is stored as
 * nothing.
 */
export function transportationPayload(form, phoneCountryCode) {
  const isReturn = TRIP_TYPE[form?.trip_type] === TRIP_TYPE.Return
  const waiting = isReturn && form?.driver_waiting === true
  const pickup = serviceInstant(form?.date, form?.time)
  const returnLeg = isReturn ? serviceInstant(form?.return_date, form?.return_time) : null

  const payload = {
    full_name: text(form?.full_name),
    phone_country_code: text(phoneCountryCode),
    phone_number: text(form?.phone_number).replace(/\s+/g, ' '),
    pickup_location: text(form?.pickup_address),
    dropoff_location: text(form?.dropoff_address),
    pickup_at: pickup?.iso ?? '',
    trip_type: TRIP_TYPE[form?.trip_type] ?? '',
    adults_count: count(form?.adults, { min: 1, max: 20 }) ?? 1,
    children_count: count(form?.children, { min: 0, max: 20 }) ?? 0,
    infants_count: count(form?.infants, { min: 0, max: 10 }) ?? 0,
    luggage_count: count(form?.luggage, { min: 0, max: 30 }) ?? 0,
  }

  for (const [key, value] of [['email', text(form?.email)], ['notes', text(form?.notes)], ['address_details', text(form?.address_details)]]) {
    if (value !== '') payload[key] = value
  }

  if (isReturn) {
    payload.return_at = returnLeg?.iso ?? ''
    const returnDropoff = text(form?.return_dropoff_address)
    // Left blank, the return runs back to where the guest was collected,
    // which is what the API stores when the field is absent.
    if (returnDropoff !== '') payload.return_dropoff_location = returnDropoff
  }

  payload.driver_waiting_requested = waiting
  if (waiting) {
    const minutes = count(form?.waiting_minutes, WAITING_MINUTES)
    // Optional even when waiting is asked for: the dispatcher agrees the
    // duration on the phone if the guest cannot estimate it.
    if (minutes !== null) payload.estimated_waiting_minutes = minutes
  }

  return payload
}

/**
 * One message per form field, from the API's `errors` bag.
 *
 * Both halves of the phone number land on the single input the form shows.
 * A field this form does not have is dropped: there would be nowhere to
 * show it.
 */
export function fieldErrors(errors) {
  const mapped = {}
  for (const [apiField, messages] of Object.entries(errors)) {
    const field = FORM_FIELD[apiField]
    const message = Array.isArray(messages) ? messages[0] : messages
    if (field && !mapped[field] && typeof message === 'string' && message !== '') mapped[field] = message
  }
  return mapped
}

export async function submitTransportationRequest(apiBaseUrl, form, phoneCountryCode, language) {
  if (!apiBaseUrl) return { status: 'demo' }

  try {
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/transportation-bookings`, {
      method: 'POST',
      query: { lang: language },
      headers: { Accept: 'application/json' },
      body: transportationPayload(form, phoneCountryCode),
      // A retry could ask a dispatcher for the same car twice, and a
      // guest's request is worth waiting longer for than a page's content.
      retry: 0,
      timeout: 20000,
    })

    const booking = response?.data
    // The envelope says so itself, and a request with no reference is a
    // request the guest cannot quote: neither is a success.
    if (response?.success !== true || typeof booking?.reference !== 'string' || booking.reference === '') {
      return { status: 'error' }
    }

    return {
      status: 'ok',
      reference: booking.reference,
      // Carried through rather than assumed: nothing here may present a
      // submitted request as a confirmed booking.
      bookingStatus: typeof booking.status === 'string' ? booking.status : '',
      pickupAt: typeof booking.pickup_at === 'string' ? booking.pickup_at : '',
      submittedAt: typeof booking.submitted_at === 'string' ? booking.submitted_at : '',
    }
  } catch (error) {
    const code = error?.statusCode ?? error?.response?.status ?? 0
    const errors = error?.data?.errors

    if (code === 422 && errors && typeof errors === 'object') {
      const mapped = fieldErrors(errors)
      // A rejection naming nothing this form shows would leave the guest
      // reading about fields that are not highlighted.
      if (Object.keys(mapped).length) return { status: 'invalid', errors: mapped }
      return { status: 'error' }
    }

    if (code === 429) return { status: 'throttled' }

    // A lost request must never look sent, and it must not be invisible
    // either: the console always says what failed and why.
    console.warn(`[transportation] request failed — ${error?.message || error}`)
    return { status: 'error' }
  }
}
