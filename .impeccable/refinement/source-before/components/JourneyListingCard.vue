<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  journey: { type: Object, required: true },
  layout: { type: String, default: 'grid' },
})

const money = new Intl.NumberFormat('en-EG')

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return null

  const amount = Number(price)
  return Number.isFinite(amount) ? money.format(amount) : null
}
</script>

<template>
  <article class="listing-card" :class="`listing-card--${layout}`">
    <div class="listing-card-media">
      <img :src="journey.image" :alt="journey.alt" width="520" height="325" loading="lazy" />
      <span v-if="journey.badge" class="listing-badge">{{ journey.badge }}</span>
    </div>

    <div class="listing-card-body">
      <h2>{{ journey.title }}</h2>
      <div class="listing-card-meta">
        <span><AppIcon name="pin" :size="14" />{{ journey.destination }}</span>
        <span><AppIcon name="clock" :size="14" />{{ journey.duration }}</span>
      </div>
      <div v-if="journey.reviewCount > 0 && journey.averageRating !== null" class="listing-card-rating" :aria-label="`Rated ${journey.averageRating.toFixed(1)} out of 5 from ${journey.reviewCount} reviews`">
        <AppIcon name="star" :size="15" />
        <strong>{{ journey.averageRating.toFixed(1) }}</strong>
        <span>({{ journey.reviewCount }})</span>
      </div>
      <div v-else class="listing-card-rating listing-card-rating--empty">No reviews yet</div>
      <p class="listing-card-description">{{ journey.description }}</p>
      <div v-if="journey.tags?.length" class="listing-card-tags" aria-label="Journey features">
        <span v-for="tag in journey.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="listing-card-footer">
        <div v-if="formatPrice(journey.price)" class="listing-card-price">From <strong>EGP {{ formatPrice(journey.price) }}</strong></div>
        <div v-else class="listing-card-price listing-card-price--request">Price on request</div>
        <a :href="journey.detailsHref || `/journeys#journey-${journey.id}`" :aria-label="`View journey: ${journey.title}`">
          View journey <AppIcon name="arrow" :size="15" />
        </a>
      </div>
    </div>
  </article>
</template>
