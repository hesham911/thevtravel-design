import test from 'node:test'
import assert from 'node:assert/strict'
import { requiresMuseumChoice, museumBookingNotes } from '../utils/journeyMuseum.js'

test('only the official Cairo tour asks for one museum', () => {
  assert.equal(requiresMuseumChoice({ slug: 'cairo-day-trip-from-hurghada' }), true)
  assert.equal(requiresMuseumChoice({ slug: 'luxor-day-trip-from-hurghada' }), false)
})
test('a single museum choice is stored in the existing customer notes without changing prices', () => {
  assert.equal(museumBookingNotes('gem', 'Please call me.'), 'Museum choice: Grand Egyptian Museum\nPlease call me.')
  assert.equal(museumBookingNotes('tahrir'), 'Museum choice: Egyptian Museum in Tahrir')
  assert.throws(() => museumBookingNotes('both'), /Choose one museum/)
  assert.throws(() => museumBookingNotes(''), /Choose one museum/)
})
