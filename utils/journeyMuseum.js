const museums = Object.freeze({
  gem: 'Grand Egyptian Museum',
  tahrir: 'Egyptian Museum in Tahrir',
})
export function requiresMuseumChoice(journey) {
  return journey.slug === 'cairo-day-trip-from-hurghada'
}
export function museumBookingNotes(choice, notes = '') {
  if (!Object.hasOwn(museums, choice)) throw new Error('Choose one museum.')
  return [`Museum choice: ${museums[choice]}`, notes.trim()].filter(Boolean).join('\n')
}
