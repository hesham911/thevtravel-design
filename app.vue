<script setup>
import GlobalFloatingActions from './components/GlobalFloatingActions.vue'
import { useI18n } from './utils/i18n'
import { lcpImage } from './utils/lcpImage'
import { journeyDetails } from './data/journeyDetails'
const route = useRoute()
const config = useRuntimeConfig()
const { locale, translate } = useI18n()
const { theme } = useTheme()
const record = computed(() => route.name === 'journey-details' ? journeyDetails[route.params.slug] : null)
const descriptions = {
  home: 'Journeys across Egypt. You choose the date. We take care of the rest.',
  journeys: 'Handpicked private experiences across Egypt. You choose the date. We take care of the rest.',
  about: 'Egypt, planned with local care.',
  contact: 'Contact Us — TheVTravel', faq: 'Frequently Asked Questions — TheVTravel',
  'how-booking-works': 'How Booking Works — TheVTravel',
  'privacy-policy': 'Privacy Policy — TheVTravel', 'terms-and-conditions': 'Terms & Conditions — TheVTravel',
}
const title = computed(() => record.value ? `${translate(record.value.title)} — TheVTravel` : route.name === 'journey-details' ? `${translate('Journey not found')} — TheVTravel` : translate(route.meta.title || 'TheVTravel'))
const description = computed(() => translate(record.value?.overview || descriptions[route.name] || 'TheVTravel'))
const canonical = computed(() => config.public.siteUrl ? new URL(route.path, config.public.siteUrl).href : undefined)
const image = computed(() => { const src = record.value?.image?.src; return src && config.public.siteUrl ? new URL(src, config.public.siteUrl).href : undefined })
useSeoMeta({ title: () => title.value, description: () => description.value, ogTitle: () => title.value, ogDescription: () => description.value, ogImage: () => image.value, ogUrl: () => canonical.value })
useHead(() => ({ htmlAttrs: { lang: locale.value, 'data-theme': theme.value, style: `color-scheme: ${theme.value}` }, meta: [{ name: 'theme-color', content: theme.value === 'dark' ? '#001122' : '#faf6f2' }], link: canonical.value ? [{ rel: 'canonical', href: canonical.value }] : [] }))

// Backgrounds stay in CSS to preserve their multi-layer crop and masks.
// The listing preload runs after the existing theme bootstrap, so a legacy
// storage/system preference cannot preload the wrong light/dark hero.
const primaryImage = computed(() => route.name === 'home'
  ? lcpImage('/assets/photos/home-hero-clean.png').src
  : record.value ? lcpImage(record.value.image.src).src : null)
useHead(() => ({
  link: primaryImage.value ? [{ key: 'lcp-image', rel: 'preload', as: 'image', href: primaryImage.value, fetchpriority: 'high', ...(record.value?.catalogOnly ? { media: '(max-width: 767px)' } : {}) }] : [],
  script: route.name === 'journeys' ? [{ key: 'lcp-listing-preload', tagPosition: 'head', innerHTML: `(function(){var link=document.createElement('link');link.rel='preload';link.as='image';link.fetchPriority='high';link.href=document.documentElement.dataset.theme==='dark'?${JSON.stringify(lcpImage('/assets/photos/how-booking-hero-dark.png').src)}:${JSON.stringify(lcpImage('/assets/photos/how-booking-hero-light.png').src)};document.head.appendChild(link)})();` }] : [],
}))
</script>
<template>
  <NuxtPage />
  <GlobalFloatingActions />
</template>
