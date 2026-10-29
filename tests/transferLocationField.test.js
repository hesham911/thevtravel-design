import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { computed, ref, watch, nextTick } from 'vue'
import { createLocationSearchService } from '../services/locationSearchService.js'

// The step-1 location input's own behaviour, driven the way the map picker's
// search already is in transferMapPickerSearch.test.js: the component's
// <script setup> is evaluated with its imports stubbed, so the search logic
// is exercised without a renderer and — importantly — without a network.
// Calling a public geocoding service from a test suite would be a usage-
// policy violation and a flaky test at once, so every lookup here is a local
// callback.
const source = readFileSync(new URL('../components/transfer/TransferLocationField.vue', import.meta.url), 'utf8')
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')

function field({ search, available = true } = {}) {
  const emitted = []
  let teardown

  const service = search
    ? createLocationSearchService({ search })
    : { searchAvailable: available, search: async () => [] }

  const props = { field: 'pickup', label: 'Pickup location', address: '', latitude: null, error: '', service, language: 'en' }

  const run = new Function(
    'computed', 'ref', 'watch', 'onBeforeUnmount', 'useId', 'AppIcon', 'defineProps', 'defineEmits',
    `${script}\nreturn { query, suggestions, state, open, activeIndex, available, listboxVisible, onInput, keys, choose, schedule };`,
  )

  const api = run(
    computed, ref, watch,
    (fn) => { teardown = fn },
    () => 'test-field',
    {},
    () => props,
    () => (event, payload) => emitted.push([event, payload]),
  )

  return { ...api, props, emitted, dispose: () => teardown?.() }
}

/** The debounce is 350ms; this waits past it and lets the lookup settle. */
async function settle(ms = 420) {
  await new Promise(resolve => setTimeout(resolve, ms))
  await nextTick()
}

test('typing searches after a pause, and reports the text so stale coordinates are cleared', async () => {
  const queries = []
  const state = field({
    search: async (query) => { queries.push(query); return [{ address: 'Four Seasons Nile Plaza, Cairo', latitude: 30.0356, longitude: 31.229 }] },
  })

  try {
    state.onInput('Four Seasons')

    // Reported immediately: the form owns the address, and every keystroke
    // has to invalidate the point the previous text came with.
    assert.deepEqual(state.emitted.at(-1), ['update:address', 'Four Seasons'])
    // Nothing is requested yet — the debounce is what keeps one hotel name
    // from becoming a request per keystroke.
    assert.deepEqual(queries, [])
    assert.equal(state.state.value, 'loading')

    await settle()

    assert.deepEqual(queries, ['Four Seasons'])
    assert.equal(state.state.value, 'ready')
    assert.equal(state.suggestions.value[0].address, 'Four Seasons Nile Plaza, Cairo')
  } finally {
    state.dispose()
  }
})

test('a query shorter than three characters is never sent', async () => {
  const queries = []
  const state = field({ search: async (query) => { queries.push(query); return [] } })

  try {
    for (const value of ['C', 'Ca']) {
      state.onInput(value)
      await settle()
    }

    assert.deepEqual(queries, [])
    // Said only once they have started typing: an untouched field is not a
    // mistake.
    assert.equal(state.state.value, 'short')

    state.onInput('')
    await settle()
    assert.equal(state.state.value, 'idle')
  } finally {
    state.dispose()
  }
})

test('keystrokes during the pause collapse into one request for the final text', async () => {
  const queries = []
  const state = field({ search: async (query) => { queries.push(query); return [] } })

  try {
    for (const value of ['Cai', 'Cair', 'Cairo']) state.onInput(value)

    await settle()

    assert.deepEqual(queries, ['Cairo'])
  } finally {
    state.dispose()
  }
})

