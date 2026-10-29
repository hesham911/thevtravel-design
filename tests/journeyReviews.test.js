import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchJourneyReviews, fetchReviewContext, fetchTravelerMoments, submitJourneyReview } from '../services/journeyReviews.js'
import { mergeTravelers } from '../utils/journeyTravelers.js'

// $fetch is a Nuxt runtime global. Stubbing it here lets the service's own
// decisions — what is a dead link, what is a rejected review, what shape a
// page receives — be tested without a server.
function stubFetch(handler, { raw } = {}) {
  const previous = globalThis.$fetch
  const stub = handler ?? (async () => { throw new Error('$fetch was not expected here') })
  stub.raw = raw ?? stub
  globalThis.$fetch = stub
  return () => { globalThis.$fetch = previous }
}

function httpError(status, data) {
  const error = new Error(`Request failed with status code ${status}`)
  error.response = { status, _data: data }
  return error
}

const reviewPayload = (id, photos = []) => ({
  id,
  rating: 5,
  comment: 'A quiet morning on the west bank.',
  display_name: 'Sarah M.',
  travelled_on: '2026-11-10',
  published_at: '2026-11-12',
  is_verified: true,
  photos,
})

test('no configured API is demo mode, not a failure', async () => {
  assert.equal((await fetchReviewContext('', 'token')).status, 'demo')
  assert.equal((await fetchJourneyReviews(undefined, 'luxor')).status, 'demo')
  assert.equal((await fetchTravelerMoments('', 'luxor')).status, 'demo')
})

test('a page of reviews carries its own paging, so the tab knows whether there is another', async () => {
  const calls = []
  const restore = stubFetch(async (url, options) => {
    calls.push(options.query)

    return {
      data: [reviewPayload(1), reviewPayload(2)],
      summary: { average_rating: '4.5', count: 12, distribution: [8, 4, 0, 0, 0] },
      meta: { current_page: 1, last_page: 2, per_page: 10, total: 12 },
    }
  })

  try {
    const result = await fetchJourneyReviews('http://api.test', 'luxor', { page: 1, perPage: 10, language: 'en' })

    assert.equal(result.status, 'ok')
    assert.equal(result.reviews.length, 2)
    assert.equal(result.meta.last_page, 2)
    assert.equal(result.summary.count, 12)
    assert.deepEqual(calls[0], { lang: 'en', page: 1, per_page: 10 })
  } finally { restore() }
})

test('a review is mapped onto the shape the journey page has always rendered', async () => {
  const restore = stubFetch(async () => ({
    data: [reviewPayload(7, [{ id: 3, url: 'http://api.test/photo/3', alt: 'The valley at dawn' }])],
    meta: { current_page: 1, last_page: 1 },
  }))

  try {
    const [traveler] = (await fetchJourneyReviews('http://api.test', 'luxor', { language: 'en' })).reviews

    assert.equal(traveler.name, 'Sarah M.')
    // The month travelled, not the month reviewed.
    assert.equal(traveler.date, 'Nov 2026')
    assert.equal(traveler.rating, 5)
    assert.equal(traveler.isVerified, true)
    assert.deepEqual(traveler.photos, [{ type: 'image', src: 'http://api.test/photo/3', alt: 'The valley at dawn' }])
  } finally { restore() }
})

test('every unusable review link is reported the same way', async () => {
  const restore = stubFetch(async () => { throw httpError(404) })

  try {
    assert.equal((await fetchReviewContext('http://api.test', 'whatever')).status, 'unavailable')
    assert.equal((await submitJourneyReview('http://api.test', 'whatever', { rating: 5, comment: 'x' })).status, 'unavailable')
  } finally { restore() }
})

test('a rejected review names its fields, and an outage never reads as success', async () => {
  const rejected = stubFetch(async () => {
    throw httpError(422, { errors: { comment: ['Please share a few more words.'], rating: ['Required.'] } })
  })

  try {
    const result = await submitJourneyReview('http://api.test', 'token', { rating: 5, comment: 'Great' })

    assert.equal(result.status, 'invalid')
    assert.equal(result.errors.comment, 'Please share a few more words.')
  } finally { rejected() }

  const down = stubFetch(async () => { throw new Error('connect ECONNREFUSED') })

  try {
    const result = await submitJourneyReview('http://api.test', 'token', { rating: 5, comment: 'A fine morning out.' })

    assert.equal(result.status, 'error')
    assert.equal(result.created, undefined)
  } finally { down() }
})

test('a first submission is created; a repeat is accepted without creating a second', async () => {
  const first = stubFetch(null, {
    raw: async () => ({ status: 201, _data: { data: { travel_date: '2026-11-10', photos: [], review: { rating: 5, comment: 'Lovely.', photo_media_ids: [] } }, message: 'thanks' } }),
  })

  try {
    const result = await submitJourneyReview('http://api.test', 'token', { rating: 5, comment: 'Lovely morning out.' })
    assert.equal(result.status, 'ok')
    assert.equal(result.created, true)
  } finally { first() }

  const repeat = stubFetch(null, {
    raw: async () => ({ status: 200, _data: { data: { travel_date: '2026-11-10', photos: [], review: { rating: 5, comment: 'Lovely.', photo_media_ids: [] } }, message: 'already' } }),
  })

  try {
    const result = await submitJourneyReview('http://api.test', 'token', { rating: 1, comment: 'Trying again.' })
    assert.equal(result.status, 'ok')
    assert.equal(result.created, false)
  } finally { repeat() }
})

// ── The tab's own paging ─────────────────────────────────────────────────────

test('loading another page appends travelers without repeating one', () => {
  const pageOne = [reviewTraveler(1), reviewTraveler(2)]
  const pageTwo = [reviewTraveler(3)]

  const merged = mergeTravelers(pageOne, pageTwo, [])

  assert.deepEqual(merged.map(traveler => traveler.id), [1, 2, 3])

  // Pressing the button twice, or a retried request, must not double the list.
  assert.deepEqual(mergeTravelers(pageOne, [...pageTwo, ...pageTwo], []).map(t => t.id), [1, 2, 3])
})

test('a review that is also a traveler moment appears once, with its photos', () => {
  const withoutPhotos = reviewTraveler(5)
  const withPhotos = { ...reviewTraveler(5), photos: [{ src: 'a.jpg' }, { src: 'b.jpg' }] }

  const merged = mergeTravelers([withoutPhotos], [], [withPhotos])

  assert.equal(merged.length, 1)
  assert.equal(merged[0].photos.length, 2)

  // Whichever order they arrive in, the copy carrying the photographs wins.
  const other = mergeTravelers([withPhotos], [], [withoutPhotos])
  assert.equal(other.length, 1)
  assert.equal(other[0].photos.length, 2)
})

test('travelers with no id are kept rather than collapsed into one another', () => {
  const merged = mergeTravelers([{ name: 'A', photos: [] }, { name: 'B', photos: [] }])

  assert.equal(merged.length, 2)
})

function reviewTraveler(id) {
  return { id, name: `Traveler ${id}`, date: 'Nov 2026', rating: 5, text: 'Words.', photos: [] }
}
