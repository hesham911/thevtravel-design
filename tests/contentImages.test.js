import test from 'node:test'
import assert from 'node:assert/strict'
import { contentImage, heroImageStyle, heroImagePreloads } from '../utils/contentImages.js'

test('legacy seed photographs use approved responsive artwork without changing the CMS record', () => {
  const media = { url: 'https://cms.test/storage/153/people-team.webp', file_name: 'people-team.webp', size: 14184 }
  const image = contentImage(media, 'about-people', 'zh')
  assert.match(image.url, /approved-about-people-1672.webp$/)
  assert.match(image.srcset, /768w/)
  assert.match(image.alt, /向导/)
  assert.equal(media.url, 'https://cms.test/storage/153/people-team.webp')
})

test('custom CMS artwork takes precedence, including a different upload with a legacy filename', () => {
  for (const media of [
    { url: 'https://cms.test/custom.webp', file_name: 'custom.webp', size: 50000 },
    { url: 'https://cms.test/custom.webp', file_name: 'people-team.webp', size: 50000 },
  ]) {
    const image = contentImage(media, 'about-people')
    assert.equal(image.url, media.url)
    assert.equal(image.srcset, null)
    assert.equal(image.alt, null)
    assert.equal(heroImagePreloads(image)[0].href, media.url)
  }
})

test('bundled hero preloads match desktop and mobile CSS sources', () => {
  const image = contentImage(null, 'contact-hero')
  const style = heroImageStyle(image)
  const preloads = heroImagePreloads(image)
  assert.ok(style['--hero-image'].includes(image.url))
  assert.ok(style['--hero-mobile-image'].includes(image.mobile))
  assert.equal(preloads[0].imagesrcset, `${image.mobile} 1x, ${image.url} 2x`)
  assert.equal(preloads[1].href, image.url)
})
