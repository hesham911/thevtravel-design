<script setup>
definePageMeta({"name": "journey-details", "title": "Journey Details \u2014 TheVTravel"})
import { formatUSD } from '~/utils/currency'
import { computed, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import SiteHeader from '~/components/SiteHeader.vue'
import JourneyHero from '~/components/journey/JourneyHero.vue'
import JourneySectionContent from '~/components/journey/JourneySectionContent.vue'
import MobileJourneyControls from '~/components/journey/MobileJourneyControls.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import RelatedJourneys from '~/components/journey/RelatedJourneys.vue'
import JourneyBookingFlow from '~/components/journey/JourneyBookingFlow.vue'
import JourneyGalleryViewer from '~/components/journey/JourneyGalleryViewer.vue'
import { useI18n } from '~/utils/i18n'
const { translate, locale } = useI18n()
import { relatedJourneys } from '~/data/journeys'
import { journeyDetails } from '~/data/journeyDetails'
const route = useRoute(), router = useRouter()
const journey = computed(() => journeyDetails[route.params.slug])
const recommendations = computed(() => relatedJourneys.filter(item => item.slug !== journey.value?.slug))
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
        <h2>{{ $t('Overview') }}</h2><p class="jd-intro">{{ $t(journey.overview) }}</p>
        <div class="listing-card-tags"><span v-for="tag in journey.tags" :key="tag">{{ $t(tag) }}</span></div>
        <p class="jd-catalog-guidance">{{ $t("Tell us the details and we'll get in touch to confirm your booking.") }}</p>
      </section>
      <RelatedJourneys :items="recommendations" />
      <MobileJourneyControls v-if="!journey.catalogOnly" :active="active" :journey="journey" :booking-open="bookingOpen" @select="select" @request="requestJourney" />
      <div v-if="journey.catalogOnly && !bookingOpen" class="jd-mobile-controls"><div class="jd-booking-bar"><p v-if="formatUSD(journey.price)">{{ $t('From') }} <strong>{{ formatUSD(journey.price) }}</strong><span>{{ $t('per person') }}</span></p><p v-else>{{ $t('Price on request') }}</p><button class="jd-button jd-primary" @click="requestJourney">{{ $t('Request') }}</button></div></div>
    </main>
    <main v-else class="jd-not-found"><h1>{{ $t("Journey not found") }}</h1><p>{{ $t("Explore our journeys to find your next experience.") }}</p><NuxtLink class="jd-button jd-primary" to="/journeys">{{ $t("Explore journeys") }}</NuxtLink></main>
    <SiteFooter variant="booking" />
    <JourneyGalleryViewer ref="galleryViewer" />
    <JourneyBookingFlow v-if="journey" ref="bookingFlow" :journey="journey" @open-change="bookingOpen = $event" />
  </div>
</template>
