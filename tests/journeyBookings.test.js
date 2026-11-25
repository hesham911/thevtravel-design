import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import translations from '../data/demoTranslations.json' with { type: 'json' }
import { journeyTravelerCategories, validJourneyChildAge, fetchJourneyPrice, submitJourneyBooking, travellersPayload, journeyBookingTypes, journeyBookingTypeFor, journeyPartySizeAccepted } from '../services/journeyBookings.js'
import { formatUSD } from '../utils/currency.js'

const source = readFileSync(new URL('../components/journey/JourneyBookingFlow.vue', import.meta.url), 'utf8')
// `new Function` cannot hold `import.meta`, which the component uses to tell
// client from server. Rewritten to a plain flag rather than stripped, so the
// branch it guards is exercised as it is on a browser.
const script = source
  .match(/<script setup>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*$/gm, '')
  .replace(/import\.meta\.client/g, 'true')
  .replace(/import\.meta\.server/g, 'false')
const ageBands = [
  { band: 'infant', min_age: 0, max_age: 4, multiplier: '0' },
  { band: 'child', min_age: 5, max_age: 12, multiplier: '0.5' },
  { band: 'adult', min_age: 13, max_age: null, multiplier: '1' },
]
// What the detail endpoint reports: the party limits the backend enforces,
// so the form validates the same bounds rather than a copy of them.
const bookingTypePayload = [
  { value: 'private', min_travelers: 1, max_travelers: 3, shares_vehicle: false },
  { value: 'group', min_travelers: 4, max_travelers: 16, shares_vehicle: true },
]

// Exercise the component's real reactive logic with the same import-stubbing
// convention as TransferLocationField tests. API calls remain local fakes.
function form() {
  const run = new Function(
    'computed', 'nextTick', 'reactive', 'ref', 'watch', 'useI18n', 'useRuntimeConfig', 'useState',
    'captureJourneyDraft', 'restoreJourneyDraft',
    'fetchJourneyPrice', 'submitJourneyBooking', 'journeyTravelerCategories', 'validJourneyChildAge',
    'journeyBookingTypes', 'journeyBookingTypeFor', 'journeyPartySizeAccepted',
    'requiresMuseumChoice', 'museumBookingNotes',
    'formatUSD', 'useRequestOverlay', 'defineProps', 'defineEmits', 'defineExpose',
    `${script}\nreturn { state, childAges, youngChildAges, errors, travelers, dialog, open, validate, travellers, refreshQuote, quote, quoteError, quoteStale, confirm, submitted, submitError, bookingTypes, bookingType, partySize, partyFull, bookable, mobileTitle };`,
  )
  const result = run(
    computed, nextTick, reactive, ref, watch, () => ({ locale: ref('en') }),
    () => ({ public: { apiBaseUrl: 'http://api.test' } }),
    () => ref(null),
    () => null, () => null,
    fetchJourneyPrice, submitJourneyBooking, journeyTravelerCategories, validJourneyChildAge,
    journeyBookingTypes, journeyBookingTypeFor, journeyPartySizeAccepted,
    () => false, (_, notes) => notes,
    formatUSD,
    () => ({ openOverlay: async () => {}, closeOverlay: () => {}, overlayClosed: () => {} }),
    () => ({ journey: { id: 1, slug: 'luxor', pricing: { age_bands: ageBands, booking_types: bookingTypePayload, bookable: true } } }),
    () => () => {}, () => {},
  )
  result.dialog.value = { querySelector: () => ({ focus() {} }), scrollTo() {} }
  return result
}

/**
 * Two adults, two children and two under-fives: six travellers.
 *
 * Six is a Group party, and the type is set explicitly rather than inferred
 * — which is the rule under test in half of what follows. Every one of the
 * six counts toward the party and the vehicle; only four of them pay.
 */
async function family() {
  const f = form()
  Object.assign(f.state, { bookingType: 'group', children: 2, youngChildren: 2, travelDate: '2100-01-01', fullName: 'Example Guest', phoneNumber: '1012345678' })
  await nextTick()
  f.childAges.value = [5, 12]
  f.youngChildAges.value = [0, 4]
  return f
}

test('the three journey categories follow the API age policy, with no overlaps at 4, 5, 12 and 13', () => {
  const categories = journeyTravelerCategories(ageBands)
  assert.deepEqual(categories.map(c => c.label), ['Adults (13+)', 'Children (5–12)', 'Young Children (under 5)'])
  for (const [age, expected] of [[4, 'youngChildren'], [5, 'children'], [12, 'children'], [13, 'adults']]) {
    assert.deepEqual(categories.filter(c => age >= c.minAge && (c.maxAge === null || age <= c.maxAge)).map(c => c.key), [expected])
  }
  assert.deepEqual(journeyTravelerCategories().map(c => [c.minAge, c.maxAge]), [[13, null], [5, 12], [0, 4]])
  assert.equal(journeyTravelerCategories([{ band: 'child', min_age: 6, max_age: 11 }])[1].minAge, 6)
})

