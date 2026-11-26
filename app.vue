<script setup>
import GlobalFloatingActions from './components/GlobalFloatingActions.vue'
import { useI18n } from './utils/i18n'
import { lcpImage } from './utils/lcpImage'
import { fetchPageSeo } from './services/pageSeo'
const route = useRoute()
const config = useRuntimeConfig()
const { locale, translate } = useI18n()
const { theme } = useTheme()
// A journey's own title, description, canonical and preview image come from
// the record the API serves, so pages/journeys/[slug].vue sets them and they
// override the site-wide defaults below. They are deliberately NOT derived
// from the fixtures here: a draft or an unknown slug would otherwise be given
// a demo title and photo by the very page that is telling the visitor it does
// not exist.

// Which Website Content page each static route's metadata is managed as, so
// the title, description, canonical URL and indexability a page carries are
// the ones an admin typed under Website Content → {page} → Page Settings, in
// the language the visitor is reading. A route that is absent here owns its
// own head (the journey pages) or has no CMS page behind it.
const cmsPageKeys = {
  home: 'home', journeys: 'journeys', about: 'about-us', contact: 'contact-us',
  transfers: 'transfers', faq: 'faq', 'how-booking-works': 'how-booking-works',
  'privacy-policy': 'privacy-policy', 'terms-and-conditions': 'terms-and-conditions',
}
// The built-in description for each page, used only in demo mode or while
// the CMS is unreachable. Each is the same sentence the CMS seeds as that
// page's meta_description, so the two never contradict each other, and each
// is a real description of that page — not its title repeated.
const descriptions = {
  home: 'Journeys across Egypt. You choose the date. We take care of the rest. Handpicked private journeys, locally planned and paid at the start of your trip.',
  journeys: 'Handpicked private experiences across Egypt. You choose the date, we take care of the rest. Browse journeys by destination and interest.',
  about: 'Private journeys and transfers across Egypt, planned by a local team that confirms every detail before you travel. No online payment, no deposit.',
  transfers: 'Airport transfers, city to city or private car with driver.',
  contact: 'Plan your Egypt journey with a local team. Message us on WhatsApp or by email — real people, real replies, every day.',
  faq: 'Answers to the most common questions about booking a private journey in Egypt: dates, payment, transfers, changes and what is included.',
  'how-booking-works': 'Booking your private journey with TheVTravel is simple and flexible: explore journeys, request your date, and we take care of the rest. No online payment required.',
  'privacy-policy': 'How TheVTravel handles the details you share when you ask about a private journey or a transfer in Egypt.',
  'terms-and-conditions': 'The terms that apply when you request a private journey or a transfer with TheVTravel.',
}
// Open Graph wants language_TERRITORY, not the bare code the site uses.
const ogLocales = { en: 'en_US', ar: 'ar_EG', fr: 'fr_FR', de: 'de_DE', ru: 'ru_RU', zh: 'zh_CN', uk: 'uk_UA' }

const cmsPageKey = computed(() => route.meta.pageKey || cmsPageKeys[route.name] || null)

// Language is URL-derived. The theme cookie still changes SSR HTML, so shared
// caches must continue varying on Cookie until theme rendering is cookie-free.
if (import.meta.server) {
  const response = useRequestEvent()?.node?.res
  if (response && !response.headersSent) response.appendHeader('Vary', 'Cookie')
}

// One request per page and language. It never blocks the page: `default`
// keeps the built-in metadata in place until (or unless) the CMS answers.
const { data: pageSeo } = await useAsyncData(
  () => `page-seo-${cmsPageKey.value || 'none'}-${locale.value}`,
  () => fetchPageSeo(config.public.apiBaseUrl, cmsPageKey.value, locale.value),
  { watch: [locale, cmsPageKey], default: () => null },
)

const title = computed(() => pageSeo.value?.metaTitle || translate(route.meta.title || 'TheVTravel'))
const description = computed(() => pageSeo.value?.metaDescription || translate(descriptions[route.name] || 'TheVTravel'))
// An admin's canonical override wins; otherwise this deployment's own origin
// plus the path being served. Absent SITE_URL there is no canonical at all
// rather than a relative or guessed one.
const canonical = computed(() => route.name === 'journey-details' ? undefined : pageSeo.value?.canonicalUrl
  || (config.public.siteUrl ? new URL(route.path, config.public.siteUrl).href : undefined))
