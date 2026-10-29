import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import translations from '../data/demoTranslations.json' with { type: 'json' }
import {
  PHONE_NUMBER_PATTERN, SERVICE_TIME_ZONE, TRAVELER_CATEGORIES, TRIP_TYPE, WAITING_MINUTES,
  fieldErrors, serviceInstant, serviceToday, submitTransportationRequest, transportationPayload,
} from '../services/transportation.js'

const oneWay = {
  pickup_address: ' Luxor Airport ', dropoff_address: ' Hotel in Luxor ', address_details: ' Main entrance ',
  date: '2026-11-10', time: '10:00', trip_type: 'One way',
  return_date: '', return_time: '', return_dropoff_address: '', driver_waiting: false, waiting_minutes: '',
  adults: 2, children: 1, young_children: 0, luggage: 2,
  full_name: ' Example Guest ', phone_country: 'EG', phone_number: ' 1012345678 ', email: ' guest@example.com ', notes: ' Child seat requested ',
}

// $fetch is a Nuxt runtime global. Each case installs its own.
function withFetch(implementation, run) {
  const original = globalThis.$fetch
  globalThis.$fetch = implementation
  return (async () => { try { return await run() } finally { globalThis.$fetch = original } })()
}

function acknowledgement(overrides = {}) {
  return {
    success: true,
    message: 'Your transportation request has been received and is pending review.',
    data: {
      reference: 'TRN-2026-0001', status: 'pending', trip_type: 'one_way',
      pickup_location: 'Luxor Airport', dropoff_location: 'Hotel in Luxor',
      pickup_at: '2026-11-10T08:00:00+00:00', return_at: null, submitted_at: '2026-10-27T09:00:00+00:00',
      ...overrides,
    },
  }
}

test('a one-way request is the API contract: trimmed values, the API’s own field names, and no return leg', () => {
  assert.deepEqual(transportationPayload(oneWay, '+20'), {
    full_name: 'Example Guest',
    phone_country_code: '+20',
    phone_number: '1012345678',
    email: 'guest@example.com',
    notes: 'Child seat requested',
    address_details: 'Main entrance',
    pickup_location: 'Luxor Airport',
    dropoff_location: 'Hotel in Luxor',
    pickup_at: '2026-11-10T10:00:00+02:00',
    trip_type: 'one_way',
    driver_waiting_requested: false,
    adults_count: 2, children_count: 1, young_children_count: 0, luggage_count: 2,
  })
  assert.deepEqual(TRIP_TYPE, { 'One way': 'one_way', Return: 'return' })
})

test('a return request carries the return leg, and its drop-off only when the guest named one', () => {
  const payload = transportationPayload({ ...oneWay, trip_type: 'Return', return_date: '2026-11-10', return_time: '17:00', return_dropoff_address: ' Luxor Airport ' }, '+20')
  assert.equal(payload.trip_type, 'return')
  assert.equal(payload.return_at, '2026-11-10T17:00:00+02:00')
  assert.equal(payload.return_dropoff_location, 'Luxor Airport')
  // A return on a later day is as valid as one the same evening.
  assert.equal(transportationPayload({ ...oneWay, trip_type: 'Return', return_date: '2026-11-14', return_time: '06:30' }, '+20').return_at, '2026-11-14T06:30:00+02:00')
  // Left blank, the leg runs back to the pickup, which is what the API
  // stores when the key is absent — so the key is absent, not empty.
  assert.equal('return_dropoff_location' in transportationPayload({ ...oneWay, trip_type: 'Return', return_date: '2026-11-10', return_time: '17:00', return_dropoff_address: '  ' }, '+20'), false)
})

test('a waiting request sends the duration, and omits it when the guest could not estimate one', () => {
  const base = { ...oneWay, trip_type: 'Return', return_date: '2026-11-10', return_time: '17:00', driver_waiting: true }
  const waiting = transportationPayload({ ...base, waiting_minutes: 180 }, '+20')
  assert.equal(waiting.driver_waiting_requested, true)
  assert.equal(waiting.estimated_waiting_minutes, 180)
  // `estimated_waiting_minutes` is nullable: a blank field is left out, not sent as 0.
  assert.equal('estimated_waiting_minutes' in transportationPayload({ ...base, waiting_minutes: '' }, '+20'), false)
  // Outside the API's own bounds it is left out as well, rather than sent to be rejected.
  for (const minutes of [WAITING_MINUTES.min - 1, WAITING_MINUTES.max + 1, 12.5, 'soon']) {
    assert.equal('estimated_waiting_minutes' in transportationPayload({ ...base, waiting_minutes: minutes }, '+20'), false, `${minutes}`)
  }
  assert.deepEqual(WAITING_MINUTES, { min: 5, max: 1440 })
})

