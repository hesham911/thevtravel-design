import test from 'node:test'
import assert from 'node:assert/strict'
import { localizePath, localizeDestination, localeFromPath, isPublicPath } from '../utils/localizedRoutes.js'

test('switching locales preserves shared dynamic slugs, query and hash', () => {
  assert.equal(localizePath('/en/journeys/new-record?date=2027-01-01&adults=2#request', 'uk'), '/uk/journeys/new-record?date=2027-01-01&adults=2#request')
  assert.equal(localizePath('/uk/journeys/new-record', 'en'), '/en/journeys/new-record')
  assert.deepEqual(localizeDestination({ name: 'journey-details', params: { slug: 'new-record', locale: 'en' }, query: { adults: 2 } }, 'uk'), { name: 'journey-details', params: { slug: 'new-record', locale: 'uk' }, query: { adults: 2 } })
  assert.deepEqual(localizeDestination({ path: '/ar/contact', query: { journey: 'new-record' }, hash: '#contact-form' }, 'zh'), { path: '/zh/contact', query: { journey: 'new-record' }, hash: '#contact-form' })
})

test('public destinations are localized once and unsupported languages are safe', () => {
  assert.equal(localizePath('/', 'en'), '/en')
  assert.equal(localizePath('/about', 'ar'), '/en/about')
  assert.equal(localizePath('/uk/about', 'uk'), '/uk/about')
  assert.equal(localizePath('/about', 'xx'), '/en/about')
  assert.equal(localeFromPath('/zh/journeys/anything'), 'zh')
  assert.equal(localeFromPath('/ar/about'), 'en')
  assert.equal(localizePath('/ar/about?ref=legacy', 'en'), '/en/about?ref=legacy')
  assert.equal(isPublicPath('/xx/about'), false)
})

test('nonpublic destinations are preserved', () => {
  for (const path of ['/api/v1/journeys', '/admin', '/assets/image.png', '/_nuxt/chunk.js', '/webhook', '/checkout/return', '/journey-review/token', 'https://example.com/about', '//example.com/about', '#request', 'mailto:test@example.com', '/not-a-public-page']) {
    assert.equal(localizePath(path, 'ar'), path)
  }
})


test('same-site absolute CMS links preserve the selected locale', () => {
  assert.equal(localizePath('https://thevtravel.com/en/about?ref=cms#team', 'uk', 'https://thevtravel.com'), '/uk/about?ref=cms#team')
  assert.equal(localizePath('https://elsewhere.test/about', 'uk', 'https://thevtravel.com'), 'https://elsewhere.test/about')
  assert.equal(localizePath('https://thevtravel.com/api/public', 'uk', 'https://thevtravel.com'), 'https://thevtravel.com/api/public')
})
