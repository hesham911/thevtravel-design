// Every language the site is read in, so an address comes back in the one
// the guest is using. The proxy passes it to the provider as Accept-Language
// and uses it to localize its own answer.
export const geocodingLanguages = Object.freeze({ en: 'English', ru: 'Russian', fr: 'French', de: 'German', zh: 'Chinese' })
const languageCode = value => Object.hasOwn(geocodingLanguages, value) ? value : 'en'

// Transfer-only adapter. `baseUrl` points at this application's own geocoding
// proxy — NUXT_PUBLIC_LOCATION_API_URL, e.g.
// http://thevtravel-backend.test/api/public/locations — never at a provider
// directly and never with a browser API key: the provider's usage policy
// wants one identifiable caller, the answers are cached server-side for
// every guest, and a credential on a public page is a credential given away.
//
// Unset, `searchAvailable` and `reverseAvailable` are false and every caller
// says the lookup is unavailable rather than appearing to search.
export function normalizeLocation(value) {
  if (!value || typeof value.address !== 'string' || !value.address.trim()) return null
  const { latitude, longitude } = value
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { address: value.address.trim(), latitude, longitude }
}
function withAbort(task, signal) {
  if (!signal) return task()
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'))
    signal.addEventListener('abort', abort, { once: true })
    Promise.resolve().then(task).then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
  })
}
export function createLocationSearchService({ baseUrl = '', search, reverseGeocode } = {}) {
  const endpoint = baseUrl.replace(/\/$/, '')
  async function request(path, params, signal, language) {
    const url = `${endpoint}/${path}?${new URLSearchParams(params)}`
    const response = await fetch(url, { signal, headers: { Accept: 'application/json', 'Accept-Language': languageCode(language) } })
    if (!response.ok) throw new Error('Location lookup failed')
    return response.json()
  }
  return {
    searchAvailable: Boolean(search || endpoint),
    reverseAvailable: Boolean(reverseGeocode || endpoint),
    async search(query, { signal, language = 'en' } = {}) {
      const trimmed = query.trim()
      if (trimmed.length < 3 || !(search || endpoint)) return []
      const result = search ? await withAbort(() => search(trimmed, { signal, language: languageCode(language) }), signal) : await request('search', { q: trimmed }, signal, language)
      if (!Array.isArray(result)) throw new Error('Invalid location search response')
      return result.map(normalizeLocation).filter(Boolean).slice(0, 6)
    },
    async reverseGeocode(coordinates, { signal, language = 'en' } = {}) {
      if (!(reverseGeocode || endpoint)) return ''
      const result = reverseGeocode ? await withAbort(() => reverseGeocode(coordinates, { signal, language: languageCode(language) }), signal) : await request('reverse', coordinates, signal, language)
      // Support the existing address-only reverse callback as well as proxy objects.
      return typeof result === 'string' ? result.trim() : normalizeLocation(result)?.address || ''
    },
  }
}
export const locationSearchService = createLocationSearchService()
/**
 * The adapter pointed at this application's own geocoding proxy.
 *
 * `useRuntimeConfig` is Nuxt's auto-import rather than an explicit one, on
 * purpose: this module is also loaded directly by `node --test`, where a
 * '#imports' specifier cannot resolve, and only this function needs it.
 */
export function useLocationSearchService() {
  return createLocationSearchService({ baseUrl: useRuntimeConfig().public.locationApiUrl })
}
