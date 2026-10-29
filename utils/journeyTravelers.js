/**
 * The Journey Details page's traveler list, assembled from the two things
 * the API serves about published reviews.
 *
 * The reviews endpoint answers a page at a time, in pages; the Traveler
 * Moments endpoint answers the ones carrying photographs the company may
 * show. A review can be in both, so they are merged by id rather than
 * concatenated — appending a page twice, or a moment that is also on the
 * first page, must not put the same traveler on the screen twice.
 *
 * Where the same review arrives from both, the copy carrying more
 * photographs wins: the moments payload is the one with them, and the
 * collage needs them while the reviews tab does not mind either way.
 *
 * Order is the order the pages arrived in, which is the API's own ordering
 * (newest first) followed by the pages fetched after it. A moment that was
 * not already in a loaded page is appended at the end rather than inserted,
 * so pressing "load more" never reshuffles what a reader is looking at.
 */
export function mergeTravelers(...groups) {
  const merged = new Map()

  for (const traveler of groups.flat()) {
    if (!traveler) continue

    // A traveler with no id cannot be de-duplicated against anything, so it
    // is kept on its own key rather than silently collapsing with another.
    const key = traveler.id ?? Symbol('traveler')
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, traveler)
      continue
    }

    const existingPhotos = existing.photos?.length ?? 0
    const candidatePhotos = traveler.photos?.length ?? 0

    if (candidatePhotos > existingPhotos) merged.set(key, traveler)
  }

  return [...merged.values()]
}
