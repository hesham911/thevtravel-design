// The published question catalogue, served by the Laravel API
// (GET {apiBaseUrl}/faq-categories and /faqs?category={slug}).
//
// Two calls, because the page draws two things: the filter chips and the
// questions. Every translatable value is resolved to the requested language
// on the server, falling back to English where a translation has not been
// written, so the page receives plain strings — the same contract
// services/pageContent.js describes for Website Content.
//
// A question carries the slugs of every category it belongs to. Some
// questions answer more than one chip, so the page filters on that list and
// shows each question once in its unfiltered state.
//
// Like every other call, this returns a `status` rather than throwing:
//
//   'ok'    — the API answered.
//   'demo'  — no API base URL is configured. Deliberate demo mode (see
//             .env.example); the page renders its built-in questions.
//   'error' — the API could not be reached. The page keeps its own copy
//             rather than showing the visitor an empty FAQ.

async function request(apiBaseUrl, path, query, label) {
  if (!apiBaseUrl) return { status: 'demo' }
  try {
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}${path}`, {
      query,
      headers: { Accept: 'application/json' },
      retry: 0,
      timeout: 5000,
    })
    return { status: 'ok', data: response?.data ?? [] }
  } catch (error) {
    // An outage must never take the page down with it, but it must not be
    // invisible either: the server log always says which call failed.
    if (import.meta.server) console.warn(`[faq] ${label}: ${error?.message || error}`)
    return { status: 'error' }
  }
}

/** The filter chips, in the order an admin arranged them. */
export async function fetchFaqCategories(apiBaseUrl, language) {
  const result = await request(apiBaseUrl, '/faq-categories', { lang: language }, 'categories')

  if (result.status !== 'ok') return result

  return {
    status: 'ok',
    categories: result.data.map(category => ({
      id: category.slug,
      label: category.name ?? category.slug,
      icon: category.icon || 'help-circle',
    })),
  }
}

/** Every published question, each naming the categories it is filed under. */
export async function fetchFaqs(apiBaseUrl, language) {
  const result = await request(apiBaseUrl, '/faqs', { lang: language }, 'questions')

  if (result.status !== 'ok') return result

  return {
    status: 'ok',
    faqs: result.data.map(faq => ({
      // The slug is the accordion's anchor, so a link can point at one
      // question; a question written in the dashboard has none and falls
      // back to its id.
      id: faq.slug || `faq-${faq.id}`,
      question: faq.question ?? '',
      answer: faq.answer ?? '',
      categories: Array.isArray(faq.categories) ? faq.categories : [],
    })),
  }
}
