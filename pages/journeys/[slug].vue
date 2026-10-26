<script setup>
definePageMeta({"name": "journey-details", "title": "Journey Details — TheVTravel"})
import { formatUSD } from '~/utils/currency'
import { computed, ref, nextTick } from 'vue'
import { useRoute, useRouter, useRuntimeConfig, useAsyncData, useHead, useSeoMeta, setResponseStatus } from '#imports'
import SiteHeader from '~/components/SiteHeader.vue'
import JourneyHero from '~/components/journey/JourneyHero.vue'
import JourneySectionContent from '~/components/journey/JourneySectionContent.vue'
import MobileJourneyControls from '~/components/journey/MobileJourneyControls.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import RelatedJourneys from '~/components/journey/RelatedJourneys.vue'
import JourneyBookingFlow from '~/components/journey/JourneyBookingFlow.vue'
import JourneyGalleryViewer from '~/components/journey/JourneyGalleryViewer.vue'
import { useI18n } from '~/utils/i18n'
import { fetchJourney } from '~/services/journeys'
import { relatedJourneys as demoRelated } from '~/data/journeys'
import { journeyDetails as demoDetails } from '~/data/journeyDetails'

const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()
const api = runtime.apiBaseUrl
const route = useRoute(), router = useRouter()

// The journey is loaded by slug, refetched when the visitor switches language.
// A slug the API does not publish answers 404 — and the page answers 404 too,
// rather than quietly showing the built-in demo copy: a draft must never leak
// its content through a fixture.
const { data: result, refresh } = await useAsyncData(
  () => `journey-${route.params.slug}`,
  () => fetchJourney(api, String(route.params.slug), locale.value),
  { watch: [locale, () => route.params.slug], default: () => null },
)

const journey = computed(() => {
  if (result.value?.status === 'ok') return result.value.journey
  // No API base URL configured: deliberate demo mode, same as every other page.
  if (result.value?.status === 'demo') return demoDetails[route.params.slug] ?? null
  return null
})

const notFound = computed(() => result.value?.status === 'not-found' || (result.value?.status === 'demo' && !journey.value))
const failed = computed(() => result.value?.status === 'error')

// A missing journey is a real 404 for crawlers and for the browser, while the
// page keeps the not-found design it already had. A journey the API could not
// be asked for is a temporary fault instead, so it answers 503 — the two must
// not look the same to a crawler.
if (import.meta.server && notFound.value) setResponseStatus(404)
if (import.meta.server && failed.value) setResponseStatus(503)

// The journey owns its own head: title, description, canonical and preview
// image all come from the record the API serves. A slug with no published
// journey behind it says so and is marked noindex, rather than borrowing a
// title and a photo from somewhere else.
useSeoMeta({
  title: () => journey.value
    ? (journey.value.seo?.meta_title || `${journey.value.title} — TheVTravel`)
    : `${translate('Journey not found')} — TheVTravel`,
  description: () => journey.value?.seo?.meta_description || journey.value?.overview || undefined,
  ogTitle: () => journey.value
    ? (journey.value.seo?.meta_title || `${journey.value.title} — TheVTravel`)
    : `${translate('Journey not found')} — TheVTravel`,
  ogDescription: () => journey.value?.seo?.meta_description || journey.value?.overview || undefined,
  ogImage: () => journey.value?.image?.src || undefined,
  robots: () => (journey.value && journey.value.seo?.is_indexable !== false) ? undefined : 'noindex',
})

useHead(() => ({
  link: journey.value?.seo?.canonical_url ? [{ rel: 'canonical', href: journey.value.seo.canonical_url }] : [],
}))

// "You might also like" is chosen per journey in the admin. In demo mode the
// fixtures' shared list stands in, as before.
const recommendations = computed(() => {
  if (result.value?.status === 'ok') return journey.value?.related ?? []
  return demoRelated.filter(item => item.slug !== journey.value?.slug)
})

