// Customer reviews, served by the Laravel API
// (GET/POST {apiBaseUrl}/journey-reviews/{token},
//  GET {apiBaseUrl}/journeys/{slug}/reviews,
//  GET {apiBaseUrl}/journeys/{slug}/traveler-moments).
//
// The review page is opened with the booking's token and nothing else: no
// account, no login. The API answers every unusable link the same way — a
// malformed token, an unknown one, a cancelled booking, a withdrawn link —
// so nothing here tries to tell them apart either, and the page shows one
// honest "this link is not available" state.
//
// Every call returns a `status` rather than throwing:
//
//   'ok'          — the API answered.
//   'invalid'     — the review was rejected (422); `errors` names fields.
//   'unavailable' — the link does not work, for any of the reasons above.
//   'demo'        — no API base URL is configured. Deliberate demo mode
//                   (see .env.example): the page falls back to its own
//                   fixtures so the design can be worked on offline.
//   'error'       — the API could not be reached or answered with a fault.

const DEMO = { status: 'demo' }

function endpoint(apiBaseUrl, path) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`
}

function statusCodeOf(error) {
  return error?.response?.status ?? error?.statusCode ?? error?.status ?? null
}

function errorsOf(error) {
  const payload = error?.response?._data ?? error?.data ?? {}
  const fields = payload.errors ?? {}
  const messages = {}

  for (const [field, value] of Object.entries(fields)) {
    messages[field] = Array.isArray(value) ? value[0] : String(value)
  }

  return messages
}

/** The booking behind a review link: the journey, its date and its photos. */
export async function fetchReviewContext(apiBaseUrl, token, language) {
  if (!apiBaseUrl) return DEMO

  try {
    const response = await $fetch(endpoint(apiBaseUrl, `/journey-reviews/${encodeURIComponent(token)}`), {
      query: { lang: language },
      headers: { Accept: 'application/json' },
      retry: 0,
      timeout: 8000,
    })

    return { status: 'ok', context: toContext(response?.data ?? null) }
  } catch (error) {
    if (statusCodeOf(error) === 404) return { status: 'unavailable' }
    if (import.meta.server) console.warn(`[journey-reviews] context: ${error?.message || error}`)

    return { status: 'error', message: error?.message || String(error) }
  }
}

/**
 * Sends the customer's review.
 *
 * A second submission is not an error the customer can act on: the API
 * answers 200 with the review it already has, and `created` says which
 * happened so the page can word its success state honestly.
 */
export async function submitJourneyReview(apiBaseUrl, token, review, language) {
  if (!apiBaseUrl) return DEMO

  try {
    const response = await $fetch.raw(endpoint(apiBaseUrl, `/journey-reviews/${encodeURIComponent(token)}`), {
      method: 'POST',
      query: { lang: language },
      headers: { Accept: 'application/json' },
      body: {
        rating: review.rating,
        comment: review.comment,
        photo_media_ids: review.photoIds ?? [],
        photo_publication_consent: Boolean(review.photoPublicationConsent),
        ...(language ? { locale: language } : {}),
      },
      retry: 0,
      timeout: 12000,
    })

    return {
      status: 'ok',
      created: response.status === 201,
      context: toContext(response._data?.data ?? null),
      message: response._data?.message ?? '',
    }
  } catch (error) {
    if (statusCodeOf(error) === 422) return { status: 'invalid', errors: errorsOf(error) }
    if (statusCodeOf(error) === 404) return { status: 'unavailable' }
    if (import.meta.server) console.warn(`[journey-reviews] submit: ${error?.message || error}`)

    return { status: 'error', message: error?.message || String(error) }
  }
}

/** A page of a journey's published reviews, with its rating summary. */
export async function fetchJourneyReviews(apiBaseUrl, slug, { page, perPage, language } = {}) {
  if (!apiBaseUrl) return DEMO

  try {
    const response = await $fetch(endpoint(apiBaseUrl, `/journeys/${encodeURIComponent(slug)}/reviews`), {
      query: { lang: language, ...(page ? { page } : {}), ...(perPage ? { per_page: perPage } : {}) },
      headers: { Accept: 'application/json' },
      retry: 0,
      timeout: 8000,
    })

    return {
      status: 'ok',
      reviews: (response?.data ?? []).map(review => toTraveler(review, language)),
      summary: response?.summary ?? null,
      meta: response?.meta ?? null,
    }
  } catch (error) {
    if (statusCodeOf(error) === 404) return { status: 'unavailable' }
    if (import.meta.server) console.warn(`[journey-reviews] list ${slug}: ${error?.message || error}`)

    return { status: 'error', message: error?.message || String(error) }
  }
}

/**
 * Traveler Moments: published reviews carrying photographs the company may
 * actually show. A review with no approved photo is not in the list at all,
 * so the collage never has to render a card with nothing in it.
 */
export async function fetchTravelerMoments(apiBaseUrl, slug, language) {
  if (!apiBaseUrl) return DEMO

  try {
    const response = await $fetch(endpoint(apiBaseUrl, `/journeys/${encodeURIComponent(slug)}/traveler-moments`), {
      query: { lang: language },
      headers: { Accept: 'application/json' },
      retry: 0,
      timeout: 8000,
    })

    return { status: 'ok', moments: (response?.data?.moments ?? []).map(moment => toTraveler(moment, language)) }
  } catch (error) {
    if (statusCodeOf(error) === 404) return { status: 'unavailable' }
    if (import.meta.server) console.warn(`[journey-reviews] moments ${slug}: ${error?.message || error}`)

    return { status: 'error', message: error?.message || String(error) }
  }
}

// ── Shapes ───────────────────────────────────────────────────────────────────
// Mapped onto the shapes the existing components already render, so the
// reviews tab, the collage and the review page are untouched by where their
// content comes from.

/** The review page's own payload. */
function toContext(data) {
  if (!data) return null

  return {
    journey: {
      title: data.journey?.title ?? '',
      summary: data.journey?.summary ?? '',
      location: data.journey?.location ?? '',
      image: { src: data.journey?.image?.url ?? null, alt: data.journey?.image?.alt ?? '' },
    },
    travelDate: data.travel_date ?? null,
    photos: (data.photos ?? []).map(photo => ({ id: photo.id, src: photo.url, alt: photo.alt ?? '' })),
    rules: data.rules ?? null,
    review: data.review
      ? {
          rating: data.review.rating,
          comment: data.review.comment,
          submittedAt: data.review.submitted_at,
          photoIds: data.review.photo_media_ids ?? [],
        }
      : null,
  }
}

/**
 * One published review, in the shape the Journey Details page has always
 * rendered: a traveler with a name, a month, a rating, their words and
 * their photos.
 */
function toTraveler(review, language) {
  return {
    id: review.id,
    name: review.display_name ?? '',
    date: monthLabel(review.travelled_on, language),
    rating: review.rating ?? null,
    text: review.comment ?? '',
    isVerified: Boolean(review.is_verified),
    photos: (review.photos ?? []).map(photo => ({ type: 'image', src: photo.url, alt: photo.alt ?? '' })),
  }
}

/**
 * "Oct 2026" — the month a journey was travelled, not when it was reviewed.
 *
 * Formatted in the visitor's own language, and with an explicit locale
 * rather than the environment's default: the server and the browser would
 * otherwise disagree and the hydrated page would flicker.
 */
function monthLabel(date, language) {
  if (!date) return ''
  const parsed = new Date(`${String(date).slice(0, 10)}T12:00:00`)

  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toLocaleDateString(language || 'en', { month: 'short', year: 'numeric' })
}
