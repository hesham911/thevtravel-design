import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import translations from '../data/demoTranslations.json' with { type: 'json' }

// Authored UI languages. Arabic is selectable with English fallback until
// approved Arabic interface copy is supplied. English is the key
// itself. Read out of the selector's own list rather than written here, so
// adding a language makes this test demand that language's copy straight
// away. utils/i18n.js is read as text, not imported: it pulls in Nuxt's
// `#imports`, which only exists inside a Nuxt build.
const languages = [...fs.readFileSync('utils/i18n.js', 'utf8')
  .matchAll(/\{\s*code:\s*'([a-z-]+)'/g)]
  .map(match => match[1])
  .filter(code => code !== 'en' && code !== 'ar')

assert.ok(languages.length >= 5, 'could not read the language list out of utils/i18n.js')

// The pages and components whose strings are the website's own interface.
// data/ is deliberately absent: those files are the demo journey fixtures,
// whose copy is journey content and is translated by the CMS, not here.
const uiDirectories = ['components', 'pages', 'utils', 'composables']

// Where a call to the translator starts. Everything up to its matching
// closing parenthesis is then read, so a key chosen inline still counts —
// `$t(dark ? 'Switch to light mode' : 'Switch to dark mode')` offers two
// keys, and both have to exist. `translate(someVariable)` contributes
// nothing and cannot: the key is only known at runtime.
const TRANSLATE_CALL = /(?:\$t|translate)\(/g

const QUOTED = /(['"])((?:[^'"\\\n]|\\.)*?)\1/g

/**
 * The source of one call's FIRST argument — the key — from after `(` up to
 * the top-level comma or the matching `)`.
 *
 * The second argument is the placeholder values, whose own strings are data,
 * not keys: `$t('… {locations}.', { locations: names.join(', ') })` must not
 * be read as asking for a translation of ", ".
 */
function translatedArgument(source, start) {
  let depth = 1
  let quote = null

  for (let index = start; index < source.length; index += 1) {
    const character = source[index]

    if (quote) {
      if (character === '\\') index += 1
      else if (character === quote) quote = null
      continue
    }

    if (character === "'" || character === '"' || character === '`') quote = character
    else if (character === '(' || character === '[' || character === '{') depth += 1
    else if (character === ']' || character === '}') depth -= 1
    else if (character === ')') {
      depth -= 1
      if (depth === 0) return source.slice(start, index)
    } else if (character === ',' && depth === 1) {
      return source.slice(start, index)
    }
  }

  return ''
}

/**
 * Whether a literal is being compared against rather than translated —
 * the `'pickup'` in `$t(kind === 'pickup' ? 'Confirm pickup location' : …)`
 * picks the key, it is not one.
 */
function isComparisonOperand(argument, offset) {
  return /(?:[=!]==?|\bincludes\(|\bstartsWith\(|\bendsWith\()\s*$/.test(argument.slice(0, offset))
}

// Strings the site shows in every language exactly as written, so they have
// no entry and must never grow one. Each is here for a stated reason — this
// list is the record of what is deliberately untranslated, not a way to
// silence the test.
const NOT_TRANSLATED = new Set(['good-to-know', 
  'TheVTravel',             // the brand name
  'hello@thevtravel.com',   // a literal address
  'support@thevtravel.com', // a literal address
  'English',                // a language's own name, as the selector lists it
])

// The journey booking flow and the journey review page. Their copy is part
// of the journeys work, which is handled separately; until it is, they are
// knowingly English-only and are not allowed to grow in number.
const JOURNEY_FLOW_FILES = /^(components\/journey\/|components\/review\/|pages\/journey-review\/)/

function sourceFiles(directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) sourceFiles(full, found)
    else if (/\.(vue|js)$/.test(entry.name)) found.push(full)
  }
  return found
}

function unescape(value) {
  return value.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"')
}

/** key → the files that ask for it. */
function translatedKeys() {
  const keys = new Map()
  const files = uiDirectories.flatMap(directory => sourceFiles(directory)).concat(['app.vue'])
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    for (const call of source.matchAll(TRANSLATE_CALL)) {
      const argument = translatedArgument(source, call.index + call[0].length)
      for (const literal of argument.matchAll(QUOTED)) {
        if (isComparisonOperand(argument, literal.index)) continue
        const key = unescape(literal[2])
        if (key === '' || NOT_TRANSLATED.has(key)) continue
        if (!keys.has(key)) keys.set(key, [])
        keys.get(key).push(file)
      }
    }
  }
  return keys
}

const isJourneyFlow = files => files.every(file => JOURNEY_FLOW_FILES.test(file))

// The regression this exists for: half the site's Chinese was missing for
// months because nothing asserted it. A string the interface asks the
// translator for, in a language the selector offers, either has copy or the
// visitor reads English in the middle of their own language.
test('every website interface string is translated into all six site languages', () => {
  const gaps = []

  for (const [key, files] of translatedKeys()) {

    const entry = translations[key]

    if (!entry) {
      gaps.push(`${key} — no entry at all (asked for by ${files[0]})`)
      continue
    }

    const missing = languages.filter(language => typeof entry[language] !== 'string' || entry[language].trim() === '')

    if (missing.length > 0) gaps.push(`${key} — missing ${missing.join(', ')}`)
  }

  assert.deepEqual(gaps, [], `untranslated interface strings:\n  ${gaps.join('\n  ')}`)
})

// A placeholder dropped in translation takes the number, name or count with
// it, leaving a sentence with a hole in it.
test('a translated string keeps every placeholder its English carries', () => {
  const broken = []

  for (const [key, files] of translatedKeys()) {
    const placeholders = [...key.matchAll(/\{(\w+)\}/g)].map(match => match[0])
    const entry = translations[key]
    if (placeholders.length === 0 || !entry) continue

    for (const language of languages) {
      const value = entry[language]
      if (typeof value !== 'string' || value.trim() === '') continue
      for (const placeholder of placeholders) {
        if (!value.includes(placeholder)) broken.push(`${key} → ${language} lost ${placeholder} (${files[0]})`)
      }
    }
  }

  assert.deepEqual(broken, [], `placeholders lost in translation:\n  ${broken.join('\n  ')}`)
})

// The journey flows are knowingly English-only for now. Counting them keeps
// that fact visible and stops the gap quietly growing while journeys wait.
test('the journey booking and review flows have no untranslated interface strings', () => {
  const untranslated = [...translatedKeys()]
    .filter(([key, files]) => isJourneyFlow(files) && !translations[key])
    .map(([key]) => key)

  assert.equal(
    untranslated.length,
    0,
    `journey-flow strings with no translation entry changed to ${untranslated.length}. `
      + 'Translating them is the journeys work; if some were translated, lower this number.',
  )
})