test('switching back to one way sends neither the return leg nor the waiting duration', () => {
  // The API prohibits these keys on a one-way trip rather than ignoring
  // them, so what the form still holds must not reach the payload.
  const payload = transportationPayload({
    ...oneWay, trip_type: 'One way',
    return_date: '2026-11-10', return_time: '17:00', return_dropoff_address: 'Luxor Airport',
    driver_waiting: true, waiting_minutes: 180,
  }, '+20')
  for (const key of ['return_at', 'return_dropoff_location', 'estimated_waiting_minutes']) {
    assert.equal(key in payload, false, key)
  }
  assert.equal(payload.driver_waiting_requested, false)
})

test('blank optional fields are left out rather than sent empty', () => {
  const payload = transportationPayload({ ...oneWay, email: '  ', notes: '', address_details: '   ' }, '+20')
  for (const key of ['email', 'notes', 'address_details']) assert.equal(key in payload, false, key)
  // The required ones are always sent, so the API stays the authority on what is missing.
  for (const key of ['full_name', 'phone_country_code', 'phone_number', 'pickup_location', 'dropoff_location', 'pickup_at', 'trip_type', 'adults_count']) {
    assert.equal(key in payload, true, key)
  }
})

test('the country selector’s dial code is the API’s phone_country_code, and is never repeated in the number', () => {
  for (const [code, number] of [['+20', '1012345678'], ['+44', '7700 900123'], ['+1', '415-555-0123']]) {
    const payload = transportationPayload({ ...oneWay, phone_number: number }, code)
    assert.equal(payload.phone_country_code, code)
    assert.equal(payload.phone_number, number)
    assert.equal(payload.phone_number.startsWith(code), false)
    assert.match(payload.phone_number, PHONE_NUMBER_PATTERN)
  }
  // Runs of whitespace are collapsed: the API's rule allows single spaces and hyphens only.
  assert.equal(transportationPayload({ ...oneWay, phone_number: ' 10  1234   5678 ' }, '+20').phone_number, '10 1234 5678')
  // The pattern is the API's own, so the form rejects what the API would.
  for (const invalid of ['(10) 1234', '+201012345678', '12345', 'abc123456']) assert.doesNotMatch(invalid, PHONE_NUMBER_PATTERN)
})

/**
 * The Travelers section asks for three age categories, youngest first, and
 * nothing else. The counters and the review step both read this list, so
 * this is the one place either of them can drift from — a fourth row here
 * would show up as a fourth counter.
 */
test('the travellers asked for are the three age categories, youngest first', () => {
  assert.deepEqual(
    TRAVELER_CATEGORIES.map(row => [row.key, row.label]),
    [
      ['young_children', 'Young children (under 5)'],
      ['children', 'Children (5–12)'],
      ['adults', 'Adults (13+)'],
    ],
  )

  // Luggage is not a traveller and has no counter, yet the request still
  // carries it: the column, the dispatcher's view and the bookings already
  // taken are untouched by the form losing the row.
  assert.equal(TRAVELER_CATEGORIES.some(row => row.key === 'luggage'), false)
  assert.equal(transportationPayload({ ...oneWay, luggage: 3 }, '+20').luggage_count, 3)

  // A transfer carries at least one grown traveller; the younger rows may
  // be zero.
  assert.deepEqual(TRAVELER_CATEGORIES.map(row => row.min), [0, 0, 1])
})

