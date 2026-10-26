import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchJourney, fetchJourneys, toCard, toDetail } from '../services/journeys.js'

// $fetch is a Nuxt runtime global. Stubbing it here lets the service's own
// decisions — what is a 404, what is an outage, what shape a page receives —
// be tested without a server.
function stubFetch(handler) {
  const previous = globalThis.$fetch
  globalThis.$fetch = handler
  return () => { globalThis.$fetch = previous }
}

function httpError(status) {
  const error = new Error(`Request failed with status code ${status}`)
  error.response = { status }
  return error
}

test('no configured API is demo mode, not a failure', async () => {
  assert.equal((await fetchJourneys('')).status, 'demo')
  assert.equal((await fetchJourney(undefined, 'luxor-west-bank-at-dawn', 'en')).status, 'demo')
})

test('an unpublished or unknown journey is not-found, and never a fixture fallback', async () => {
  const restore = stubFetch(async () => { throw httpError(404) })
  try {
    const result = await fetchJourney('http://api.test', 'secret-journey', 'en')
    assert.equal(result.status, 'not-found')
    assert.equal(result.journey, undefined)
  } finally { restore() }
})

test('an unreachable API is an error the page can show, not an empty catalogue', async () => {
  const restore = stubFetch(async () => { throw new Error('connect ECONNREFUSED') })
  try {
    const result = await fetchJourneys('http://api.test', { language: 'zh' })
    assert.equal(result.status, 'error')
    assert.equal(result.journeys, undefined)
  } finally { restore() }
})

test('a 500 is an outage rather than a missing journey', async () => {
  const restore = stubFetch(async () => { throw httpError(500) })
  try {
    assert.equal((await fetchJourney('http://api.test', 'luxor', 'en')).status, 'error')
  } finally { restore() }
})

test('filters and the language are sent as query parameters, and blank ones are omitted', async () => {
  let seen = null
  const restore = stubFetch(async (url, options) => { seen = { url, query: options.query }; return { data: [], meta: null } })
  try {
    await fetchJourneys('http://api.test/', { destination: 'luxor', sort: 'price-asc', page: 2, perPage: 9, language: 'fr' })
    assert.equal(seen.url, 'http://api.test/journeys')
    assert.deepEqual(seen.query, { lang: 'fr', destination: 'luxor', sort: 'price-asc', page: 2, per_page: 9 })
    assert.ok(!('interest' in seen.query))
  } finally { restore() }
})

test('a card carries no rating, because there is no review module to produce one', () => {
  const card = toCard({
    id: 1, slug: 'luxor-west-bank-at-dawn', title: 'Luxor, west bank at dawn',
    short_description: 'Morning light.', duration: '~ 4 hours',
    destination: { slug: 'luxor', name: 'Luxor' }, interest: { slug: 'culture-history', name: 'Culture & History', icon: 'landmark' },
    image: { url: 'https://cdn.test/colossi.png', alt: 'The Colossi of Memnon', position: 'center' },
    price: { amount: '3200.00', currency: 'USD' }, tags: ['Private journey'], badge: null,
    details_path: '/journeys/luxor-west-bank-at-dawn',
  })

  assert.equal(card.averageRating, null)
  assert.equal(card.reviewCount, 0)
  assert.equal(card.price, 3200)
  assert.equal(card.destination, 'Luxor')
  assert.equal(card.detailsHref, '/journeys/luxor-west-bank-at-dawn')
})

test('a journey with no price is on request rather than free', () => {
  assert.equal(toCard({ slug: 'x', price: { amount: null, currency: 'USD' } }).price, null)
})

test('a detail payload never carries travelers, a rating or a distribution', () => {
  const detail = toDetail({
    slug: 'luxor-west-bank-at-dawn', title: 'Luxor, west bank at dawn', has_detail_content: true,
    guide_languages: [{ code: 'en', name: 'Anglais' }, { code: 'fr', name: 'Français' }],
    overview: { body: 'Begin at sunrise.', features: [{ icon: 'sun', title: 'Iconic sites', description: 'Tombs and temples' }] },
    itinerary: { heading: 'Itinéraire', intro: 'Line one\nLine two', stops: [{ time: '07:00', title: 'Pick-up', description: 'At your hotel' }], media: null },
    included: { heading: 'Inclus', intro: '', items: [] },
    gallery: { intro: 'Photos', photos: [{ url: 'https://cdn.test/a.png', alt: 'A' }] },
    good_to_know: { heading: 'Bon à savoir', intro: '', items: [] },
    price: { amount: '3200.00', currency: 'USD' },
  })

  assert.deepEqual(detail.travelers, [])
  assert.deepEqual(detail.distribution, [])
  assert.equal(detail.rating, null)
  assert.equal(detail.reviewCount, 0)
  // The guide's languages are joined for the hero's fact line; they are the
  // guide's, not the website's.
  assert.equal(detail.language, 'Anglais, Français')
  assert.equal(detail.catalogOnly, false)
  assert.deepEqual(detail.itinerary[0], ['07:00', 'Pick-up', 'At your hotel'])
  assert.equal(detail.features[0].text, 'Tombs and temples')
  assert.equal(detail.gallery[0].src, 'https://cdn.test/a.png')
})

test('a journey with no detail sections written is catalogue-only and falls back to its card description', () => {
  const detail = toDetail({
    slug: 'karnak-by-night', title: 'Karnak by Night', short_description: 'An evening at Karnak.',
    has_detail_content: false, overview: { body: null, features: [] },
    itinerary: { stops: [], media: null }, included: { items: [] }, gallery: { photos: [] }, good_to_know: { items: [] },
    price: { amount: '1750.00', currency: 'USD' },
  })

  assert.equal(detail.catalogOnly, true)
  assert.equal(detail.overview, 'An evening at Karnak.')
  assert.deepEqual(detail.gallery, [])
  assert.equal(detail.itineraryMedia, null)
})
