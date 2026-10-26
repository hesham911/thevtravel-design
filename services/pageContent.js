// Website Content pages served by the Laravel CMS
// (GET {apiBaseUrl}/pages/{key}/sections?lang={locale}).
//
// The API resolves every translatable value to the requested language on the
// server, falling back to English where a translation has not been written
// yet, so a page receives plain strings and never a per-language object.
//
// A page calls fetchPageSections() and renders its own built-in copy when the
// result is null — no API base URL configured, the API unreachable, or the
// page not published yet. Published CMS content always wins over that copy.
export async function fetchPageSections(apiBaseUrl, pageKey, language) {
  if (!apiBaseUrl) return null
  try {
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/pages/${pageKey}/sections`, {
      query: { lang: language },
      headers: { Accept: 'application/json' },
      retry: 0,
      timeout: 5000,
    })
    return indexSections(response?.data?.sections)
  } catch (error) {
    // A CMS outage must never take the page down with it — but silent
    // fixture fallback would hide a wrong base URL just as well as it hides
    // an outage, so the server log always says which page failed and why.
    // Blank apiBaseUrl is deliberate demo mode and returns above without a
    // warning; reaching here always means a request was attempted and lost.
    if (import.meta.server) console.warn(`[cms] ${pageKey}: falling back to built-in copy — ${error?.message || error}`)
    return null
  }
}

// section_key → section, so a page reads the section it wants by name and is
// unaffected by sections being reordered, added or unpublished.
export function indexSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return null
  const indexed = {}
  for (const section of sections) {
    if (section && typeof section.section_key === 'string') indexed[section.section_key] = section
  }
  return Object.keys(indexed).length ? indexed : null
}

// A CMS string, or the page's own copy when the field is absent or blank —
// an admin clearing one field never blanks out part of the design.
export function textOr(value, fallback) {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}

// A paragraph the design breaks across lines. The CMS stores it as one
// field — a line break in the editor is a line break on the page — so a
// translator writes a sentence rather than fragments, and a language that
// needs a different number of lines simply has one.
export function linesOf(value, fallback = []) {
  if (typeof value !== 'string' || value.trim() === '') return fallback
  return value.split('\n').map(line => line.trim()).filter(Boolean)
}

// A section's cards, or the page's own copy while the CMS has none. Rows an
// admin has unpublished are already absent from the response, so a section
// whose every card is hidden falls back to the built-in copy rather than
// rendering an empty grid.
export function itemsOr(section, fallback) {
  const items = section?.items
  if (!Array.isArray(items) || items.length === 0) return fallback
  return items.map((item, index) => ({
    key: item.id ?? index,
    icon: item.icon || null,
    title: item.title || '',
    description: item.description || '',
    label: item.subtitle || '',
    link: item.link || '',
  }))
}
