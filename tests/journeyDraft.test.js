import test from 'node:test'
import assert from 'node:assert/strict'
import { captureJourneyDraft, restoreJourneyDraft } from '../services/journeyDraft.js'
const journey = { id: 5, slug: 'nile', pricing: { age_bands: { child: 10 } } }
const now = Date.parse('2026-11-14T12:00:00Z')
const state = { adults: 3, children: 1, youngChildren: 1, travelDate: '2026-12-15', country: 'FR', fullName: 'Guest', currentStep: 2, cardNumber: 'NEVER STORE' }

test('locale remount and reopening preserve all selected trip fields and child ages', () => {
  const draft = captureJourneyDraft(journey, state, [8], [2], now)
  const restored = restoreJourneyDraft({ ...journey, title: 'Voyage sur le Nil' }, draft, now + 1000)
  assert.equal(restored.adults, 3)
  assert.equal(restored.travelDate, state.travelDate)
  assert.equal(restored.country, 'FR')
  assert.equal(restored.currentStep, 2)
  assert.deepEqual(restored.childAges, [8])
  assert.deepEqual(restored.youngChildAges, [2])
  assert.equal('cardNumber' in draft.state, false)
  restored.childAges[0] = 9
  assert.equal(draft.childAges[0], 8)
})
test('different journeys and incompatible age bands never reuse the previous draft', () => {
  const draft = captureJourneyDraft(journey, state, [8], [2], now)
  for (const other of [{ ...journey, id: 6 }, { ...journey, slug: 'luxor' }, { ...journey, pricing: { age_bands: {} } }]) assert.equal(restoreJourneyDraft(other, draft, now), null)
})
test('expired, past date and completed drafts are discarded', () => {
  const draft = captureJourneyDraft(journey, state, [8], [2], now)
  assert.equal(restoreJourneyDraft(journey, draft, now + 86400000), null)
  assert.equal(restoreJourneyDraft(journey, { ...draft, state: { ...state, travelDate: '2026-11-13' } }, now), null)
  assert.equal(restoreJourneyDraft(journey, { ...draft, state: { ...state, currentStep: 4 } }, now), null)
})
