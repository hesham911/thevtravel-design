import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import translations from '../data/demoTranslations.json' with { type: 'json' }
import { journeyTravelerCategories, validJourneyChildAge, fetchJourneyPrice, submitJourneyBooking, travellersPayload } from '../services/journeyBookings.js'
import { formatUSD } from '../utils/currency.js'

const source = readFileSync(new URL('../components/journey/JourneyBookingFlow.vue', import.meta.url), 'utf8')
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
const ageBands = [
  { band: 'infant', min_age: 0, max_age: 4, multiplier: '0' },
  { band: 'child', min_age: 5, max_age: 12, multiplier: '0.5' },
  { band: 'adult', min_age: 13, max_age: null, multiplier: '1' },
]

// Exercise the component's real reactive logic with the same import-stubbing
// convention as TransferLocationField tests. API calls remain local fakes.
function form() {
  const run = new Function(
    'computed', 'nextTick', 'reactive', 'ref', 'watch', 'useI18n', 'useRuntimeConfig',
    'fetchJourneyPrice', 'submitJourneyBooking', 'journeyTravelerCategories', 'validJourneyChildAge',
    'formatUSD', 'useRequestOverlay', 'defineProps', 'defineEmits', 'defineExpose',
    `${script}\nreturn { state, childAges, youngChildAges, errors, travelers, dialog, open, validate, travellers, refreshQuote, quote, confirm, submitted };`,
  )
  const result = run(
    computed, nextTick, reactive, ref, watch, () => ({ locale: ref('en') }),
    () => ({ public: { apiBaseUrl: 'http://api.test' } }),
    fetchJourneyPrice, submitJourneyBooking, journeyTravelerCategories, validJourneyChildAge, formatUSD,
    () => ({ openOverlay: async () => {}, closeOverlay: () => {}, overlayClosed: () => {} }),
    () => ({ journey: { id: 1, slug: 'luxor', pricing: { age_bands: ageBands } } }),
    () => () => {}, () => {},
  )
  result.dialog.value = { querySelector: () => ({ focus() {} }), scrollTo() {} }
  return result
}

async function family() {
  const f = form()
  Object.assign(f.state, { children: 2, youngChildren: 2, travelDate: '2100-01-01', fullName: 'Example Guest', phoneNumber: '1012345678' })
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
  assert.deepEqual(f.travellers(), { adults: 2, children: [{ age: 5 }, { age: 12 }, { age: 0 }, { age: 4 }] })
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
    return { data: url.endsWith('price-quote') ? { total: '300.00', base_adult_price: '100.00' } : { reference: 'JNY-TEST', status: 'pending' } }
  }
  try {
    const f = await family()
    await f.refreshQuote()
    assert.equal(f.quote.value.total, '300.00')
    await f.confirm()
    assert.equal(f.state.currentStep, 4)
    assert.equal(f.submitted.value.reference, 'JNY-TEST')
    assert.equal(calls.length, 2)
    const party = { adults_count: 2, children: [{ age: 5 }, { age: 12 }, { age: 0 }, { age: 4 }] }
    assert.deepEqual(calls[0].body, { travel_date: '2100-01-01', ...party })
    assert.deepEqual(calls[1].body, { journey_id: 1, full_name: 'Example Guest', phone_country_code: '+20', phone_number: '1012345678', travel_date: '2100-01-01', ...party })
    assert.deepEqual(travellersPayload(f.travellers()), party)
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
