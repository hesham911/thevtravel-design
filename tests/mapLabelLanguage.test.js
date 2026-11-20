import test from 'node:test'
import assert from 'node:assert/strict'
import { createExpression } from '@maplibre/maplibre-gl-style-spec'
import { localizeMapText, applyMapLabelLanguage, mapZoomTitles } from '../utils/mapLabelLanguage.js'
const original = ['case', ['has','name:nonlatin'], ['concat',['get','name:latin'],'\n',['get','name:nonlatin']], ['coalesce',['get','name_en'],['get','name']]]
function evaluate(expression, properties) {
  const result = createExpression(expression, { type:'string' })
  assert.equal(result.result, 'success', JSON.stringify(result.value))
  return result.value.evaluate({zoom:12}, {properties})
}
test('real MapLibre expressions choose each supported locale with native/provider fallback', () => {
  const properties = {name:'القاهرة','name:en':'Cairo','name:ru':'Каир','name:fr':'Le Caire','name:de':'Kairo','name:uk':'Каїр'}
  for (const locale of ['en','ru','fr','de','uk']) {
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
  const locales = ['en','ru','fr','de','uk']
  for (const locale of locales) applyMapLabelLanguage(renderer, originals, locale)
  // One rewrite per locale, and only ever the name layer: the road's ref
  // expression reads no name field, so it is left exactly as the provider set it.
  assert.equal(calls.length,locales.length)
  assert(calls.every(([id,property])=>id==='place'&&property==='text-field'))
  assert.equal(JSON.stringify(original),before)
})

test('map zoom controls have labels for Chinese, Ukrainian and unknown locales', () => {
  assert.deepEqual(mapZoomTitles('zh'), ['放大', '缩小'])
  assert.deepEqual(mapZoomTitles('uk'), ['Збільшити', 'Зменшити'])
  assert.deepEqual(mapZoomTitles('unsupported'), ['Zoom in', 'Zoom out'])
})
