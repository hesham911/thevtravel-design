<script setup>
import JourneyIcon from './JourneyIcon.vue'
defineProps({ journey: Object })
defineEmits(['reviews', 'request'])
</script>
<template>
  <section class="jd-hero" aria-labelledby="journey-title">
    <div class="jd-summary">
      <nav class="jd-breadcrumb" aria-label="Breadcrumb"><RouterLink to="/">Home</RouterLink><span>›</span><RouterLink to="/journeys">Journeys</RouterLink><span>›</span><span>{{ journey.title }}</span></nav>
      <p class="jd-eyebrow">Private journey</p>
      <h1 id="journey-title">{{ journey.title.split(', ')[0] }}{{ journey.title.includes(', ') ? ',' : '' }}<br v-if="journey.title.includes(', ')" class="jd-title-break" />{{ ' ' + journey.title.split(', ').slice(1).join(', ') }}</h1>
      <button class="jd-rating" @click="$emit('reviews')" :aria-label="`${journey.rating} out of 5, ${journey.reviewCount} reviews. Read reviews`"><span class="jd-stars" aria-hidden="true"><JourneyIcon v-for="n in 5" :key="n" name="star" :size="19" /></span><span><strong>{{ journey.rating }}</strong> ({{ journey.reviewCount }} reviews)</span></button>
      <ul class="jd-facts"><li v-for="[icon, text] in [['pin', journey.location], ['clock', journey.duration], ['community', journey.group], ['globe', journey.language]]" :key="icon"><JourneyIcon :name="icon" :size="23" />{{ text }}</li></ul>
      <p class="jd-price">From EGP <strong>{{ journey.price.toLocaleString('en-US') }}</strong> <span>per person</span></p>
      <div class="jd-actions"><button class="jd-button jd-primary" @click="$emit('request')">Request this journey</button><RouterLink class="jd-button" :to="{ path: '/contact', query: { journey: journey.title, subject: 'question' }, hash: '#contact-form' }">Ask a question</RouterLink></div>
      <p class="jd-payment"><JourneyIcon name="shield" :size="23" />No online payment. Pay at the start of your trip.</p>
    </div>
    <div class="jd-hero-image"><img :src="journey.image.src" :alt="journey.image.alt" fetchpriority="high" width="900" height="600" /></div>
  </section>
</template>
