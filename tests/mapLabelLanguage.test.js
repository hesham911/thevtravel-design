import test from 'node:test'
import assert from 'node:assert/strict'
import { createExpression } from '@maplibre/maplibre-gl-style-spec'
import { localizeMapText, applyMapLabelLanguage } from '../utils/mapLabelLanguage.js'
const original = ['case', ['has','name:nonlatin'], ['concat',['get','name:latin'],'\n',['get','name:nonlatin']], ['coalesce',['get','name_en'],['get','name']]]
function evaluate(expression, properties) {
  const result = createExpression(expression, { type:'string' })
  assert.equal(result.result, 'success', JSON.stringify(result.value))
  return result.value.evaluate({zoom:12}, {properties})
}
test('real MapLibre expressions choose each supported locale with native/provider fallback', () => {
  const properties = {name:'القاهرة','name:en':'Cairo','name:ru':'Каир','name:fr':'Le Caire','name:de':'Kairo'}
  for (const locale of ['en','ru','fr','de']) {
    const expression = localizeMapText(original, locale)
    assert.equal(evaluate(expression,properties),properties[`name:${locale}`])
    assert.equal(evaluate(expression,{...properties,[`name:${locale}`]:''}),'القاهرة')
    assert.equal(evaluate(expression,{name:'Local name'}),'Local name')
    assert.equal(evaluate(expression,{name_en:'Provider default'}),'Provider default')
  }
  assert.equal(evaluate(localizeMapText(original,'unsupported'),properties),'Cairo')
})
test('preserves road numbers, formatted metadata and original style without cumulative replacement', () => {
  const ref = ['to-string',['get','ref']]
  assert.deepEqual(localizeMapText(ref,'fr'),ref)
  const formatted = ['concat',['get','name'],' / ',['to-string',['get','ele']]]
  assert.equal(evaluate(localizeMapText(formatted,'de'),{name:'Local','name:de':'Berg',ele:120}),'Berg / 120')
  const before = JSON.stringify(original), calls=[]
  const renderer = {setLayoutProperty:(...args)=>calls.push(args)}
  const originals = new Map([['place',original],['road',ref]])
  for (const locale of ['en','ru','fr','de']) applyMapLabelLanguage(renderer, originals, locale)
  assert.equal(calls.length,4)
  assert(calls.every(([id,property])=>id==='place'&&property==='text-field'))
  assert.equal(JSON.stringify(original),before)
})
