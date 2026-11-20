// Page-level SEO served by the Laravel CMS
// (GET {apiBaseUrl}/pages/{key}?lang={locale}).
//
// The same admin screen that owns a page's content owns its crawler-facing
// metadata: Website Content → {page} → Page Settings holds meta_title,
// meta_description and public_path per language, plus the canonical override
// and the "may be indexed" switch. The API resolves each translatable value
// to the requested language on the server, falling back to English where a
// translation has not been written yet, so this receives plain strings.
//
// Why this exists at all: without it the site would carry a second, private
// copy of its own metadata — the one hardcoded in app.vue — and the admin's
// per-language titles and descriptions would be edited but never served.
// There is one source of truth; the built-in values below it are the
// fallback for demo mode and for a CMS outage, nothing more.
//
// `sections` (services/pageContent.js) and this are deliberately separate
// requests: a page renders its copy from the sections endpoint, and its head
// from here, so a page whose sections are not published can still carry
// correct metadata and vice versa.
export async function fetchPageSeo(apiBaseUrl, pageKey, language) {
  if (!apiBaseUrl || !pageKey) return null
  try {
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/pages/${pageKey}`, {
      query: { lang: language },
      headers: { Accept: 'application/json' },
      retry: 0,
      timeout: 5000,
    })
    return normalizePageSeo(response?.data)
  } catch (error) {
    // A CMS outage must never take the page down with it, and must never
    // leave the head empty either: the caller keeps its built-in metadata.
    // Blank apiBaseUrl is deliberate demo mode and returns above without a
    // warning; reaching here always means a request was attempted and lost.
    if (import.meta.server) console.warn(`[seo] ${pageKey}: falling back to built-in metadata — ${error?.message || error}`)
    return null
  }
}

// A CMS payload reduced to the five things the head needs, or null when the
// response carries none of them. Every field is optional on purpose: a page
// an admin has not given a title yet must fall through to the built-in one
// rather than publish an empty <title>.
export function normalizePageSeo(page) {
  if (!page || typeof page !== 'object') return null
  const seo = {
    metaTitle: text(page.meta_title),
    metaDescription: text(page.meta_description),
    canonicalUrl: text(page.canonical_url),
    // Absent robots means indexable: a page the API does not describe is
    // never silently hidden from search engines.
    indexable: page.robots?.index !== false,
    alternates: alternatesOf(page.alternates),
  }
  return seo
}

function text(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : ''
}

// hreflang alternates, kept only where both halves are present and only
// while there is more than one language to point at. A single self-
// referencing alternate tells a crawler nothing and is left out; a locale
// the CMS has no public path for is already absent from the payload.
function alternatesOf(value) {
  if (!Array.isArray(value)) return []
  const valid = value.filter(entry => entry && text(entry.hreflang) && text(entry.url))
  return valid.length > 1
    ? valid.map(entry => ({ hreflang: entry.hreflang.trim(), url: entry.url.trim() }))
    : []
}
