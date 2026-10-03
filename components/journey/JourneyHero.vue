<script setup>
import { lcpImage } from '~/utils/lcpImage'
import { formatUSD } from '~/utils/currency'
import JourneyIcon from './JourneyIcon.vue'
defineProps({ journey: Object })
defineEmits(['reviews', 'request'])
</script>
<template>
  <section class="jd-hero" aria-labelledby="journey-title">
    <div class="jd-summary">
      <nav class="jd-breadcrumb" :aria-label='$t("Breadcrumb")'><NuxtLink to="/">{{ $t("Home") }}</NuxtLink><JourneyIcon name="chevron-right" :size="13" /><NuxtLink to="/journeys">{{ $t("Journeys") }}</NuxtLink><JourneyIcon name="chevron-right" :size="13" /><span>{{ $t(journey.title) }}</span></nav>
      <p class="jd-eyebrow">{{ $t("Private journey") }}</p>
      <h1 id="journey-title">{{ $t(journey.title) }}</h1>
      <button v-if="journey.reviewCount > 0 && journey.rating != null" class="jd-rating" @click="$emit('reviews')" :aria-label="$t('{rating} out of 5, {count} reviews. Read reviews', { rating: journey.rating, count: journey.reviewCount })"><span class="jd-stars" aria-hidden="true"><JourneyIcon v-for="n in 5" :key="n" name="star" :size="19" /></span><span><strong>{{ $t(journey.rating) }}</strong> ({{ $t(journey.reviewCount) }} {{ $t("reviews)") }}</span></button>
      <ul class="jd-facts"><li v-for="[icon, text] in [['pin', journey.location], ['clock', journey.duration], ['community', journey.group], ['globe', journey.language]].filter(([, text]) => text)" :key="icon"><JourneyIcon :name="icon" :size="23" />{{ $t(text) }}</li></ul>
      <p v-if="formatUSD(journey.price)" class="jd-price">{{ $t("From") }} <strong>{{ formatUSD(journey.price) }}</strong> <span>{{ $t("per person") }}</span></p>
      <p v-else class="jd-price">{{ $t("Price on request") }}</p>
      <div class="jd-actions"><button class="jd-button jd-primary" @click="$emit('request')">{{ $t("Request this journey") }}</button><NuxtLink class="jd-button" :to="{ path: '/contact', query: { journey: journey.title, subject: 'question' }, hash: '#contact-form' }">{{ $t("Ask a question") }}</NuxtLink></div>
      <p class="jd-payment"><JourneyIcon name="shield" :size="23" />{{ $t("No online payment. Pay at the start of your trip.") }}</p>
    </div>
    <div class="jd-hero-image"><img :src="lcpImage(journey.image.src).src" :alt="$t(journey.image.alt)" :style="{ objectPosition: journey.image.position || 'center' }" loading="eager" fetchpriority="high" width="900" height="600" /></div>
  </section>
</template>
