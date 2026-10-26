import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchPageSections, indexSections, itemsOr, linesOf, textOr } from '../services/pageContent.js'

test('sections are indexed by key and an empty payload reports nothing to render', () => {
  const indexed = indexSections([{ section_key: 'hero', title: 'How booking works' }, { section_key: 'steps', items: [] }])
  assert.equal(indexed.hero.title, 'How booking works')
  assert.deepEqual(Object.keys(indexed), ['hero', 'steps'])
  assert.equal(indexSections([]), null)
  assert.equal(indexSections(undefined), null)
  assert.equal(indexSections([{ title: 'no key' }]), null)
})

test('CMS text wins and blank or missing values keep the page copy', () => {
  assert.equal(textOr('预订流程', 'How booking works'), '预订流程')
  assert.equal(textOr('   ', 'How booking works'), 'How booking works')
  assert.equal(textOr(undefined, 'How booking works'), 'How booking works')
  assert.equal(textOr(null, 'How booking works'), 'How booking works')
})

test('no configured API, and an unreachable one, both fall back instead of throwing', async () => {
  assert.equal(await fetchPageSections('', 'how-booking-works', 'en'), null)
  assert.equal(await fetchPageSections(undefined, 'how-booking-works', 'en'), null)
  // $fetch is a Nuxt runtime global: absent here, exactly like a failed request.
  assert.equal(await fetchPageSections('http://127.0.0.1:1/api/public', 'how-booking-works', 'zh'), null)
})

test('a multi-line field becomes the lines the design draws, and an empty one keeps the page copy', () => {
  assert.deepEqual(linesOf('The route we follow.\nThe horizon we keep.'), ['The route we follow.', 'The horizon we keep.'])
  // Blank lines and stray indentation never become an empty paragraph.
  assert.deepEqual(linesOf('  first  \n\n  second '), ['first', 'second'])
  assert.deepEqual(linesOf('', ['fallback']), ['fallback'])
  assert.deepEqual(linesOf(undefined, ['fallback']), ['fallback'])
  assert.deepEqual(linesOf(null), [])
})

test('cards come from the CMS when it has any, and from the page itself when it has none', () => {
  const cards = itemsOr({ items: [{ id: 7, icon: 'lock', title: 'Private by design', description: 'Yours.', subtitle: 'Open', link: '/x' }] }, ['fallback'])
  assert.deepEqual(cards, [{ key: 7, icon: 'lock', title: 'Private by design', description: 'Yours.', label: 'Open', link: '/x' }])
  // An unpublished row is already absent from the response: a section with
  // nothing left to show falls back rather than rendering an empty grid.
  assert.deepEqual(itemsOr({ items: [] }, ['fallback']), ['fallback'])
  assert.deepEqual(itemsOr(undefined, ['fallback']), ['fallback'])
  // A row with no icon or link reports them as empty, never as "undefined".
  assert.deepEqual(itemsOr({ items: [{ id: 1, title: 'Q' }] }, []), [{ key: 1, icon: null, title: 'Q', description: '', label: '', link: '' }])
})
