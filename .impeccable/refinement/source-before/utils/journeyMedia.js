/** Media types are explicit; only usable web/local sources can create a video card. */
export function hasVideoSource(media) {
  if (media?.type !== 'video' || typeof media.src !== 'string' || !media.src.trim()) return false
  try {
    const url = new URL(media.src.trim(), 'https://thevtravel.local/')
    return ['https:', 'http:', 'blob:'].includes(url.protocol)
  } catch {
    return false
  }
}