test('age inputs require whole ages in their selected child category', () => {
  const [, child, young] = journeyTravelerCategories(ageBands)
  for (const age of [5, '5', 12]) assert.equal(validJourneyChildAge(age, child), true)
  for (const age of [0, '0', 4]) assert.equal(validJourneyChildAge(age, young), true)
  for (const age of [null, '', undefined, -1, 4, 13, 5.5, 'bad']) assert.equal(validJourneyChildAge(age, child), false)
  for (const age of [null, '', undefined, -1, 5, 12, 13, 0.5, 'bad']) assert.equal(validJourneyChildAge(age, young), false)
})

test('both child groups retain individual ages and valid state when moving through the form', async () => {
  const f = await family()
  assert.equal(await f.validate(1), true)
  assert.deepEqual(f.travellers(), { bookingType: 'group', adults: 2, children: [{ age: 5 }, { age: 12 }, { age: 0 }, { age: 4 }] })
  f.state.children++
  await nextTick()
  assert.deepEqual(f.childAges.value, [5, 12, null])
  assert.equal(await f.validate(1), false)
  f.state.children--
  await nextTick()
  assert.deepEqual(f.childAges.value, [5, 12])
  assert.deepEqual(f.youngChildAges.value, [0, 4])
  assert.equal(await f.validate(1), true)
  await f.open()
  await nextTick()
  assert.deepEqual(f.childAges.value, [])
  assert.deepEqual(f.youngChildAges.value, [])
  assert.equal(f.state.youngChildren, 0)
})

test('quotes and submitted bookings send the same real ages and never a frontend price', async () => {
  const original = globalThis.$fetch
  const calls = []
  globalThis.$fetch = async (url, options) => {
    calls.push({ url, ...options })
    return {
      data: url.endsWith('price-quote')
        ? { total: '300.00', base_adult_price: '100.00', adult_price: '100.00', quote_token: 'token-abc', booking_type: 'group', traveler_count: 6 }
        : { reference: 'JNY-TEST', status: 'pending' },
    }
  }
  try {
    const f = await family()
    await f.refreshQuote()
    assert.equal(f.quote.value.total, '300.00')
    await f.confirm()
    assert.equal(f.state.currentStep, 4)
    assert.equal(f.submitted.value.reference, 'JNY-TEST')
    assert.equal(calls.length, 2)
    // The type is sent on both calls and the total is sent as a CHECK: the
    // backend counts the party itself and refuses a figure that disagrees.
    const party = { booking_type: 'group', adults_count: 2, children: [{ age: 5 }, { age: 12 }, { age: 0 }, { age: 4 }], travelers_count: 6 }
    assert.deepEqual(calls[0].body, { travel_date: '2100-01-01', ...party })
    assert.deepEqual(calls[1].body, { journey_id: 1, full_name: 'Example Guest', phone_country_code: '+20', phone_number: '1012345678', travel_date: '2100-01-01', quote_token: 'token-abc', ...party })
    assert.deepEqual(travellersPayload(f.travellers()), party)
    // Still no price field anywhere in either body.
    for (const call of calls) {
      for (const field of ['total', 'price', 'adult_price', 'base_adult_price', 'original_price_amount', 'final_price_amount']) {
        assert.equal(field in call.body, false, `${field} must never be sent`)
      }
    }
  } finally { globalThis.$fetch = original }
})

test('a five-year-old cannot be submitted as a free young child and a thirteen-year-old cannot use the child category', async () => {
  const f = await family()
  f.youngChildAges.value[0] = 5
  await f.confirm()
  assert.equal(f.state.currentStep, 1)
  assert.ok(f.errors.value.childAges)
  f.youngChildAges.value[0] = 4
  f.childAges.value[0] = 13
  assert.equal(await f.validate(1), false)
})

test('server child validation errors return to the age fields without clearing the family', async () => {
  const original = globalThis.$fetch
  globalThis.$fetch = async () => { throw Object.assign(new Error('422'), { statusCode: 422, data: { errors: { 'children.3.age': ['Check the age.'] } } }) }
  try {
    const f = await family()
    f.state.currentStep = 3
    await f.confirm()
    assert.equal(f.state.currentStep, 1)
    assert.deepEqual(f.childAges.value, [5, 12])
    assert.deepEqual(f.youngChildAges.value, [0, 4])
  } finally { globalThis.$fetch = original }
})

