import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { computed, ref, watch } from 'vue'
import { createLocationSearchService, locationSearchService, normalizeLocation } from '../services/locationSearchService.js'
const source = readFileSync(new URL('../components/transfer/TransferMapPicker.vue', import.meta.url), 'utf8')
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
function picker(searchLocations) {
  let teardown
  const language = ref('en')
  const run = new Function('computed','ref','watch','onMounted','onBeforeUnmount','useId','defineProps','defineEmits','L','createLocationSearchService','defaultLocationSearchService','normalizeLocation','defaultLocale','defaultTranslate','useI18n','useRuntimeConfig','useLocationSearchService', `${script}\nreturn { query, searchAddress, searchKeys, searchState, suggestions };`)
  const state = run(computed,ref,watch,() => {}, fn => {teardown=fn},() => 'test-search',() => ({searchLocations}),() => () => {},{},createLocationSearchService,locationSearchService,normalizeLocation,language,value => value,() => ({ locale:language, translate:value => value }),() => ({ public:{ locationApiUrl:'' } }),() => locationSearchService)
  return {...state, locale:language, dispose:() => teardown()}
}
test('typing never requests search; explicit action requests once and Enter shares that action', async () => {
  const queries=[]
  const state=picker(async query => {queries.push(query);return [{address:'Test address',latitude:30,longitude:31}]})
  try {
    for(const query of ['C','Ca','Cairo']) state.query.value=query
    assert.deepEqual(queries,[])
    await state.searchAddress()
    assert.deepEqual(queries,['Cairo'])
    assert.equal(state.searchState.value,'ready')
    assert.equal(state.suggestions.value[0].address,'Test address')
    state.query.value='Luxor'
    let prevented=false
    state.searchKeys({key:'Enter',preventDefault:() => {prevented=true}})
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(prevented,true)
    assert.deepEqual(queries,['Cairo','Luxor'])
  } finally {state.dispose()}
})
test('empty and short queries do not request; repeated submission while loading is ignored', async () => {
  let calls=0, finish
  const state=picker(() => {calls++;return new Promise(resolve => {finish=resolve})})
  try {
    for(const query of ['', ' ', 'Ca']) {state.query.value=query;await state.searchAddress();assert.equal(state.searchState.value,'invalid')}
    assert.equal(calls,0)
    state.query.value='Cairo'
    const pending=state.searchAddress()
    assert.equal(state.searchState.value,'loading')
    await state.searchAddress()
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(calls,1)
    finish([]);await pending
    assert.equal(state.searchState.value,'empty')
  } finally {state.dispose()}
})
test('query edits invalidate pending results without starting another request; failures remain inline', async () => {
  let calls=0, finish
  const state=picker(() => {calls++;return new Promise(resolve => {finish=resolve})})
  try {
    state.query.value='Cairo';const pending=state.searchAddress()
    await new Promise(resolve => setImmediate(resolve))
    state.query.value='Luxor'
    finish([{address:'Old result',latitude:30,longitude:31}]);await pending
    assert.equal(calls,1)
    assert.deepEqual(state.suggestions.value,[])
    assert.equal(state.searchState.value,'idle')
  } finally {state.dispose()}
  const failed=picker(async () => {throw new Error('offline')})
  try {failed.query.value='Cairo';await failed.searchAddress();assert.equal(failed.searchState.value,'failed')} finally {failed.dispose()}
})
test('language changes clear old suggestions without searching until the next explicit action', async () => {
  const languages=[]
  const state=picker(async (query, options) => { languages.push(options.language); return [{address:options.language,latitude:30,longitude:31}] })
  try {
    state.query.value='Cairo'; await state.searchAddress()
    state.locale.value='ru'; await new Promise(resolve => setImmediate(resolve))
    assert.equal(state.query.value,'Cairo')
    assert.deepEqual(state.suggestions.value,[])
    assert.deepEqual(languages,['en'])
    await state.searchAddress();assert.deepEqual(languages,['en','ru'])
    assert.equal(state.suggestions.value[0].address,'ru')
  } finally {state.dispose()}
})
