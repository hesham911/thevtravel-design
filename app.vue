<script setup>
import GlobalFloatingActions from './components/GlobalFloatingActions.vue'
import { useI18n } from './utils/i18n'
import { lcpImage } from './utils/lcpImage'
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
const descriptions = {
  home: 'Journeys across Egypt. You choose the date. We take care of the rest.',
  journeys: 'Handpicked private experiences across Egypt. You choose the date. We take care of the rest.',
  about: 'Egypt, planned with local care.',
  contact: 'Contact Us — TheVTravel', faq: 'Frequently Asked Questions — TheVTravel',
  'how-booking-works': 'How Booking Works — TheVTravel',
  'privacy-policy': 'Privacy Policy — TheVTravel', 'terms-and-conditions': 'Terms & Conditions — TheVTravel',
}
const title = computed(() => translate(route.meta.title || 'TheVTravel'))
const description = computed(() => translate(descriptions[route.name] || 'TheVTravel'))
const canonical = computed(() => config.public.siteUrl ? new URL(route.path, config.public.siteUrl).href : undefined)
useSeoMeta({ title: () => title.value, description: () => description.value, ogTitle: () => title.value, ogDescription: () => description.value, ogUrl: () => canonical.value })
useHead(() => ({ htmlAttrs: { lang: locale.value, 'data-theme': theme.value, style: `color-scheme: ${theme.value}` }, meta: [{ name: 'theme-color', content: theme.value === 'dark' ? '#001122' : '#faf6f2' }], link: canonical.value ? [{ rel: 'canonical', href: canonical.value }] : [] }))

// Backgrounds stay in CSS to preserve their multi-layer crop and masks.
// The listing preload runs after the existing theme bootstrap, so a legacy
// storage/system preference cannot preload the wrong light/dark hero.
// The home hero is a fixed asset, so it is preloaded here. A journey's hero
// is whichever photo that record carries, which is not known until the page
// has loaded it — the page's own <img fetchpriority="high"> covers it.
const primaryImage = computed(() => route.name === 'home' ? lcpImage('/assets/photos/home-hero-clean.png').src : null)
useHead(() => ({
  link: primaryImage.value ? [{ key: 'lcp-image', rel: 'preload', as: 'image', href: primaryImage.value, fetchpriority: 'high' }] : [],
  script: route.name === 'journeys' ? [{ key: 'lcp-listing-preload', tagPosition: 'head', innerHTML: `(function(){var link=document.createElement('link');link.rel='preload';link.as='image';link.fetchPriority='high';link.href=document.documentElement.dataset.theme==='dark'?${JSON.stringify(lcpImage('/assets/photos/how-booking-hero-dark.png').src)}:${JSON.stringify(lcpImage('/assets/photos/how-booking-hero-light.png').src)};document.head.appendChild(link)})();` }] : [],
}))
</script>
<template>
  <NuxtPage />
  <GlobalFloatingActions />
</template>
