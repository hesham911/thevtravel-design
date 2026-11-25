const lifetime = 24 * 60 * 60 * 1000
// `bookingType` is part of the draft: it is the customer's choice about the
// vehicle, and losing it on a locale change would silently reset them to
// Private — which is exactly the kind of quiet reclassification the backend
// refuses to do.
const fields = ['bookingType', 'adults', 'children', 'youngChildren', 'travelDate', 'country', 'fullName', 'phoneCountry', 'phoneCode', 'phoneNumber', 'email', 'notes', 'museum', 'currentStep']

/**
 * What makes a draft belong to this journey as it is now.
 *
 * The locale is deliberately absent, so switching language mid-booking keeps
 * the form. The age bands and the booking types ARE part of it: if either
 * policy changes under the customer, the old draft describes a party that
 * can no longer be priced the way it was, and dropping it is safer than
 * restoring it.
 */
export function journeyDraftKey(journey) {
  return JSON.stringify([
    journey.id ?? null,
    journey.slug,
    journey.countryCode ?? 'EG',
    journey.pricing?.age_bands ?? null,
    journey.pricing?.booking_types ?? null,
  ])
}

export function captureJourneyDraft(journey, state, childAges, youngChildAges, now = Date.now()) {
  return {
    key: journeyDraftKey(journey), updatedAt: now,
    state: Object.fromEntries(fields.map(field => [field, state[field]])),
    childAges: [...childAges], youngChildAges: [...youngChildAges],
  }
}

export function restoreJourneyDraft(journey, draft, now = Date.now()) {
  if (!draft || draft.key !== journeyDraftKey(journey) || now - draft.updatedAt >= lifetime || draft.updatedAt > now || draft.state.currentStep === 4) return null
  const date = draft.state.travelDate
  if (date && date < new Date(now).toISOString().slice(0, 10)) return null
  return { ...draft.state, currentStep: Math.min(3, Math.max(1, draft.state.currentStep)), childAges: [...draft.childAges], youngChildAges: [...draft.youngChildAges] }
}
