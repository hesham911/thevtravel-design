// The contact form's delivery, served by the Laravel API
// (POST {apiBaseUrl}/contact).
//
// The contract is the API's own, read from ContactRequest: `name`, `email`
// and `message` are required, `phone` and `subject` optional, with 255, 255,
// 5000, 50 and 255 characters as their limits. The form's WhatsApp field is
// that `phone` — the only name that differs — and the mapping lives here, in
// the module that owns the contract. Field errors come back under the form's
// own field names, so the page never has to know the API's.
//
// Like every other call, this returns a `status` rather than throwing:
//
//   'ok'      — the message is stored. Only this clears the form.
//   'invalid' — the API rejected the values (422). `errors` names one
//               message per form field it rejected.
//   'demo'    — no API base URL is configured. Deliberate demo mode (see
//               .env.example). Nothing was sent, so the page says so rather
//               than thanking a visitor whose message went nowhere.
//   'error'   — the API could not be reached, reported a failure, or
//               answered in a shape this contract does not recognise.

/** Form field → API field. The form's `consent` is its own gate and is never sent. */
const API_FIELD = Object.freeze({ name: 'name', email: 'email', whatsapp: 'phone', subject: 'subject', message: 'message' })

/** API field → form field, so a rejection can be shown beside the input that caused it. */
const FORM_FIELD = Object.freeze(Object.fromEntries(Object.entries(API_FIELD).map(([field, apiField]) => [apiField, field])))

/** The API's own `max` rules, so the form can say what is too long in the visitor's language. */
export const FIELD_LIMITS = Object.freeze({ name: 255, email: 255, whatsapp: 50, subject: 255, message: 5000 })

/** Fields the API requires: always sent, even blank, so it stays the authority on what is missing. */
const REQUIRED_FIELDS = Object.freeze(['name', 'email', 'message'])

// The request body. Values are trimmed, and a blank optional field is left
// out rather than sent empty, so an unanswered field is stored as nothing.
export function contactPayload(values) {
  const payload = {}
  for (const [field, apiField] of Object.entries(API_FIELD)) {
    const value = typeof values?.[field] === 'string' ? values[field].trim() : ''
    if (value !== '' || REQUIRED_FIELDS.includes(field)) payload[apiField] = value
  }
  return payload
}

// One message per form field, from the API's `errors` bag. A field this form
// does not have is dropped: the page would have nowhere to show it.
export function fieldErrors(errors) {
  const mapped = {}
  for (const [apiField, messages] of Object.entries(errors)) {
    const field = FORM_FIELD[apiField]
    const message = Array.isArray(messages) ? messages[0] : messages
    if (field && typeof message === 'string' && message !== '') mapped[field] = message
  }
  return mapped
}

export async function submitContactMessage(apiBaseUrl, values, language) {
  if (!apiBaseUrl) return { status: 'demo' }

  try {
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/contact`, {
      method: 'POST',
      query: { lang: language },
      headers: { Accept: 'application/json' },
      body: contactPayload(values),
      // A retry could store the same message twice, and a visitor's message
      // is worth waiting longer for than a page's content.
      retry: 0,
      timeout: 15000,
    })

    // The envelope says so itself: a 2xx that is not `success` is a failure,
    // and never a cleared form and a thank you.
    return response?.success === true ? { status: 'ok' } : { status: 'error' }
  } catch (error) {
    const code = error?.statusCode ?? error?.response?.status ?? 0
    const errors = error?.data?.errors

    if (code === 422 && errors && typeof errors === 'object') {
      return { status: 'invalid', errors: fieldErrors(errors) }
    }

    // A lost message must never look sent, and it must not be invisible
    // either: the console always says what failed and why.
    console.warn(`[contact] submission failed — ${error?.message || error}`)
    return { status: 'error' }
  }
}
