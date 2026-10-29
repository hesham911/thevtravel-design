import test from 'node:test'
import assert from 'node:assert/strict'
import { REVIEW_LIMITS, lookupJourneyReview, reviewErrors, reviewPayload, submitJourneyReview } from '../utils/journeyReview.js'

test('a review token resolves to its booking, or to nothing at all', () => {
  const open = lookupJourneyReview('demo-luxor-dawn')
  assert.equal(open.status, 'open')
  assert.equal(open.booking.photos.length, 6)
  // A customer never sees a price or a payment through this page, so the
  // record behind the token carries none.
  assert.deepEqual(Object.keys(open.booking), ['journey', 'photos', 'review'])
  assert.deepEqual(Object.keys(open.booking.journey).sort(), ['date', 'image', 'location', 'summary', 'title'])

  // A booking whose photos are not uploaded yet is still open for a review.
  const noPhotos = lookupJourneyReview('demo-no-photos')
  assert.equal(noPhotos.status, 'open')
  assert.deepEqual(noPhotos.photos, undefined)
  assert.deepEqual(noPhotos.booking.photos, [])

  assert.equal(lookupJourneyReview('demo-reviewed').status, 'submitted')

  // Anything else is a dead link, including an inherited property name.
  for (const token of ['', '   ', undefined, null, 'not-a-token', 'toString', '__proto__']) {
    assert.deepEqual(lookupJourneyReview(token), { status: 'invalid', booking: null }, `${token} is not a booking`)
  }
})

test('a rating is required and the comment is asked for in a few words', () => {
  assert.deepEqual(reviewErrors({ rating: 0, comment: '' }), {
    rating: 'Please choose a star rating for your journey.',
    comment: 'Please tell us how your journey went.',
  })
  // A rating outside the five stars, or no integer at all, is no rating.
  for (const rating of [6, -1, 2.5, 'five', null]) {
    assert.equal(reviewErrors({ rating, comment: 'A calm morning on the west bank.' }).rating, 'Please choose a star rating for your journey.')
  }
  assert.deepEqual(reviewErrors({ rating: 4, comment: 'Lovely' }), { comment: 'Please share a few more words about your journey.' })
  assert.deepEqual(reviewErrors({ rating: 4, comment: 'x'.repeat(REVIEW_LIMITS.comment + 1) }), { comment: 'Please use {max} characters or fewer.' })
  // Whitespace is not a comment, and the limits are measured after trimming.
  assert.equal(reviewErrors({ rating: 4, comment: '        ' }).comment, 'Please tell us how your journey went.')
  assert.deepEqual(reviewErrors({ rating: 5, comment: `  ${'x'.repeat(REVIEW_LIMITS.comment)}  ` }), {})
  assert.deepEqual(reviewErrors({ rating: 1, comment: 'The morning did not go as we hoped.' }), {})
})

test('a submitted review carries the rating, the trimmed comment and only this booking’s photos', () => {
  const { booking } = lookupJourneyReview('demo-luxor-dawn')
  assert.deepEqual(
    reviewPayload({ rating: 5, comment: '  An unforgettable morning.  ', photoIds: ['bp-2', 'bp-2', 'bp-404'] }, booking),
    { rating: 5, comment: 'An unforgettable morning.', photoIds: ['bp-2'] },
  )
  // Choosing photos is optional, and a booking may have none to choose.
  assert.deepEqual(reviewPayload({ rating: 4, comment: 'Thank you.' }, booking).photoIds, [])
  assert.deepEqual(reviewPayload({ rating: 4, comment: 'Thank you.', photoIds: ['bp-1'] }, lookupJourneyReview('demo-no-photos').booking).photoIds, [])
})

test('the simulated submission resolves with the review the page then shows', async () => {
  const { booking } = lookupJourneyReview('demo-luxor-dawn')
  const result = await submitJourneyReview({ rating: 5, comment: 'A morning we keep talking about.', photoIds: ['bp-3', 'bp-1'] }, booking, { delay: 0 })
  assert.equal(result.status, 'ok')
  assert.equal(result.review.rating, 5)
  assert.equal(result.review.comment, 'A morning we keep talking about.')
  // The booking's own order, not the order they were tapped in.
  assert.deepEqual(result.review.photoIds, ['bp-1', 'bp-3'])
  assert.match(result.review.submittedAt, /^\d{4}-\d{2}-\d{2}$/)

  // Nothing is stored: the booking is still open for a review afterwards.
  assert.equal(lookupJourneyReview('demo-luxor-dawn').status, 'open')
})
