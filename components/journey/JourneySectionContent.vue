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

// Every list is read defensively: a journey served by the API carries only
// what an admin has written, and the review module does not exist yet — so
// `travelers` and `distribution` are empty, and the sections that would show
// them show their empty state instead of a fabricated figure.
const features = computed(() => props.journey.features ?? [])
const itinerary = computed(() => props.journey.itinerary ?? [])
const included = computed(() => props.journey.included ?? [])
const gallery = computed(() => props.journey.gallery ?? [])
const goodToKnow = computed(() => props.journey.goodToKnow ?? [])
const travelers = computed(() => props.journey.travelers ?? [])
const reviews = computed(() => travelers.value.filter(traveler => traveler.text))
const reviewCount = computed(() => Number(props.journey.reviewCount) || 0)
const hasReviews = computed(() => reviewCount.value > 0 && props.journey.rating != null)

// A heading or introduction the journey owns wins; otherwise the page keeps
// the copy it has always shown, translated through the demo table.
const itineraryLines = computed(() => {
  const intro = props.journey.itineraryIntro
  if (typeof intro === 'string' && intro.trim()) return intro.split('\n').map(line => line.trim()).filter(Boolean)
  return null
})

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
      <div class="jd-overview-grid"><div class="jd-overview-copy"><p class="jd-eyebrow">{{ $t("Overview") }}</p><h2>{{ $t("Overview") }}</h2><p>{{ journey.overview }}</p><img class="jd-lineart" src="/assets/decorative/cta-lineart-left.svg" alt="" /></div><div class="jd-features"><article v-for="item in features" :key="item.title"><JourneyIcon :name="item.icon" :size="38" /><div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div></article></div></div>
    </template>
    <template v-else-if="active === 'itinerary'">
      <h2>{{ journey.itineraryHeading || $t("Itinerary") }}</h2>
      <p class="jd-intro">
        <template v-if="itineraryLines"><template v-for="(line, index) in itineraryLines" :key="index"><br v-if="index" class="jd-desktop-break" />{{ index ? ' ' : '' }}{{ line }}</template></template>
        <template v-else>{{ $t("Follow in the footsteps of pharaohs and explore some of ancient Egypt’s most extraordinary sites.") }}<br class="jd-desktop-break" /> {{ $t("A calm, unhurried morning with time to take in the history, the landscapes and the atmosphere.") }}</template>
      </p>
      <div class="jd-itinerary-grid" :class="{ 'jd-itinerary-grid--text-only': !showVideo }"><ol class="jd-timeline"><li v-for="([time, title, text], i) in itinerary" :key="`${time}-${i}`"><span class="jd-step">{{ $t(i + 1) }}</span><time>{{ time }}</time><div><h3>{{ title }}</h3><p>{{ text }}</p></div></li></ol><JourneyVideo v-if="showVideo" :media="journey.itineraryMedia" @unavailable="videoFailed = true" /></div>
    </template>
    <template v-else-if="active === 'included'">
      <p class="jd-eyebrow">{{ $t("Included") }}</p><h2>{{ journey.includedHeading || $t("What’s included in this journey") }}</h2><p class="jd-intro">{{ journey.includedIntro || $t("Here’s what’s covered in your private journey, so you can plan with confidence.") }}</p><div class="jd-included"><article v-for="item in included" :key="item.title"><JourneyIcon :name="item.icon" :size="36" /><div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div></article></div><img class="jd-included-art" src="/assets/decorative/cta-lineart-right.svg" alt="" />
    </template>
    <template v-else-if="active === 'gallery'">
      <div class="jd-gallery-heading"><div><p class="jd-eyebrow">{{ $t("Gallery") }}</p><h2>{{ $t(galleryMode === 'official' ? 'Gallery' : 'Traveler moments') }}</h2><p>{{ galleryMode === 'official' ? (journey.galleryIntro || $t("Official photos")) : $t("Real photos and stories from travelers who experienced this journey.") }}</p></div><div class="jd-gallery-toggle" :aria-label='$t("Gallery type")'><button :class="{ active: galleryMode === 'official' }" :aria-pressed="galleryMode === 'official'" @click="emit('gallery-mode', 'official')">{{ $t("Official photos (") }}{{ $t(gallery.length) }})</button><button :class="{ active: galleryMode === 'traveler-moments' }" :aria-pressed="galleryMode === 'traveler-moments'" @click="emit('gallery-mode', 'traveler-moments')">{{ $t("Traveler moments (") }}{{ $t(travelers.length) }})</button></div></div>
      <div v-if="galleryMode === 'official' && gallery.length" class="jd-photo-grid"><button v-for="(photo, i) in gallery" :key="photo.src" :aria-label="$t('Enlarge photo: {description}', { description: photo.alt })" @click="emit('photo', gallery, i)"><img :src="photo.src" :alt="photo.alt" loading="lazy" /></button></div>
      <div v-else-if="galleryMode === 'official'" class="jd-empty-state"><JourneyIcon name="image" :size="40" /><h3>{{ $t("No photos yet") }}</h3><p>{{ $t("Photos for this journey are on their way.") }}</p></div>
      <div v-else-if="travelers.length" class="jd-moments"><article v-for="traveler in travelers" :key="traveler.name"><div class="jd-moment-photos"><button v-for="(photo, i) in traveler.photos" :key="i" :aria-label="$t('Photo by {name}: {description}', { name: traveler.name, description: photo.alt })" @click="emit('photo', traveler.photos, i)"><img :src="photo.src" :alt="photo.alt" loading="lazy" /></button></div><div class="jd-traveler-line"><span class="jd-avatar" aria-hidden="true">{{ traveler.name.charAt(0) }}</span><strong>{{ traveler.name }}</strong><small>{{ $t("Traveled in") }} {{ traveler.date }}</small><button :aria-label="$t('Share traveler moments by {name}', { name: traveler.name })" @click="share(traveler)"><JourneyIcon name="share" :size="19" /></button></div></article></div>
      <div v-else class="jd-empty-state"><JourneyIcon name="camera" :size="40" /><h3>{{ $t("No traveler photos yet") }}</h3><p>{{ $t("Photos shared by travelers will appear here once they return from this journey.") }}</p></div>
      <p role="status">{{ $t(status) }}</p>
    </template>
    <template v-else-if="active === 'reviews'">
      <p class="jd-eyebrow">{{ $t("Reviews") }}</p><h2>{{ $t("What travelers say") }}</h2><p class="jd-intro">{{ $t("Real stories from travelers who experienced this journey.") }}</p>
      <template v-if="hasReviews">
        <div class="jd-review-summary"><div class="jd-rating-card"><div><strong class="jd-rating-number">{{ $t(journey.rating) }}</strong><span class="jd-stars"><JourneyIcon v-for="n in 5" :key="n" name="star" :size="23" /></span><p>{{ $t(reviewCount) }} {{ $t("verified reviews") }}</p></div><div class="jd-distribution"><div v-for="(count, i) in (journey.distribution ?? [])" :key="i"><span>{{ $t(5 - i) }} <JourneyIcon name="star" :size="12" /></span><div><span :style="{ width: `${count / reviewCount * 100}%` }"></span></div><small>{{ $t(count) }}</small></div></div></div><div class="jd-review-trust"><JourneyIcon name="community" :size="46" /><div><strong>{{ $t("100% verified travelers") }}</strong><p>{{ $t("All reviews are from real travelers who booked this journey with TheVTravel.") }}</p></div></div></div>
        <div class="jd-reviews"><article v-for="traveler in reviews" :key="traveler.name"><span class="jd-avatar" aria-hidden="true">{{ traveler.name.charAt(0) }}</span><div class="jd-review-copy"><div class="jd-review-name"><h3>{{ traveler.name }}</h3></div><div class="jd-review-meta"><span class="jd-stars"><JourneyIcon v-for="n in 5" :key="n" :name="n <= traveler.rating ? 'star' : 'outline-star'" :size="17" /></span><strong>{{ $t(traveler.rating.toFixed(1)) }}</strong><span>{{ $t(traveler.type) }} {{ $t("· Traveled in") }} {{ $t(traveler.date) }}</span></div><p>{{ traveler.text }}</p></div><div class="jd-review-photos"><button v-for="(photo, i) in traveler.photos" :key="i" :aria-label="$t('Enlarge review photo: {description}', { description: photo.alt })" @click="emit('photo', traveler.photos, i)"><img :src="photo.src" :alt="photo.alt" loading="lazy" /></button></div></article></div>
      </template>
      <div v-else class="jd-empty-state"><JourneyIcon name="outline-star" :size="40" /><h3>{{ $t("No reviews yet for this journey") }}</h3><p>{{ $t("Travelers who book this journey will be able to share their experience here.") }}</p></div>
    </template>
    <template v-else-if="active === 'good-to-know'">
      <div class="jd-good-grid"><div><p class="jd-eyebrow">{{ $t("Good to know") }}</p><h2>{{ journey.goodToKnowHeading || `${$t('Practical information')} ${$t('for your journey')}` }}</h2><p class="jd-intro">{{ journey.goodToKnowIntro || $t("Here are the key details to help you plan your experience in Luxor’s west bank. If you have any other questions, we’re here to help.") }}</p><img class="jd-lineart" src="/assets/decorative/cta-lineart-left.svg" alt="" /></div><div class="jd-good-items"><article v-for="item in goodToKnow" :key="item.title"><span><JourneyIcon :name="item.icon" :size="30" /></span><div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div></article></div></div>
    </template>
  </section>
</template>