test('passenger and luggage counts stay within the API’s bounds, with its own defaults', () => {
  const payload = transportationPayload({ ...oneWay, adults: 4, children: 3, young_children: 1, luggage: 6 }, '+20')
  assert.deepEqual(
    { adults_count: payload.adults_count, children_count: payload.children_count, young_children_count: payload.young_children_count, luggage_count: payload.luggage_count },
    { adults_count: 4, children_count: 3, young_children_count: 1, luggage_count: 6 },
  )
  // At least one adult, and no count outside what the API accepts.
  const outOfRange = transportationPayload({ ...oneWay, adults: 0, children: 99, young_children: -1, luggage: 500 }, '+20')
  assert.deepEqual(
    { adults_count: outOfRange.adults_count, children_count: outOfRange.children_count, young_children_count: outOfRange.young_children_count, luggage_count: outOfRange.luggage_count },
    { adults_count: 1, children_count: 0, young_children_count: 0, luggage_count: 0 },
  )
  // Zero luggage is an answer, not a missing field.
  assert.equal(transportationPayload({ ...oneWay, luggage: 0 }, '+20').luggage_count, 0)
})

test('a picked date and time is the instant it names in Egypt, across the DST change', () => {
  // Winter: +02:00. The API converts to UTC and stores 08:00.
  assert.deepEqual(serviceInstant('2026-11-10', '10:00'), { iso: '2026-11-10T10:00:00+02:00', epochMs: Date.parse('2026-11-10T08:00:00Z') })
  // Summer: Egypt observes DST, so the same wall clock is +03:00.
  assert.deepEqual(serviceInstant('2026-07-10', '10:00'), { iso: '2026-07-10T10:00:00+03:00', epochMs: Date.parse('2026-07-10T07:00:00Z') })
  // Either side of the autumn change, resolved per date rather than fixed.
  assert.equal(serviceInstant('2026-10-29', '23:30').iso, '2026-10-29T23:30:00+03:00')
  assert.equal(serviceInstant('2026-10-31', '00:30').iso, '2026-10-31T00:30:00+02:00')
  // The clocks go back at the end of Thursday 29 October 2026, so 23:30
  // that evening names two instants. The earlier (+03:00) is used: a driver
  // an hour early beats a driver an hour late.
  assert.deepEqual(serviceInstant('2026-10-29', '23:30'), { iso: '2026-10-29T23:30:00+03:00', epochMs: Date.parse('2026-10-29T20:30:00Z') })
  assert.equal(serviceInstant('2026-10-30', '12:00').iso, '2026-10-30T12:00:00+02:00')
  // They go forward at the start of Friday 24 April 2026, so 00:30 that
  // morning names none. The request is shifted past the gap, not refused.
  const skipped = serviceInstant('2026-04-24', '00:30')
  assert.ok(skipped && Number.isFinite(skipped.epochMs))
  assert.equal(skipped.iso, '2026-04-24T00:30:00+02:00')
  // "HH:MM:SS" from an agent that supplies seconds means the same minute.
  assert.equal(serviceInstant('2026-11-10', '10:00:00').iso, '2026-11-10T10:00:00+02:00')
  // A half-filled or malformed pair is a missing field, not a date the API has to reject.
  for (const [day, time] of [['', '10:00'], ['2026-11-10', ''], ['10/11/2026', '10:00'], ['2026-11-10', '10'], [null, null]]) {
    assert.equal(serviceInstant(day, time), null, `${day} ${time}`)
  }
  assert.equal(SERVICE_TIME_ZONE, 'Africa/Cairo')
})

test('the guest’s own timezone never changes the instant sent, or the earliest date offered', () => {
  // The browser's zone is irrelevant by construction: every lookup names
  // Africa/Cairo. Proven in processes that actually run in another zone.
  const script = `
    import { serviceInstant, serviceToday, transportationPayload } from '${new URL('../services/transportation.js', import.meta.url).pathname}'
    process.stdout.write(JSON.stringify({
      winter: serviceInstant('2026-11-10', '10:00').iso,
      summer: serviceInstant('2026-07-10', '10:00').iso,
      today: serviceToday(new Date('2026-11-09T23:30:00Z')),
      payload: transportationPayload({ pickup_address: 'a', dropoff_address: 'b', date: '2026-11-10', time: '10:00', trip_type: 'One way', adults: 1, full_name: 'g', phone_number: '1012345678' }, '+20').pickup_at,
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }))`
  const seen = new Set()
  for (const TZ of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo', 'Africa/Cairo', 'Pacific/Kiritimati']) {
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ }, encoding: 'utf8' })
    const result = JSON.parse(output)
    assert.equal(result.winter, '2026-11-10T10:00:00+02:00', TZ)
    assert.equal(result.summer, '2026-07-10T10:00:00+03:00', TZ)
    assert.equal(result.payload, '2026-11-10T10:00:00+02:00', TZ)
    // 23:30 UTC on the 9th is already the 10th in Egypt, whatever the browser thinks.
    assert.equal(result.today, '2026-11-10', TZ)
    seen.add(result.zone)
  }
  assert.ok(seen.size > 1, 'the child processes must really have run in different zones')
  assert.equal(serviceToday(new Date('2026-11-09T21:00:00Z')), '2026-11-09')
})

