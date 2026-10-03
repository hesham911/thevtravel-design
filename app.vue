<script setup>
import GlobalFloatingActions from './components/GlobalFloatingActions.vue'
import { useI18n } from './utils/i18n'
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
</script>
<template>
  <NuxtPage />
  <GlobalFloatingActions />
</template>
