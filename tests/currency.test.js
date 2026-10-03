import test from 'node:test'
import assert from 'node:assert/strict'
import { formatUSD } from '../utils/currency.js'
test('USD formatting preserves supplied amounts and never creates request prices', () => {
  assert.equal(formatUSD(120), '$120')
  assert.equal(formatUSD(3200), '$3,200')
  assert.equal(formatUSD(120.5), '$120.50')
  assert.equal(formatUSD(0), '$0')
  assert.match(formatUSD(120, { explicit: true }), /^USD\s120$/)
  for (const value of [null, undefined, '', '   ', NaN, Infinity, -1, false, 'invalid']) assert.equal(formatUSD(value), null)
})