test('rejected fields arrive under the form’s own field names, one message each', () => {
  assert.deepEqual(
    fieldErrors({
      pickup_location: ['The pickup location field is required.'],
      pickup_at: ['The pickup at field must be a date after now.'],
      return_at: 'A return time is not allowed on a one-way trip.',
      adults_count: ['too many', 'second'],
    }),
    {
      pickup_address: 'The pickup location field is required.',
      time: 'The pickup at field must be a date after now.',
      return_time: 'A return time is not allowed on a one-way trip.',
      adults: 'too many',
    },
  )
  // Both halves of the number land on the single input the form shows, and
  // the first message wins rather than the second overwriting it.
  assert.deepEqual(fieldErrors({ phone_country_code: ['bad code'], phone_number: ['bad number'] }), { phone_number: 'bad code' })
  // A field this form does not show would have nowhere to appear.
  assert.deepEqual(fieldErrors({ driver_id: ['nope'], price: [], full_name: '' }), {})
})

test('a recorded request reports ok with its reference, and the request matches the published contract', async () => {
  const calls = []
  const result = await withFetch(async (url, options) => { calls.push({ url, options }); return acknowledgement() },
    () => submitTransportationRequest('http://thevtravel-backend.test/api/public/', oneWay, '+20', 'fr'))

  assert.deepEqual(result, {
    status: 'ok', reference: 'TRN-2026-0001', bookingStatus: 'pending',
    pickupAt: '2026-11-10T08:00:00+00:00', submittedAt: '2026-10-27T09:00:00+00:00',
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'http://thevtravel-backend.test/api/public/transportation-bookings')
  assert.equal(calls[0].options.method, 'POST')
  assert.deepEqual(calls[0].options.query, { lang: 'fr' })
  assert.equal(calls[0].options.headers.Accept, 'application/json')
  // A retry could ask a dispatcher for the same car twice.
  assert.equal(calls[0].options.retry, 0)
  assert.equal(calls[0].options.body.pickup_at, '2026-11-10T10:00:00+02:00')
  // Nothing administrative is ever sent, whatever the form holds.
  for (const key of ['status', 'reference', 'price', 'driver_id', 'pickup_latitude']) {
    assert.equal(key in calls[0].options.body, false, key)
  }
})

test('a submitted request is never presented as a confirmed booking', async () => {
  const pending = await withFetch(async () => acknowledgement(), () => submitTransportationRequest('http://api.test', oneWay, '+20', 'en'))
  assert.equal(pending.bookingStatus, 'pending')
  // The status is carried through, never assumed: a value that is not
  // `pending` must not be shown as one, and is not rewritten to look like one.
  const other = await withFetch(async () => acknowledgement({ status: 'confirmed' }), () => submitTransportationRequest('http://api.test', oneWay, '+20', 'en'))
  assert.equal(other.bookingStatus, 'confirmed')
  // Nothing invented: no price reaches the caller even if the API grew one.
  assert.deepEqual(Object.keys(pending).sort(), ['bookingStatus', 'pickupAt', 'reference', 'status', 'submittedAt'])
})

test('no configured API base URL sends nothing and never hands out a reference', async () => {
  let called = false
  for (const apiBaseUrl of ['', undefined, null]) {
    assert.deepEqual(await withFetch(async () => { called = true; return acknowledgement() }, () => submitTransportationRequest(apiBaseUrl, oneWay, '+20', 'en')), { status: 'demo' })
  }
  assert.equal(called, false)
})

test('a rejection is reported as invalid with its fields, and never as sent', async () => {
  const rejection = Object.assign(new Error('422 Unprocessable Content'), {
    statusCode: 422,
    data: { message: 'The pickup at field must be a date after now.', errors: { pickup_at: ['The pickup at field must be a date after now.'], estimated_waiting_minutes: ['Waiting time cannot be given when no waiting was requested.'] } },
  })
  assert.deepEqual(await withFetch(async () => { throw rejection }, () => submitTransportationRequest('http://api.test', oneWay, '+20', 'de')), {
    status: 'invalid',
    errors: { time: 'The pickup at field must be a date after now.', waiting_minutes: 'Waiting time cannot be given when no waiting was requested.' },
  })
})

test('too many requests is its own outcome, so the guest is told to wait rather than to retry', async () => {
  for (const error of [
    Object.assign(new Error('429'), { statusCode: 429, data: { message: 'Too Many Attempts.' } }),
    Object.assign(new Error('429'), { response: { status: 429 } }),
  ]) {
    assert.deepEqual(await withFetch(async () => { throw error }, () => submitTransportationRequest('http://api.test', oneWay, '+20', 'en')), { status: 'throttled' })
  }
})

test('an unreachable API, a server failure and an unrecognised answer are all errors, never a success', async () => {
  assert.deepEqual(await withFetch(async () => { throw new Error('fetch failed') }, () => submitTransportationRequest('http://127.0.0.1:1/api/public', oneWay, '+20', 'en')), { status: 'error' })
  assert.deepEqual(await withFetch(async () => { throw Object.assign(new Error('500'), { statusCode: 500, data: { message: 'Server Error' } }) },
    () => submitTransportationRequest('http://api.test', oneWay, '+20', 'en')), { status: 'error' })

  // A 422 whose body names no field this form shows is not a field problem it can display.
  for (const data of [{}, { errors: { driver_id: ['nope'] } }]) {
    assert.deepEqual(await withFetch(async () => { throw Object.assign(new Error('422'), { statusCode: 422, data }) },
      () => submitTransportationRequest('http://api.test', oneWay, '+20', 'en')), { status: 'error' })
  }

  // The envelope says so itself, and a request with no reference is one the
  // guest cannot quote: neither is a success.
  for (const body of [{ success: false, message: 'Error.' }, acknowledgement({ reference: '' }), { success: true, data: {} }, {}, null, 'OK']) {
    assert.deepEqual(await withFetch(async () => body, () => submitTransportationRequest('http://api.test', oneWay, '+20', 'en')), { status: 'error' })
  }

  // $fetch absent altogether behaves exactly like a failed request.
  assert.deepEqual(await withFetch(undefined, () => submitTransportationRequest('http://api.test', oneWay, '+20', 'en')), { status: 'error' })
})

test('every string the transfer flow added is translated into all five site languages', () => {
  const added = [
    'All times are local to Egypt.', 'Return journey', 'Return date', 'Return time', 'Return drop-off location',
    'Same as pickup location', 'Ask the driver to wait between the two legs', 'Estimated waiting time (minutes)',
    'We can agree this on the phone', 'Driver waiting',
    'Yes', 'No', 'Your reference', 'Pending review',
    'Choose a pickup time in the future.', 'Choose a return time after the pickup time.',
    'Enter a waiting time between {min} and {max} minutes, or leave it blank.', '{minutes} minutes',
    'Nothing is booked yet. TheVTravel will contact you to confirm availability, your trip details and the final price in USD.',
    'Submitting this form sends a request. Nothing is booked until our team confirms it with you.',
    'Too many requests from this device. Please wait a minute and try again.',
    'Requests cannot be sent right now. Please contact us on WhatsApp instead.',
    'Your request could not be sent. Please check your connection and try again.',
  ]
  for (const key of added) {
    const entry = translations[key]
    assert.ok(entry, `missing translation entry: ${key}`)
    for (const language of ['ru', 'fr', 'de', 'zh']) {
      assert.equal(typeof entry[language], 'string', `${key} → ${language}`)
      assert.notEqual(entry[language].trim(), '', `${key} → ${language}`)
    }
  }
  // A parameterised string keeps its placeholders in every language, or the
  // number never reaches the guest.
  for (const [key, placeholders] of [['{minutes} minutes', ['{minutes}']], ['Enter a waiting time between {min} and {max} minutes, or leave it blank.', ['{min}', '{max}']]]) {
    for (const language of ['ru', 'fr', 'de', 'zh']) {
      for (const placeholder of placeholders) assert.ok(translations[key][language].includes(placeholder), `${key} → ${language} lost ${placeholder}`)
    }
  }
})