const sections = [['overview', 'Overview'], ['itinerary', 'Itinerary'], ['included', 'Included'], ['gallery', 'Gallery'], ['reviews', 'Reviews'], ['good-to-know', 'Good to know']]
const active = computed(() => sections.some(([id]) => id === route.query.section) ? route.query.section : 'overview')
const galleryMode = computed(() => route.query.gallery === 'traveler-moments' ? 'traveler-moments' : 'official')
async function select(id, scroll = true) {
  await router.push({ query: { ...route.query, section: id } })
  if (scroll && window.matchMedia('(max-width: 767px)').matches) { await nextTick(); document.getElementById('journey-content')?.scrollIntoView({ block: 'start' }); document.getElementById('journey-content')?.focus({ preventScroll: true }) }
}
function setGallery(mode) { router.push({ query: { ...route.query, section: 'gallery', gallery: mode } }) }
const galleryViewer = ref(null)
const bookingFlow = ref(null)
const bookingOpen = ref(false)
function requestJourney() { bookingFlow.value?.open() }
function showPhotos(items, index = 0) { galleryViewer.value?.open(items, index) }
</script>
<template>
  <div class="journey-details-page">
    <SiteHeader />
    <main v-if="journey" class="jd-main">
      <JourneyHero :journey="journey" @reviews="select('reviews')" @request="requestJourney" />
      <nav v-if="!journey.catalogOnly" class="jd-desktop-nav" :aria-label='$t("Journey sections")'><button v-for="[id, label] in sections" :key="id" :class="{ active: active === id }" :aria-current="active === id ? 'true' : undefined" @click="select(id)">{{ $t(label) }}</button></nav>
      <JourneySectionContent v-if="!journey.catalogOnly" :journey="journey" :active="active" :gallery-mode="galleryMode" @gallery-mode="setGallery" @photo="showPhotos" />
      <section v-if="journey.catalogOnly" id="journey-content" class="jd-content jd-catalog-overview" tabindex="-1" :aria-label="$t('Overview')">
        <h2>{{ $t('Overview') }}</h2><p class="jd-intro">{{ journey.overview }}</p>
        <div class="listing-card-tags"><span v-for="tag in (journey.tags ?? [])" :key="tag">{{ tag }}</span></div>
        <p class="jd-catalog-guidance">{{ $t("Tell us the details and we'll get in touch to confirm your booking.") }}</p>
      </section>
      <RelatedJourneys v-if="recommendations.length" :items="recommendations" />
      <MobileJourneyControls v-if="!journey.catalogOnly" :active="active" :journey="journey" :booking-open="bookingOpen" @select="select" @request="requestJourney" />
      <div v-if="journey.catalogOnly && !bookingOpen" class="jd-mobile-controls"><div class="jd-booking-bar"><p v-if="formatUSD(journey.price)">{{ $t('From') }} <strong>{{ formatUSD(journey.price) }}</strong><span>{{ $t('per person') }}</span></p><p v-else>{{ $t('Price on request') }}</p><button class="jd-button jd-primary" @click="requestJourney">{{ $t('Request') }}</button></div></div>
    </main>
    <main v-else-if="failed" class="jd-not-found">
      <h1>{{ $t("This journey is unavailable right now") }}</h1>
      <p>{{ $t("We could not load this journey. Please try again in a moment.") }}</p>
      <button class="jd-button jd-primary" type="button" @click="refresh()">{{ $t("Try again") }}</button>
    </main>
    <main v-else class="jd-not-found"><h1>{{ $t("Journey not found") }}</h1><p>{{ $t("Explore our journeys to find your next experience.") }}</p><NuxtLink class="jd-button jd-primary" to="/journeys">{{ $t("Explore journeys") }}</NuxtLink></main>
    <SiteFooter variant="booking" />
    <JourneyGalleryViewer ref="galleryViewer" />
    <JourneyBookingFlow v-if="journey" ref="bookingFlow" :journey="journey" @open-change="bookingOpen = $event" />
  </div>
</template>
