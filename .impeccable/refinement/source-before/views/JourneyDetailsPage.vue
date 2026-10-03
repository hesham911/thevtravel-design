<script setup>
import { computed, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SiteHeader from '../components/SiteHeader.vue'
import JourneyHero from '../components/journey/JourneyHero.vue'
import JourneySectionContent from '../components/journey/JourneySectionContent.vue'
import MobileJourneyControls from '../components/journey/MobileJourneyControls.vue'
import SiteFooter from '../components/SiteFooter.vue'
import RelatedJourneys from '../components/journey/RelatedJourneys.vue'
import JourneyBookingFlow from '../components/journey/JourneyBookingFlow.vue'
import JourneyGalleryViewer from '../components/journey/JourneyGalleryViewer.vue'
import { journeyDetails } from '../data/journeyDetails'
import '../journey-details.css'
const route = useRoute(), router = useRouter()
const journey = computed(() => journeyDetails[route.params.slug])
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
watch(journey, (value) => { document.title = value ? `${value.title} — TheVTravel` : 'Journey not found — TheVTravel' }, { immediate: true })
</script>
<template>
  <div class="journey-details-page">
    <SiteHeader />
    <main v-if="journey" class="jd-main">
      <JourneyHero :journey="journey" @reviews="select('reviews')" @request="requestJourney" />
      <nav class="jd-desktop-nav" aria-label="Journey sections"><button v-for="[id, label] in sections" :key="id" :class="{ active: active === id }" :aria-current="active === id ? 'true' : undefined" @click="select(id)">{{ label }}</button></nav>
      <JourneySectionContent :journey="journey" :active="active" :gallery-mode="galleryMode" @gallery-mode="setGallery" @photo="showPhotos" />
      <RelatedJourneys :items="journey.recommendations" />
      <MobileJourneyControls :active="active" :journey="journey" :booking-open="bookingOpen" @select="select" @request="requestJourney" />
    </main>
    <main v-else class="jd-not-found"><h1>Journey not found</h1><p>Explore our journeys to find your next experience.</p><RouterLink class="jd-button jd-primary" to="/journeys">Explore journeys</RouterLink></main>
    <SiteFooter variant="booking" />
    <JourneyGalleryViewer ref="galleryViewer" />
    <JourneyBookingFlow v-if="journey" ref="bookingFlow" :journey="journey" @open-change="bookingOpen = $event" />
  </div>
</template>
