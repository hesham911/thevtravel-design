export const publicLocales = Object.freeze(['en', 'fr', 'de', 'ru', 'zh', 'uk'])
const localePattern = new RegExp(`^/(${[...publicLocales, 'ar'].join('|')})(?=/|$)`)
const publicRouteNames = new Set(['home', 'journeys', 'journey-details', 'about', 'contact', 'faq', 'how-booking-works', 'privacy-policy', 'terms-and-conditions'])
const staticPaths = new Set(['/', '/about', '/contact', '/faq', '/how-booking-works', '/privacy-policy', '/terms-and-conditions', '/journeys'])

export function localeFromPath(path = '') {
  const locale = path.match(localePattern)?.[1]
  return publicLocales.includes(locale) ? locale : 'en'
}

export function sharedPublicPath(path = '') {
  return path.replace(localePattern, '') || '/'
}

export function isPublicPath(path) {
  const shared = sharedPublicPath(path.split(/[?#]/)[0]).replace(/\/$/, '') || '/'
  return staticPaths.has(shared) || /^\/journeys\/[^/]+$/.test(shared)
}

// Only known public routes participate. Assets, APIs, callbacks, token links,
// external URLs and hash-only navigation retain their original destinations.
export function localizePath(destination, locale = 'en', publicOrigin = '') {
  if (typeof destination === 'string' && /^https?:\/\//i.test(destination) && publicOrigin) {
    try {
      const url = new URL(destination)
      if (url.origin === new URL(publicOrigin).origin && isPublicPath(url.pathname)) return localizePath(url.pathname + url.search + url.hash, locale)
    } catch {}
    return destination
  }
  if (typeof destination !== 'string' || !destination.startsWith('/') || destination.startsWith('//')) return destination
  const [, path, suffix] = destination.match(/^([^?#]*)(.*)$/)
  if (!isPublicPath(path)) return destination
  const shared = sharedPublicPath(path).replace(/\/$/, '')
  return `/${publicLocales.includes(locale) ? locale : 'en'}${shared === '' ? '' : shared}${suffix}`
}

export function localizeDestination(destination, locale, publicOrigin = '') {
  if (typeof destination === 'string') return localizePath(destination, locale, publicOrigin)
  if (!destination || typeof destination !== 'object') return destination
  if (destination.path) return { ...destination, path: localizePath(destination.path, locale, publicOrigin) }
  if (publicRouteNames.has(destination.name)) return { ...destination, params: { ...destination.params, locale: publicLocales.includes(locale) ? locale : 'en' } }
  return destination
}