// A preview image must be an absolute URL — a crawler reading the tag has no
// page to resolve a relative path against. The origin is this deployment's
// own SITE_URL, or, where that is not set, the origin of the canonical URL
// the CMS just gave us, which is the domain the admin configured as public.
// Relative is the last resort and means neither is configured.
const socialImage = computed(() => {
  const origin = config.public.siteUrl || canonical.value
  if (!origin) return '/assets/social/og-default.jpg'
  try {
    return new URL('/assets/social/og-default.jpg', origin).href
  } catch {
    return '/assets/social/og-default.jpg'
  }
})
// Only a page the CMS explicitly marks un-indexable is told not to be
// indexed. An unreachable CMS, or a route it does not describe, leaves the
// directive off entirely — a site must never fall out of the index because
// an API call failed.
const robots = computed(() => (pageSeo.value?.indexable === false || (['privacy-policy', 'terms-and-conditions'].includes(cmsPageKey.value) && !pageSeo.value) || (cmsPageKey.value && !pageSeo.value && locale.value !== 'en')) ? 'noindex, follow' : undefined)

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  robots: () => robots.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
  ogUrl: () => canonical.value,
  ogType: 'website',
  ogSiteName: 'TheVTravel',
  ogLocale: () => ogLocales[locale.value] || 'en_US',
  ogImage: () => socialImage.value,
  ogImageAlt: () => translate('A felucca sailing on the Nile at sunset'),
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => socialImage.value,
})

// hreflang is emitted only from what the CMS actually serves: one entry per
// language that page has a public path for, plus x-default on the site's own
// default language. The alternates list is empty until a page has more than
// one, so the site never advertises a localized URL it cannot route.
const alternateLinks = computed(() => {
  const alternates = pageSeo.value?.alternates || []
  if (alternates.length === 0) return []
  const links = alternates.map(alternate => ({ rel: 'alternate', hreflang: alternate.hreflang, href: alternate.url }))
  const fallback = alternates.find(alternate => alternate.hreflang === 'en')
  if (fallback) links.push({ rel: 'alternate', hreflang: 'x-default', href: fallback.url })
  return links
})

useHead(() => ({
  htmlAttrs: { lang: locale.value, dir: locale.value === 'ar' ? 'rtl' : 'ltr', 'data-theme': theme.value, style: `color-scheme: ${theme.value}` },
  meta: [{ name: 'theme-color', content: theme.value === 'dark' ? '#001122' : '#faf6f2' }],
  link: [
    ...(canonical.value ? [{ rel: 'canonical', href: canonical.value }] : []),
    ...alternateLinks.value,
  ],
}))

// Backgrounds stay in CSS to preserve their multi-layer crop and masks.
// The listing preload runs after the existing theme bootstrap, so a legacy
// storage/system preference cannot preload the wrong light/dark hero.
// The home hero is a fixed asset, so it is preloaded here. A journey's hero
// is whichever photo that record carries, which is not known until the page
// has loaded it — the page's own <img fetchpriority="high"> covers it.
const primaryImage = computed(() => null)
useHead(() => ({
  link: primaryImage.value ? [{ key: 'lcp-image', rel: 'preload', as: 'image', href: primaryImage.value, fetchpriority: 'high' }] : [],
  script: route.name === 'journeys' ? [{ key: 'lcp-listing-preload', tagPosition: 'head', innerHTML: `(function(){var link=document.createElement('link');link.rel='preload';link.as='image';link.fetchPriority='high';link.href=document.documentElement.dataset.theme==='dark'?${JSON.stringify(lcpImage('/assets/photos/how-booking-hero-dark.png').src)}:${JSON.stringify(lcpImage('/assets/photos/how-booking-hero-light.png').src)};document.head.appendChild(link)})();` }] : [],
}))
</script>
<template>
  <NuxtPage />
  <GlobalFloatingActions />
</template>