test('journey categories, prices, age fields and accessible controls are translated in every supported locale', () => {
  const categories = journeyTravelerCategories()
  const labels = categories.flatMap(c => [c.label, c.description, `${c.label} count`, `Add one ${c.single}`, `Remove one ${c.single}`])
  labels.push('Age on the journey', 'Child', 'Young child', 'Ages', 'Enter each child’s age within the selected age range.')
  for (const label of labels) for (const locale of ['ru', 'fr', 'de', 'zh']) assert.ok(translations[label]?.[locale], `${label}: ${locale}`)
})

// ── Private and Group ────────────────────────────────────────────────────────
// The two are different promises about the vehicle, so the type is the
// customer's choice and the form must never substitute it. These tests are
// the frontend half of that rule; the backend refuses a mismatch regardless.

test('the booking types and their party limits come from the API, not from the frontend', () => {
  const types = journeyBookingTypes(bookingTypePayload)

  assert.deepEqual(types.map(type => [type.value, type.minTravelers, type.maxTravelers, type.sharesVehicle]), [
    ['private', 1, 3, false],
    ['group', 4, 16, true],
  ])

  // A journey payload that is reshaped or renamed must not silently widen the
  // limits: the fallbacks stay in step with the backend's own config.
  assert.deepEqual(journeyBookingTypes().map(type => [type.minTravelers, type.maxTravelers]), [[1, 3], [4, 16]])

  // Sharing is named in the option itself rather than left to the terms.
  assert.match(types[1].detail, /shared vehicle/i)
  assert.match(types[0].detail, /Nobody else joins/i)
})

test('a party size is accepted only within the chosen type', () => {
  const [priv, group] = journeyBookingTypes(bookingTypePayload)

  for (const size of [1, 2, 3]) assert.equal(journeyPartySizeAccepted(priv, size), true)
  for (const size of [0, 4, 17]) assert.equal(journeyPartySizeAccepted(priv, size), false)
  for (const size of [4, 8, 9, 16]) assert.equal(journeyPartySizeAccepted(group, size), true)
  for (const size of [3, 17]) assert.equal(journeyPartySizeAccepted(group, size), false)
  assert.equal(journeyPartySizeAccepted(null, 2), false)
})

test('every traveller counts toward the party, infants included', async () => {
  const f = await family()

  // Two adults, two children and two under-fives.
  assert.equal(f.partySize.value, 6)

  f.state.youngChildren = 0
  await nextTick()
  assert.equal(f.partySize.value, 4)
})

test('a private booking of four travellers is refused rather than made a group', async () => {
  const f = form()
  Object.assign(f.state, { bookingType: 'private', adults: 3, children: 1, travelDate: '2100-01-01' })
  await nextTick()
  f.childAges.value = [8]

  assert.equal(await f.validate(1), false)
  assert.match(f.errors.value.bookingType, /Too many travelers/)
  // The choice is left exactly as the customer made it.
  assert.equal(f.state.bookingType, 'private')
})

test('a group booking below four travellers is refused rather than made private', async () => {
  const f = form()
  Object.assign(f.state, { bookingType: 'group', adults: 2, travelDate: '2100-01-01' })
  await nextTick()

  assert.equal(await f.validate(1), false)
  assert.match(f.errors.value.bookingType, /Not enough travelers/)
  assert.equal(f.state.bookingType, 'group')
})

test('the counters stop at the chosen type’s ceiling', async () => {
  const f = form()
  Object.assign(f.state, { bookingType: 'private', adults: 2, travelDate: '2100-01-01' })
  await nextTick()
  assert.equal(f.partyFull.value, false)

  f.state.adults = 3
  await nextTick()
  // Three is the private ceiling: the plus buttons are disabled from here.
  assert.equal(f.partyFull.value, true)

  f.state.bookingType = 'group'
  await nextTick()
  // Group raises it to sixteen, so the same party is no longer at the limit —
  // though three travellers is now too FEW for Group, which validation says.
  assert.equal(f.partyFull.value, false)
  assert.equal(await f.validate(1), false)
})

test('changing the party or the type drops the quote on screen', async () => {
  const original = globalThis.$fetch
  globalThis.$fetch = async () => ({ data: { total: '750.00', base_adult_price: '125.00', quote_token: 'token-abc' } })
  try {
    const f = await family()
    await f.refreshQuote()
    assert.equal(f.quote.value.total, '750.00')

    // A price for six travellers is not a price for seven. Dropped rather
    // than left on screen attached to a party that no longer matches.
    f.state.adults = 3
    await nextTick()
    assert.equal(f.quote.value, null)
  } finally { globalThis.$fetch = original }
})

