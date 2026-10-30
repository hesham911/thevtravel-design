import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchFaqCategories } from '../services/faq.js'

// $fetch is a Nuxt runtime global. Stubbing it here lets the service's own
// decisions be tested without a server.
function stubFetch(handler) {
  const previous = globalThis.$fetch
  globalThis.$fetch = handler
  return () => { globalThis.$fetch = previous }
}

// A chip's mark is artwork an admin uploads, and only that: the icon-name
// select is gone from the dashboard, so the stored `icon` slug is carried as
// data and never drawn. A category with no upload reports empty urls, and
// ContentIcon then holds the icon's square empty rather than standing in an
// unrelated icon — which is what the old `|| 'help-circle'` fallback did, and
// why it is gone.
test('a category chip carries its uploaded icon, and the stored icon name is data only', async () => {
  const restore = stubFetch(async () => ({
    data: [
      { slug: 'booking', name: 'Booking & Requests', icon: 'calendar', icon_image_url: 'https://cms.test/calendar.svg', icon_image_dark_url: 'https://cms.test/calendar-dark.svg' },
      // Only a light file: the dark one is optional, and ContentIcon uses the
      // light one in both themes.
      { slug: 'payments', name: 'Payments', icon: 'card', icon_image_url: 'https://cms.test/card.svg', icon_image_dark_url: null },
      // Written after the icon select was removed: no slug, no upload, no mark.
      { slug: 'new-topic', name: 'Newly added', icon: null, icon_image_url: null, icon_image_dark_url: null },
    ],
  }))
  try {
    const { status, categories } = await fetchFaqCategories('http://api.test', 'en')

    assert.equal(status, 'ok')

    assert.equal(categories[0].id, 'booking')
    assert.equal(categories[0].iconImageUrl, 'https://cms.test/calendar.svg')
    assert.equal(categories[0].iconImageDarkUrl, 'https://cms.test/calendar-dark.svg')
    assert.equal(categories[0].icon, 'calendar')

    assert.equal(categories[1].iconImageUrl, 'https://cms.test/card.svg')
    assert.equal(categories[1].iconImageDarkUrl, '')

    assert.equal(categories[2].iconImageUrl, '')
    assert.equal(categories[2].iconImageDarkUrl, '')
    assert.equal(categories[2].icon, null)
  } finally {
    restore()
  }
})

test('no configured API is demo mode, so the page keeps its own questions', async () => {
  assert.equal((await fetchFaqCategories(undefined, 'en')).status, 'demo')
})
