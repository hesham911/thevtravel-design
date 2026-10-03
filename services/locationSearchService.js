export const geocodingLanguages = Object.freeze({ en: 'English', ru: 'Russian', fr: 'French', de: 'German' })
const languageCode = value => Object.hasOwn(geocodingLanguages, value) ? value : 'en'
// Transfer-only adapter. Configure a geocoding proxy, never a secret browser API key.
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
export function useLocationSearchService() {
  return createLocationSearchService({ baseUrl: useRuntimeConfig().public.locationApiUrl })
}