test('a price that moved while the form was open sends the customer back to review it', async () => {
  const original = globalThis.$fetch
  let quotes = 0
  globalThis.$fetch = async (url) => {
    if (url.endsWith('price-quote')) {
      quotes++

      return { data: { total: quotes === 1 ? '750.00' : '810.00', base_adult_price: '135.00', quote_token: `token-${quotes}` } }
    }

    // The backend answers 409 Conflict: nothing the customer typed is wrong,
    // and nothing was recorded.
    throw Object.assign(new Error('409'), {
      statusCode: 409,
      data: { message: 'The price for this journey has been updated. Please review the new price before confirming.' },
    })
  }
  try {
    const f = await family()
    await f.refreshQuote()
    f.state.currentStep = 3
    await f.confirm()

    // Not confirmed, not an invalid-field error, and the new figure is on
    // screen for them to accept.
    assert.equal(f.submitted.value, null)
    assert.equal(f.state.currentStep, 3)
    assert.equal(f.quoteStale.value, true)
    assert.match(f.submitError.value, /price for this journey has been updated/i)
    assert.equal(f.quote.value.total, '810.00')
    assert.deepEqual(f.errors.value, {})
  } finally { globalThis.$fetch = original }
})

test('a journey with no configured costs reports why instead of showing no price', async () => {
  const original = globalThis.$fetch
  globalThis.$fetch = async () => {
    throw Object.assign(new Error('422'), {
      statusCode: 422,
      data: { message: 'This journey cannot be quoted yet. Still to be configured: Minibus and driver, per departure (EGP).' },
    })
  }
  try {
    const f = await family()
    await f.refreshQuote()

    assert.equal(f.quote.value, null)
    assert.match(f.quoteError.value, /cannot be quoted yet/i)
  } finally { globalThis.$fetch = original }
})

test('a quote is not requested for a party the chosen type cannot take', async () => {
  const original = globalThis.$fetch
  let calls = 0
  globalThis.$fetch = async () => { calls++; return { data: {} } }
  try {
    const f = form()
    Object.assign(f.state, { bookingType: 'private', adults: 6, travelDate: '2100-01-01' })
    await nextTick()
    await f.refreshQuote()

    // Nothing is asked of the backend for a party it would refuse; the form
    // says so first.
    assert.equal(calls, 0)
    assert.equal(f.quote.value, null)
  } finally { globalThis.$fetch = original }
})

test('the booking type survives a locale change mid-booking', async () => {
  const { captureJourneyDraft, restoreJourneyDraft } = await import('../services/journeyDraft.js')
  const journey = { id: 1, slug: 'luxor', countryCode: 'EG', pricing: { age_bands: ageBands, booking_types: bookingTypePayload } }
  const state = { bookingType: 'group', adults: 4, children: 0, youngChildren: 0, travelDate: '2100-01-01', country: 'EG', fullName: 'Guest', phoneCountry: 'EG', phoneCode: '+20', phoneNumber: '1012345678', email: '', notes: '', museum: '', currentStep: 2 }

  const draft = captureJourneyDraft(journey, state, [], [])
  const restored = restoreJourneyDraft(journey, draft)

  // The locale is not part of the draft key, so switching language keeps the
  // form — and the customer's own choice of vehicle comes back with it.
  assert.equal(restored.bookingType, 'group')
  assert.equal(restored.adults, 4)

  // A change to the booking-type policy under the customer DOES invalidate
  // the draft: it describes a party that can no longer be priced that way.
  const narrower = { ...journey, pricing: { ...journey.pricing, booking_types: [{ value: 'private', min_travelers: 1, max_travelers: 3, shares_vehicle: false }] } }
  assert.equal(restoreJourneyDraft(narrower, draft), null)
})


test('the acknowledged booking has a translated mobile heading instead of an empty fourth step', () => {
  const booking = form()
  booking.state.currentStep = 4
  assert.equal(booking.mobileTitle.value, 'Thank you — your request is with us.')
  for (const locale of ['fr', 'de', 'ru', 'zh', 'uk']) {
    assert.ok(translations[booking.mobileTitle.value]?.[locale], `Missing ${locale} acknowledgement`)
  }
})


test('the missing minibus cost message is available in every public language', () => {
  const message = 'This journey cannot be quoted yet. Still to be configured: Minibus and driver, per departure (EGP).'
  for (const locale of ['fr', 'de', 'ru', 'zh', 'uk']) {
    assert.ok(translations[message]?.[locale], `Missing ${locale} minibus message`)
  }
})
