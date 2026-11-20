const lifetime = 24 * 60 * 60 * 1000
const fields = ['adults', 'children', 'youngChildren', 'travelDate', 'country', 'fullName', 'phoneCountry', 'phoneCode', 'phoneNumber', 'email', 'notes', 'museum', 'currentStep']

export function journeyDraftKey(journey) {
  return JSON.stringify([journey.id ?? null, journey.slug, journey.countryCode ?? 'EG', journey.pricing?.age_bands ?? null])
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
