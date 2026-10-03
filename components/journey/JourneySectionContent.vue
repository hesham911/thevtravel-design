<script setup>
import { computed, ref, watch } from 'vue'
import JourneyVideo from './JourneyVideo.vue'
import { hasVideoSource } from '~/utils/journeyMedia'
import JourneyIcon from './JourneyIcon.vue'
const props = defineProps({ journey: Object, active: String, galleryMode: String })
const emit = defineEmits(['gallery-mode', 'photo'])
const videoFailed = ref(false)
const showVideo = computed(() => hasVideoSource(props.journey.itineraryMedia) && !videoFailed.value)
watch(() => props.journey.itineraryMedia?.src, () => { videoFailed.value = false })
const reviews = computed(() => props.journey.travelers.filter(t => t.text))
async function share(traveler) {
  const url = new URL(window.location.href); url.searchParams.set('section', 'gallery'); url.searchParams.set('gallery', 'traveler-moments')
  if (navigator.share) { try { await navigator.share({ title: `${traveler.name} — ${props.journey.title}`, url: url.href }) } catch {} }
  else { try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(url.href); status.value = 'Gallery link copied.' } catch { status.value = 'Copy the page address to share this gallery.' } }
}
const status = ref('')
</script>
<template>
  <section id="journey-content" class="jd-content" tabindex="-1" :aria-label="$t(({ overview: 'Overview', itinerary: 'Itinerary', included: 'Included', gallery: 'Gallery', reviews: 'Reviews', 'good-to-know': 'Good to know' })[active])">
    <template v-if="active === 'overview'">
      <div class="jd-overview-grid"><div class="jd-overview-copy"><p class="jd-eyebrow">{{ $t("Overview") }}</p><h2>{{ $t("Overview") }}</h2><p>{{ $t(journey.overview) }}</p><img class="jd-lineart" src="/assets/decorative/cta-lineart-left.svg" alt="" /></div><div class="jd-features"><article v-for="item in journey.features" :key="item.title"><JourneyIcon :name="item.icon" :size="38" /><div><h3>{{ $t(item.title) }}</h3><p>{{ $t(item.text) }}</p></div></article></div></div>
    </template>
    <template v-else-if="active === 'itinerary'">
      <h2>{{ $t("Itinerary") }}</h2><p class="jd-intro">{{ $t("Follow in the footsteps of pharaohs and explore some of ancient Egypt’s most extraordinary sites.") }}<br class="jd-desktop-break" /> {{ $t("A calm, unhurried morning with time to take in the history, the landscapes and the atmosphere.") }}</p>
      <div class="jd-itinerary-grid" :class="{ 'jd-itinerary-grid--text-only': !showVideo }"><ol class="jd-timeline"><li v-for="([time, title, text], i) in journey.itinerary" :key="time"><span class="jd-step">{{ $t(i + 1) }}</span><time>{{ $t(time) }}</time><div><h3>{{ $t(title) }}</h3><p>{{ $t(text) }}</p></div></li></ol><JourneyVideo v-if="showVideo" :media="journey.itineraryMedia" @unavailable="videoFailed = true" /></div>
    </template>
    <template v-else-if="active === 'included'">
      <p class="jd-eyebrow">{{ $t("Included") }}</p><h2>{{ $t("What’s included in this journey") }}</h2><p class="jd-intro">{{ $t("Here’s what’s covered in your private journey, so you can plan with confidence.") }}</p><div class="jd-included"><article v-for="item in journey.included" :key="item.title"><JourneyIcon :name="item.icon" :size="36" /><div><h3>{{ $t(item.title) }}</h3><p>{{ $t(item.text) }}</p></div></article></div><img class="jd-included-art" src="/assets/decorative/cta-lineart-right.svg" alt="" />
    </template>
    <template v-else-if="active === 'gallery'">
      <div class="jd-gallery-heading"><div><p class="jd-eyebrow">{{ $t("Gallery") }}</p><h2>{{ $t(galleryMode === 'official' ? 'Gallery' : 'Traveler moments') }}</h2><p>{{ $t(galleryMode === 'official' ? 'Explore the beauty of Luxor through our official photos and real moments shared by our travelers.' : 'Real photos and stories from travelers who experienced this journey.') }}</p></div><div class="jd-gallery-toggle" :aria-label='$t("Gallery type")'><button :class="{ active: galleryMode === 'official' }" :aria-pressed="galleryMode === 'official'" @click="emit('gallery-mode', 'official')">{{ $t("Official photos (") }}{{ $t(journey.gallery.length) }})</button><button :class="{ active: galleryMode === 'traveler-moments' }" :aria-pressed="galleryMode === 'traveler-moments'" @click="emit('gallery-mode', 'traveler-moments')">{{ $t("Traveler moments (") }}{{ $t(journey.travelers.length) }})</button></div></div>
      <div v-if="galleryMode === 'official'" class="jd-photo-grid"><button v-for="(photo, i) in journey.gallery" :key="photo.src" :aria-label="$t('Enlarge photo: {description}', { description: $t(photo.alt) })" @click="emit('photo', journey.gallery, i)"><img :src="photo.src" :alt="$t(photo.alt)" loading="lazy" /></button></div>
      <div v-else class="jd-moments"><article v-for="traveler in journey.travelers" :key="traveler.name"><div class="jd-moment-photos"><button v-for="(photo, i) in traveler.photos" :key="i" :aria-label="$t('Photo by {name}: {description}', { name: traveler.name, description: $t(photo.alt) })" @click="emit('photo', traveler.photos, i)"><img :src="photo.src" :alt="$t(photo.alt)" loading="lazy" /></button></div><div class="jd-traveler-line"><span class="jd-avatar" aria-hidden="true">{{ traveler.name.charAt(0) }}</span><strong>{{ traveler.name }}</strong><JourneyIcon class="jd-verified" name="shield" :size="15" /><small>{{ $t("Traveled in") }} {{ $t(traveler.date) }}</small><button :aria-label="$t('Share traveler moments by {name}', { name: traveler.name })" @click="share(traveler)"><JourneyIcon name="share" :size="19" /></button></div></article></div><p role="status">{{ $t(status) }}</p>
    </template>
    <template v-else-if="active === 'reviews'">
      <p class="jd-eyebrow">{{ $t("Reviews") }}</p><h2>{{ $t("What travelers say") }}</h2><p class="jd-intro">{{ $t("Real stories from travelers who experienced this journey.") }}</p><div class="jd-review-summary"><div class="jd-rating-card"><div><strong class="jd-rating-number">{{ $t(journey.rating) }}</strong><span class="jd-stars"><JourneyIcon v-for="n in 5" :key="n" name="star" :size="23" /></span><p>{{ $t(journey.reviewCount) }} {{ $t("verified reviews") }}</p></div><div class="jd-distribution"><div v-for="(count, i) in journey.distribution" :key="i"><span>{{ $t(5 - i) }} <JourneyIcon name="star" :size="12" /></span><div><span :style="{ width: `${count / journey.reviewCount * 100}%` }"></span></div><small>{{ $t(count) }}</small></div></div></div><div class="jd-review-trust"><JourneyIcon name="community" :size="46" /><div><strong>{{ $t("100% verified travelers") }}</strong><p>{{ $t("All reviews are from real travelers who booked this journey with TheVTravel.") }}</p></div></div></div>
      <div class="jd-reviews"><article v-for="traveler in reviews" :key="traveler.name"><span class="jd-avatar" aria-hidden="true">{{ traveler.name.charAt(0) }}</span><div class="jd-review-copy"><div class="jd-review-name"><h3>{{ traveler.name }}</h3><JourneyIcon class="jd-verified" name="shield" :size="18" /><small>{{ $t("Verified traveler") }}</small></div><div class="jd-review-meta"><span class="jd-stars"><JourneyIcon v-for="n in 5" :key="n" :name="n <= traveler.rating ? 'star' : 'outline-star'" :size="17" /></span><strong>{{ $t(traveler.rating.toFixed(1)) }}</strong><span>{{ $t(traveler.type) }} {{ $t("· Traveled in") }} {{ $t(traveler.date) }}</span></div><p>{{ $t(traveler.text) }}</p></div><div class="jd-review-photos"><button v-for="(photo, i) in traveler.photos" :key="i" :aria-label="$t('Enlarge review photo: {description}', { description: $t(photo.alt) })" @click="emit('photo', traveler.photos, i)"><img :src="photo.src" :alt="$t(photo.alt)" loading="lazy" /></button></div></article></div>
    </template>
    <template v-else-if="active === 'good-to-know'">
      <div class="jd-good-grid"><div><p class="jd-eyebrow">{{ $t("Good to know") }}</p><h2>{{ $t("Practical information") }}<br />{{ $t("for your journey") }}</h2><p class="jd-intro">{{ $t("Here are the key details to help you plan your experience in Luxor’s west bank. If you have any other questions, we’re here to help.") }}</p><img class="jd-lineart" src="/assets/decorative/cta-lineart-left.svg" alt="" /></div><div class="jd-good-items"><article v-for="item in journey.goodToKnow" :key="item.title"><span><JourneyIcon :name="item.icon" :size="30" /></span><div><h3>{{ $t(item.title) }}</h3><p>{{ $t(item.text) }}</p></div></article></div></div>
    </template>
  </section>
</template>
