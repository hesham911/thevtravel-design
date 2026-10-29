// Journeys served by the Laravel API
// (GET {apiBaseUrl}/journeys, /journeys/filters, /journeys/{slug}).
//
// The API resolves every translatable value to the requested language on the
// server and falls back to English where a translation has not been written,
// so a page receives plain strings and never a per-language object — the same
// contract services/pageContent.js describes for Website Content.
//
// Filtering, sorting and pagination all happen in the database: a page asks
// for the page it wants and renders what comes back, rather than fetching the
// whole catalogue to slice locally.
//
// Every call returns a `status` rather than throwing, because the three ways
// a request can fail to produce a journey are not the same thing:
//
//   'ok'        — the API answered.
//   'demo'      — no API base URL is configured. This is deliberate demo mode
//                 (see .env.example); the page renders its built-in fixtures.
//   'not-found' — the API answered 404. The journey does not exist or is not
//                 published. A page MUST show its not-found state here and
//                 must never fall back to a fixture: a draft would otherwise
//                 leak its demo copy to the public.
//   'error'     — the API could not be reached, or answered with a fault.
//                 The page says so instead of silently showing stale data.

const DEMO = { status: 'demo' }

function endpoint(apiBaseUrl, path) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`
}

// $fetch surfaces the HTTP status differently depending on where the request
// failed, so both shapes are checked before deciding this was a real 404.
function statusCodeOf(error) {
  return error?.response?.status ?? error?.statusCode ?? error?.status ?? null
}

async function request(apiBaseUrl, path, query, label) {
  if (!apiBaseUrl) return DEMO
  try {
    const response = await $fetch(endpoint(apiBaseUrl, path), {
      query,
      headers: { Accept: 'application/json' },
      retry: 0,
      timeout: 8000,
    })
    return { status: 'ok', response }
  } catch (error) {
    if (statusCodeOf(error) === 404) return { status: 'not-found' }
    // An outage must never take the page down with it, but it must not be
    // invisible either: the server log always says which call failed and why,
    // and the page shows the visitor that something is wrong.
    if (import.meta.server) console.warn(`[journeys] ${label}: ${error?.message || error}`)
    return { status: 'error', message: error?.message || String(error) }
  }
}

/** One page of the catalogue, already filtered, sorted and paginated. */
export async function fetchJourneys(apiBaseUrl, { destination, interest, sort, page, perPage, language } = {}) {
  const result = await request(
    apiBaseUrl,
    '/journeys',
    {
      lang: language,
      // Slugs, never translated names: a filter picked in French still
      // resolves after the name is edited.
      ...(destination ? { destination } : {}),
      ...(interest ? { interest } : {}),
      ...(sort ? { sort } : {}),
      ...(page ? { page } : {}),
      ...(perPage ? { per_page: perPage } : {}),
    },
    'catalogue',
  )

  if (result.status !== 'ok') return result

  return {
    status: 'ok',
    journeys: (result.response?.data ?? []).map(toCard),
    meta: result.response?.meta ?? null,
    applied: result.response?.applied ?? null,
  }
}

/** The home page's featured row, in the order an admin arranged it. */
export async function fetchFeaturedJourneys(apiBaseUrl, { limit = 3, language } = {}) {
  const result = await request(apiBaseUrl, '/journeys', { lang: language, featured: 1, per_page: limit }, 'featured')

  if (result.status !== 'ok') return result

  return { status: 'ok', journeys: (result.response?.data?.journeys ?? []).map(toCard) }
}

/** The destinations and interests the catalogue controls offer, plus the home page's destination cards. */
export async function fetchJourneyFilters(apiBaseUrl, language) {
  const result = await request(apiBaseUrl, '/journeys/filters', { lang: language }, 'filters')

  if (result.status !== 'ok') return result

  const data = result.response?.data ?? {}

  return {
    status: 'ok',
    destinations: data.destinations ?? [],
    interests: data.interests ?? [],
    homeDestinations: data.home_destinations ?? [],
    ageBands: data.age_bands ?? [],
  }
}

/** One journey by slug. A draft answers 404 exactly as an unknown slug does. */
export async function fetchJourney(apiBaseUrl, slug, language) {
  const result = await request(apiBaseUrl, `/journeys/${encodeURIComponent(slug)}`, { lang: language }, `journey ${slug}`)

  if (result.status !== 'ok') return result

  return { status: 'ok', journey: toDetail(result.response?.data ?? null) }
}

// ── Shapes ───────────────────────────────────────────────────────────────────
// The API's payload is mapped onto the shape the existing components already
// render, so the cards, the hero and the detail tabs are untouched by where
// their content comes from.

/** A catalogue card. */
export function toCard(journey) {
  return {
    id: journey.id,
    slug: journey.slug,
    detailsHref: journey.details_path || `/journeys/${journey.slug}`,
    title: journey.title ?? '',
    destination: journey.destination?.name ?? journey.location ?? '',
    destinationSlug: journey.destination?.slug ?? null,
    duration: journey.duration ?? '',
    price: journey.price?.amount == null ? null : Number(journey.price.amount),
    currency: journey.price?.currency ?? 'USD',
    interest: journey.interest?.name ?? '',
    interestSlug: journey.interest?.slug ?? null,
    image: journey.image?.url ?? null,
    imagePosition: journey.image?.position || 'center',
    alt: journey.image?.alt ?? '',
    description: journey.short_description ?? '',
    badge: journey.badge ?? null,
    tags: journey.tags ?? [],
    // Published reviews only, as the API counted them. A journey nobody has
    // reviewed keeps a null rating, so the card shows its "No reviews yet"
    // state rather than a figure nothing produced.
    averageRating: journey.reviews?.average_rating == null ? null : Number(journey.reviews.average_rating),
    reviewCount: journey.reviews?.count ?? 0,
  }
}

/** A journey detail page. */
export function toDetail(journey) {
  if (!journey) return null

  const card = toCard(journey)

  return {
    ...card,
    location: journey.location || card.destination,
    group: journey.group ?? '',
    // The guide's languages, named in the visitor's own language by the API.
    // Distinct from the languages the website is written in.
    language: (journey.guide_languages ?? []).map(item => item.name).join(', '),
    guideLanguages: journey.guide_languages ?? [],
    countryCode: journey.country_code ?? null,
    image: { type: 'image', src: journey.image?.url ?? null, alt: journey.image?.alt ?? '', position: journey.image?.position || 'center' },
    // The fixtures called this `catalogOnly`: a journey that is published but
    // whose detail sections have not been written yet. It is a statement about
    // the content, not a publication state.
    catalogOnly: !journey.has_detail_content,
    overview: journey.overview?.body || card.description,
    features: (journey.overview?.features ?? []).map(item => ({ icon: item.icon, title: item.title, text: item.description })),
    itineraryHeading: journey.itinerary?.heading || '',
    itineraryIntro: journey.itinerary?.intro || '',
    itinerary: (journey.itinerary?.stops ?? []).map(stop => [stop.time ?? '', stop.title ?? '', stop.description ?? '']),
    itineraryMedia: toMedia(journey.itinerary?.media),
    includedHeading: journey.included?.heading || '',
    includedIntro: journey.included?.intro || '',
    included: (journey.included?.items ?? []).map(item => ({ icon: item.icon, title: item.title, text: item.description })),
    galleryIntro: journey.gallery?.intro || '',
    gallery: (journey.gallery?.photos ?? []).map(photo => ({ type: 'image', src: photo.url, alt: photo.alt ?? '' })),
    goodToKnowHeading: journey.good_to_know?.heading || '',
    goodToKnowIntro: journey.good_to_know?.intro || '',
    goodToKnow: (journey.good_to_know?.items ?? []).map(item => ({ icon: item.icon, title: item.title, text: item.description })),
    pricing: journey.pricing ?? null,
    related: (journey.related ?? []).map(toCard),
    seo: journey.seo ?? null,
    // The summary of PUBLISHED reviews, as the API counted them, so the
    // figure above the list always matches the list underneath it.
    //
    // The reviews themselves are their own request (services/journeyReviews)
    // rather than part of this payload, so a journey with hundreds of them
    // does not carry them all into the page: `travelers` starts empty and
    // the page fills it.
    rating: journey.reviews?.average_rating == null ? null : Number(journey.reviews.average_rating),
    reviewCount: journey.reviews?.count ?? 0,
    travelers: [],
    distribution: journey.reviews?.distribution ?? [],
  }
}

function toMedia(media) {
  if (!media) return null
  return {
    type: media.type || 'video',
    src: media.src || null,
    poster: media.poster?.url ? { type: 'image', src: media.poster.url, alt: media.poster.alt ?? '' } : null,
    title: media.title || '',
  }
}
