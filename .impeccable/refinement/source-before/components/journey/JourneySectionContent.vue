<script setup>
import { computed, ref, watch } from 'vue'
import JourneyVideo from './JourneyVideo.vue'
import { hasVideoSource } from '../../utils/journeyMedia'
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
  <section id="journey-content" class="jd-content" tabindex="-1" :aria-label="active.replaceAll('-', ' ')">
    <template v-if="active === 'overview'">
      <div class="jd-overview-grid"><div class="jd-overview-copy"><p class="jd-eyebrow">Overview</p><h2>Overview</h2><p>{{ journey.overview }}</p><img class="jd-lineart" src="/assets/decorative/cta-lineart-left.svg" alt="" /></div><div class="jd-features"><article v-for="item in journey.features" :key="item.title"><JourneyIcon :name="item.icon" :size="38" /><div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div></article></div></div>
    </template>
    <template v-else-if="active === 'itinerary'">
      <h2>Itinerary</h2><p class="jd-intro">Follow in the footsteps of pharaohs and explore some of ancient Egypt’s most extraordinary sites.<br class="jd-desktop-break" /> A calm, unhurried morning with time to take in the history, the landscapes and the atmosphere.</p>
      <div class="jd-itinerary-grid" :class="{ 'jd-itinerary-grid--text-only': !showVideo }"><ol class="jd-timeline"><li v-for="([time, title, text], i) in journey.itinerary" :key="time"><span class="jd-step">{{ i + 1 }}</span><time>{{ time }}</time><div><h3>{{ title }}</h3><p>{{ text }}</p></div></li></ol><JourneyVideo v-if="showVideo" :media="journey.itineraryMedia" @unavailable="videoFailed = true" /></div>
    </template>
    <template v-else-if="active === 'included'">
      <p class="jd-eyebrow">Included</p><h2>What’s included in this journey</h2><p class="jd-intro">Here’s what’s covered in your private journey, so you can plan with confidence.</p><div class="jd-included"><article v-for="item in journey.included" :key="item.title"><JourneyIcon :name="item.icon" :size="36" /><div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div></article></div><img class="jd-included-art" src="/assets/decorative/cta-lineart-right.svg" alt="" />
    </template>
    <template v-else-if="active === 'gallery'">
      <div class="jd-gallery-heading"><div><p class="jd-eyebrow">Gallery</p><h2>{{ galleryMode === 'official' ? 'Gallery' : 'Traveler moments' }}</h2><p>{{ galleryMode === 'official' ? 'Explore the beauty of Luxor through our official photos and real moments shared by our travelers.' : 'Real photos and stories from travelers who experienced this journey.' }}</p></div><div class="jd-gallery-toggle" aria-label="Gallery type"><button :class="{ active: galleryMode === 'official' }" :aria-pressed="galleryMode === 'official'" @click="emit('gallery-mode', 'official')">Official photos ({{ journey.gallery.length }})</button><button :class="{ active: galleryMode === 'traveler-moments' }" :aria-pressed="galleryMode === 'traveler-moments'" @click="emit('gallery-mode', 'traveler-moments')">Traveler moments ({{ journey.travelers.length }})</button></div></div>
      <div v-if="galleryMode === 'official'" class="jd-photo-grid"><button v-for="(photo, i) in journey.gallery" :key="photo.src" :aria-label="`Enlarge photo: ${photo.alt}`" @click="emit('photo', journey.gallery, i)"><img :src="photo.src" :alt="photo.alt" loading="lazy" /></button></div>
      <div v-else class="jd-moments"><article v-for="traveler in journey.travelers" :key="traveler.name"><div class="jd-moment-photos"><button v-for="(photo, i) in traveler.photos" :key="i" :aria-label="`View ${traveler.name}'s photo: ${photo.alt}`" @click="emit('photo', traveler.photos, i)"><img :src="photo.src" :alt="photo.alt" loading="lazy" /></button></div><div class="jd-traveler-line"><span class="jd-avatar" aria-hidden="true">{{ traveler.name.charAt(0) }}</span><strong>{{ traveler.name }}</strong><JourneyIcon class="jd-verified" name="shield" :size="15" /><small>Traveled in {{ traveler.date }}</small><button :aria-label="`Share ${traveler.name}'s traveler moments`" @click="share(traveler)"><JourneyIcon name="share" :size="19" /></button></div></article></div><p role="status">{{ status }}</p>
    </template>
    <template v-else-if="active === 'reviews'">
      <p class="jd-eyebrow">Reviews</p><h2>What travelers say</h2><p class="jd-intro">Real stories from travelers who experienced this journey.</p><div class="jd-review-summary"><div class="jd-rating-card"><div><strong class="jd-rating-number">{{ journey.rating }}</strong><span class="jd-stars"><JourneyIcon v-for="n in 5" :key="n" name="star" :size="23" /></span><p>{{ journey.reviewCount }} verified reviews</p></div><div class="jd-distribution"><div v-for="(count, i) in journey.distribution" :key="i"><span>{{ 5 - i }} <JourneyIcon name="star" :size="12" /></span><div><span :style="{ width: `${count / journey.reviewCount * 100}%` }"></span></div><small>{{ count }}</small></div></div></div><div class="jd-review-trust"><JourneyIcon name="community" :size="46" /><div><strong>100% verified travelers</strong><p>All reviews are from real travelers who booked this journey with TheVTravel.</p></div></div></div>
      <div class="jd-reviews"><article v-for="traveler in reviews" :key="traveler.name"><span class="jd-avatar" aria-hidden="true">{{ traveler.name.charAt(0) }}</span><div class="jd-review-copy"><div class="jd-review-name"><h3>{{ traveler.name }}</h3><JourneyIcon class="jd-verified" name="shield" :size="18" /><small>Verified traveler</small></div><div class="jd-review-meta"><span class="jd-stars"><JourneyIcon v-for="n in 5" :key="n" :name="n <= traveler.rating ? 'star' : 'outline-star'" :size="17" /></span><strong>{{ traveler.rating.toFixed(1) }}</strong><span>{{ traveler.type }} · Traveled in {{ traveler.date }}</span></div><p>{{ traveler.text }}</p></div><div class="jd-review-photos"><button v-for="(photo, i) in traveler.photos" :key="i" :aria-label="`Enlarge review photo: ${photo.alt}`" @click="emit('photo', traveler.photos, i)"><img :src="photo.src" :alt="photo.alt" loading="lazy" /></button></div></article></div>
    </template>
    <template v-else-if="active === 'good-to-know'">
      <div class="jd-good-grid"><div><p class="jd-eyebrow">Good to know</p><h2>Practical information<br />for your journey</h2><p class="jd-intro">Here are the key details to help you plan your experience in Luxor’s west bank. If you have any other questions, we’re here to help.</p><img class="jd-lineart" src="/assets/decorative/cta-lineart-left.svg" alt="" /></div><div class="jd-good-items"><article v-for="item in journey.goodToKnow" :key="item.title"><span><JourneyIcon :name="item.icon" :size="30" /></span><div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div></article></div></div>
    </template>
  </section>
</template>
