import test from 'node:test'
import assert from 'node:assert/strict'
import { createLocationSearchService, normalizeLocation } from '../services/locationSearchService.js'
const location = { address:' Test address ', latitude:30, longitude:31 }
test('no configured provider exposes unavailable methods without fabricated results', async () => {
  const service=createLocationSearchService()
  assert.equal(service.searchAvailable,false)
  assert.equal(service.reverseAvailable,false)
  assert.deepEqual(await service.search('Cairo'),[])
  assert.equal(await service.reverseGeocode({latitude:30,longitude:31}),'')
})
test('short searches do not call the provider; results require readable addresses and valid coordinates', async () => {
  let calls=0
  const service=createLocationSearchService({search:async query => {
    calls++; assert.equal(query,'Cairo')
    return [location,{...location,address:''},{...location,latitude:NaN},{...location,longitude:181},{...location,latitude:'30'}]
  }})
  for(const query of ['', ' ', 'Ca']) assert.deepEqual(await service.search(query),[])
  assert.equal(calls,0)
  assert.deepEqual(await service.search(' Cairo '),[{...location,address:'Test address'}])
  assert.equal(calls,1)
})
test('reverse callback preserves the address-only integration and proxy object contract', async () => {
  assert.equal(await createLocationSearchService({reverseGeocode:async () => ' Test address '}).reverseGeocode(location),'Test address')
  assert.equal(await createLocationSearchService({reverseGeocode:async () => location}).reverseGeocode(location),'Test address')
  assert.equal(await createLocationSearchService({reverseGeocode:async () => ({...location,address:''})}).reverseGeocode(location),'')
  assert.equal(normalizeLocation({...location,latitude:91}),null)
})
test('provider failures propagate and aborted custom lookups do not hang', async () => {
  const service=createLocationSearchService({search:async () => {throw new Error('offline')}})
  await assert.rejects(service.search('Cairo'),/offline/)
  const controller=new AbortController()
  const waiting=createLocationSearchService({reverseGeocode:() => new Promise(() => {})}).reverseGeocode(location,{signal:controller.signal})
  controller.abort()
  await assert.rejects(waiting,{name:'AbortError'})
})
test('supported website languages reach callback lookups without altering locations', async () => {
  for (const language of ['en', 'ru', 'fr', 'de']) {
    const received=[]
    const service=createLocationSearchService({
      search: async (query, options) => { received.push(options.language); return [location] },
      reverseGeocode: async (coordinates, options) => { received.push(options.language); assert.equal(coordinates, location); return `${language} readable address` },
    })
    assert.equal((await service.search('Cairo', { language }))[0].address, 'Test address')
    assert.equal(await service.reverseGeocode(location, { language }), `${language} readable address`)
    assert.deepEqual(received, [language, language])
  }
})
test('proxy uses Accept-Language while preserving existing query and coordinate contracts', async () => {
  const original=globalThis.fetch, calls=[]
  try {
    globalThis.fetch=async (url, options) => { calls.push({url, options}); return { ok:true, json:async () => url.includes('/search?') ? [location] : location } }
    const service=createLocationSearchService({baseUrl:'https://example.test/geocode'})
    await service.search('Cairo', {language:'ru'})
    await service.reverseGeocode({latitude:30,longitude:31}, {language:'de'})
    assert.equal(calls[0].options.headers['Accept-Language'], 'ru')
    assert.equal(calls[1].options.headers['Accept-Language'], 'de')
    assert.equal(calls[0].url, 'https://example.test/geocode/search?q=Cairo')
    assert.equal(calls[1].url, 'https://example.test/geocode/reverse?latitude=30&longitude=31')
  } finally { globalThis.fetch=original }
})
