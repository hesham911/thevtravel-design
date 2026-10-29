// The customer review a Journey Booking's QR code or WhatsApp link opens.
//
// Everything here is local: the records come from `data/journeyReviewBookings`
// and a submission resolves against them, so the page can be designed and
// checked before the review API exists. No endpoint is assumed and nothing
// leaves the browser. `lookupJourneyReview` and `submitJourneyReview` are the
// two seams to replace once it does.
import { journeyReviewBookings } from '../data/journeyReviewBookings.js'

/** What the comment field accepts, so the form can say what is too short or too long. */
export const REVIEW_LIMITS = Object.freeze({ commentMinimum: 15, comment: 1500 })

/**
 * The booking behind a review token.
 *
 * @returns {{ status: 'open'|'submitted'|'invalid', booking: object|null }}
 *   'open'      — the booking exists and has no review yet: show the form.
 *   'submitted' — a review has already been shared for this booking.
 *   'invalid'   — no booking carries this token, so there is nothing to review.
 */
export function lookupJourneyReview(token) {
  const key = String(token ?? '').trim()
  const booking = Object.hasOwn(journeyReviewBookings, key) ? journeyReviewBookings[key] : null
  if (!booking) return { status: 'invalid', booking: null }
  return { status: booking.review ? 'submitted' : 'open', booking }
}

/**
 * The form's own rules. A star rating is required; the comment is the
 * customer's story and is asked for in full sentences rather than a word.
 * Selected photos are always optional — a booking may have none at all.
 *
 * The limits may be overridden with the ones the API served for this
 * booking, so the counter under the box and the rule the API enforces can
 * never drift apart.
 *
 * @param {{ rating: number, comment: string }} draft
 * @param {{ commentMinimum?: number, comment?: number }} limits
 * @returns {Record<string, string>} one message per rejected field
 */
export function reviewErrors(draft, limits = REVIEW_LIMITS) {
  const minimum = limits?.commentMinimum ?? REVIEW_LIMITS.commentMinimum
  const maximum = limits?.comment ?? REVIEW_LIMITS.comment
  const errors = {}
  const rating = Number(draft?.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Please choose a star rating for your journey.'
  }
  const comment = String(draft?.comment ?? '').trim()
  if (!comment) errors.comment = 'Please tell us how your journey went.'
  else if (comment.length < minimum) errors.comment = 'Please share a few more words about your journey.'
  else if (comment.length > maximum) errors.comment = 'Please use {max} characters or fewer.'
  return errors
}

/**
 * What a submitted review would carry: the rating, the trimmed comment and the
 * ids of the booking photos the customer chose, in the booking's own order.
 * An id the booking does not hold is dropped, so a stale selection cannot
 * travel with the review.
 *
 * @param {{ rating: number, comment: string, photoIds: string[] }} draft
 * @param {{ photos?: Array<{ id: string }> }} booking
 */
export function reviewPayload(draft, booking) {
  const chosen = new Set(draft?.photoIds ?? [])
  return {
    rating: Number(draft?.rating) || 0,
    comment: String(draft?.comment ?? '').trim(),
    photoIds: (booking?.photos ?? []).map(photo => photo.id).filter(id => chosen.has(id)),
  }
}

/**
 * A simulated submission, for the frontend prototype only: it resolves with
 * the review the page then shows, after a short pause so the sending state is
 * real rather than decorative. Nothing is stored and nothing is sent.
 *
 * @returns {Promise<{ status: 'ok', review: object }>}
 */
export function submitJourneyReview(draft, booking, { delay = 700 } = {}) {
  const review = { ...reviewPayload(draft, booking), submittedAt: new Date().toISOString().slice(0, 10) }
  return new Promise(resolve => {
    if (!delay) { resolve({ status: 'ok', review }); return }
    setTimeout(() => resolve({ status: 'ok', review }), delay)
  })
}
