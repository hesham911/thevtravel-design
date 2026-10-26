import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const table = JSON.parse(fs.readFileSync(path.join(root, 'data/demoTranslations.json'), 'utf8'))

// Every file that renders a label on /journeys, /journeys/[slug] or the home
// page's journey and destination sections. The booking dialog is a separate
// module and is deliberately not listed.
const surfaces = [
  'pages/journeys/index.vue',
  'pages/journeys/[slug].vue',
  'pages/index.vue',
  'components/JourneyCard.vue',
  'components/journey/JourneyHero.vue',
  'components/journey/JourneySectionContent.vue',
  'components/journey/MobileJourneyControls.vue',
  'components/journey/RelatedJourneys.vue',
  'components/journey/JourneyGalleryViewer.vue',
  'components/journey/JourneyVideo.vue',
]

// Strings passed to $t() that are identifiers rather than copy: a section id
// in the tab lookup, and the gallery mode a ternary compares against. Neither
// is ever shown to a visitor.
const identifiers = new Set(['official', 'good-to-know'])

/** Every string literal handed to $t()/translate() in a file. */
function renderedLiterals(source) {
  const found = new Set()
  const literal = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g

  // Pass 1 walks each call's body with balanced parentheses, so literals
  // inside a ternary or an object lookup are seen too.
  for (const call of source.matchAll(/(?:\$t|translate)\(/g)) {
    let i = call.index + call[0].length
    let depth = 1
    const start = i
    while (i < source.length && depth > 0) {
      if (source[i] === '(') depth++
      else if (source[i] === ')') depth--
      i++
    }
    for (const m of source.slice(start, i - 1).matchAll(literal)) {
      const value = m[1] ?? m[2]
      if (value?.trim()) found.add(value)
    }
  }

  // Pass 2 catches the ones pass 1 cannot: a literal containing a ')' ends the
  // balanced walk early (for example "reviews)").
  for (const m of source.matchAll(/(?:\$t|translate)\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g)) {
    const value = m[1] ?? m[2]
    if (value?.trim()) found.add(value)
  }

  return found
}

test('every label the journey surfaces render has a Simplified Chinese translation', () => {
  const untranslated = []

  for (const surface of surfaces) {
    const source = fs.readFileSync(path.join(root, surface), 'utf8')
    for (const label of renderedLiterals(source)) {
      if (identifiers.has(label)) continue
      if (!table[label]?.zh) untranslated.push(`${surface}: ${label}`)
    }
  }

  assert.deepEqual(untranslated, [], `Missing zh for:\n  ${untranslated.join('\n  ')}`)
})

test('a translation keeps the placeholders its English key uses', () => {
  const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',')
  const broken = Object.entries(table)
    .filter(([key, translations]) => translations.zh && placeholders(key) !== placeholders(translations.zh))
    .map(([key]) => key)

  assert.deepEqual(broken, [], 'A placeholder would render as literal text or be dropped.')
})
