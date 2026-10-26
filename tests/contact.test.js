import test from 'node:test'
import assert from 'node:assert/strict'
import { contactPayload, FIELD_LIMITS, fieldErrors, submitContactMessage } from '../services/contact.js'

const values = { name: ' Ada Lovelace ', email: ' ada@example.com ', whatsapp: ' +20 10 1234 5678 ', subject: 'Journey request', message: ' Ten days in Egypt. ', consent: true }

// $fetch is a Nuxt runtime global. Each case installs its own.
function withFetch(implementation, run) {
  const original = globalThis.$fetch
  globalThis.$fetch = implementation
  return (async () => { try { return await run() } finally { globalThis.$fetch = original } })()
}

test('the payload is the API contract: trimmed values, the WhatsApp field as phone, and no consent', () => {
  assert.deepEqual(contactPayload(values), {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+20 10 1234 5678',
    subject: 'Journey request',
    message: 'Ten days in Egypt.',
  })
  // A blank optional field is left out rather than stored as "", while a
  // required one is always sent so the API stays the authority on what is missing.
  assert.deepEqual(contactPayload({ name: '', email: '', whatsapp: '  ', subject: '', message: '' }), { name: '', email: '', message: '' })
  assert.deepEqual(contactPayload(undefined), { name: '', email: '', message: '' })
  assert.deepEqual(FIELD_LIMITS, { name: 255, email: 255, whatsapp: 50, subject: 255, message: 5000 })
})

test('rejected fields arrive under the form’s own field names, one message each', () => {
  assert.deepEqual(
    fieldErrors({ name: ['The name field is required.'], phone: ['too long', 'second'], subject: 'a bare string' }),
    { name: 'The name field is required.', whatsapp: 'too long', subject: 'a bare string' },
  )
  // A field this form does not show would have nowhere to appear.
  assert.deepEqual(fieldErrors({ captcha: ['nope'], email: [] }), {})
})

test('a stored message reports ok, and the request matches the published contract', async () => {
  const calls = []
  const result = await withFetch(async (url, options) => { calls.push({ url, options }); return { success: true, message: 'Your message has been sent successfully.', data: null } },
    () => submitContactMessage('http://thevtravel-backend.test/api/public/', values, 'fr'))

  assert.deepEqual(result, { status: 'ok' })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'http://thevtravel-backend.test/api/public/contact')
  assert.equal(calls[0].options.method, 'POST')
  assert.deepEqual(calls[0].options.query, { lang: 'fr' })
  assert.equal(calls[0].options.headers.Accept, 'application/json')
  assert.equal(calls[0].options.retry, 0)
  assert.equal(calls[0].options.body.phone, '+20 10 1234 5678')
})

test('no configured API base URL sends nothing and never reports success', async () => {
  let called = false
  for (const apiBaseUrl of ['', undefined, null]) {
    const result = await withFetch(async () => { called = true; return { success: true } }, () => submitContactMessage(apiBaseUrl, values, 'en'))
    assert.deepEqual(result, { status: 'demo' })
  }
  assert.equal(called, false)
})

test('a rejection is reported as invalid with its fields, and never as sent', async () => {
  const rejection = Object.assign(new Error('422 Unprocessable Content'), {
    statusCode: 422,
    data: { message: 'The name field is required.', errors: { name: ['The name field is required.'], phone: ['The phone field must not be greater than 50 characters.'] } },
  })
  const result = await withFetch(async () => { throw rejection }, () => submitContactMessage('http://api.test', values, 'de'))

  assert.deepEqual(result, {
    status: 'invalid',
    errors: { name: 'The name field is required.', whatsapp: 'The phone field must not be greater than 50 characters.' },
  })
})

test('an unreachable API, a server failure and an unrecognised answer are all errors, never a success', async () => {
  const unreachable = await withFetch(async () => { throw new Error('fetch failed') }, () => submitContactMessage('http://127.0.0.1:1/api/public', values, 'en'))
  assert.deepEqual(unreachable, { status: 'error' })

  const serverError = await withFetch(async () => { throw Object.assign(new Error('500'), { statusCode: 500, data: { message: 'Server Error' } }) },
    () => submitContactMessage('http://api.test', values, 'en'))
  assert.deepEqual(serverError, { status: 'error' })

  // A 422 whose body carries no errors bag is not a field problem the form can show.
  const bodylessRejection = await withFetch(async () => { throw Object.assign(new Error('422'), { statusCode: 422, data: {} }) },
    () => submitContactMessage('http://api.test', values, 'en'))
  assert.deepEqual(bodylessRejection, { status: 'error' })

  // The envelope says so itself: a 2xx that is not `success` did not store anything.
  for (const body of [{ success: false, message: 'Error.' }, {}, null, 'OK']) {
    assert.deepEqual(await withFetch(async () => body, () => submitContactMessage('http://api.test', values, 'en')), { status: 'error' })
  }

  // $fetch absent altogether behaves exactly like a failed request.
  assert.deepEqual(await withFetch(undefined, () => submitContactMessage('http://api.test', values, 'en')), { status: 'error' })
})