test('choosing a result emits the address with its coordinates together', async () => {
  const location = { address: 'Giza Pyramids, Egypt', latitude: 29.9792, longitude: 31.1342 }
  const state = field({ search: async () => [location] })

  try {
    state.onInput('Giza')
    await settle()

    state.choose(state.suggestions.value[0])

    const [event, payload] = state.emitted.at(-1)
    assert.equal(event, 'select')
    assert.deepEqual(payload, location)
    // The list closes and the input shows what was chosen.
    assert.equal(state.open.value, false)
    assert.equal(state.query.value, 'Giza Pyramids, Egypt')
  } finally {
    state.dispose()
  }
})

test('no results and a failed lookup are different states, never both "nothing found"', async () => {
  const empty = field({ search: async () => [] })

  try {
    empty.onInput('qwertyuiop')
    await settle()
    assert.equal(empty.state.value, 'empty')
  } finally {
    empty.dispose()
  }

  const broken = field({ search: async () => { throw new Error('Location lookup failed') } })

  try {
    broken.onInput('Cairo')
    await settle()
    // A guest told their hotel does not exist would stop looking for it.
    assert.equal(broken.state.value, 'failed')
    assert.deepEqual(broken.suggestions.value, [])
  } finally {
    broken.dispose()
  }
})

test('with no provider configured the field says so and requests nothing', async () => {
  const state = field({ available: false })

  try {
    assert.equal(state.available.value, false)

    state.onInput('Cairo')
    await settle()

    assert.equal(state.state.value, 'idle')
    assert.equal(state.open.value, false)
    // Typing still reaches the form: a guest may submit the address they
    // typed, with no coordinates, and the API accepts it.
    assert.deepEqual(state.emitted.at(-1), ['update:address', 'Cairo'])
  } finally {
    state.dispose()
  }
})

test('the arrow keys move through the results and Enter picks the highlighted one', async () => {
  const results = [
    { address: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357 },
    { address: 'Cairo Airport, Egypt', latitude: 30.1219, longitude: 31.4056 },
  ]
  const state = field({ search: async () => results })

  try {
    state.onInput('Cairo')
    await settle()

    const press = (key) => {
      let prevented = false
      state.keys({ key, preventDefault: () => { prevented = true }, stopPropagation: () => {} })
      return prevented
    }

    assert.equal(state.activeIndex.value, -1)
    assert.equal(press('ArrowDown'), true)
    assert.equal(state.activeIndex.value, 0)
    press('ArrowDown')
    assert.equal(state.activeIndex.value, 1)
    // Wraps rather than sticking at the end.
    press('ArrowDown')
    assert.equal(state.activeIndex.value, 0)
    press('ArrowUp')
    assert.equal(state.activeIndex.value, 1)

    assert.equal(press('Enter'), true)
    assert.deepEqual(state.emitted.at(-1), ['select', results[1]])
  } finally {
    state.dispose()
  }
})

/**
 * With nothing highlighted, Enter has to reach the form — that is how the
 * guest continues to the next step from the keyboard — so it must not be
 * swallowed by the suggestion list.
 */
test('Enter with nothing highlighted is left to the form', async () => {
  const state = field({ search: async () => [{ address: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357 }] })

  try {
    state.onInput('Cairo')
    await settle()

    let prevented = false
    state.keys({ key: 'Enter', preventDefault: () => { prevented = true }, stopPropagation: () => {} })

    assert.equal(prevented, false)
    assert.equal(state.emitted.filter(([event]) => event === 'select').length, 0)
  } finally {
    state.dispose()
  }
})

test('Escape closes the list without clearing what was typed', async () => {
  const state = field({ search: async () => [{ address: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357 }] })

  try {
    state.onInput('Cairo')
    await settle()
    assert.equal(state.listboxVisible.value, true)

    state.keys({ key: 'Escape', preventDefault: () => {}, stopPropagation: () => {} })

    assert.equal(state.open.value, false)
    assert.equal(state.query.value, 'Cairo')
  } finally {
    state.dispose()
  }
})
