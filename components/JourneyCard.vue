<script setup>
import AppIcon from './AppIcon.vue'
import { formatUSD } from '~/utils/currency'

defineProps({
  journey: { type: Object, required: true },
  layout: { type: String, default: 'grid' },
})

</script>

<template>
  <article class="listing-card" :class="`listing-card--${layout}`">
    <div class="listing-card-media">
      <PublicLink class="listing-image-link" :to="journey.detailsHref" :aria-label="`${$t('View journey')}: ${$t(journey.title)}`"><img :src="journey.image" :srcset="journey.imageSrcset" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" :alt="$t(journey.alt)" :style="{ objectPosition: journey.imagePosition || 'center' }" width="520" height="325" loading="lazy" fetchpriority="low" /></PublicLink>
      <span v-if="journey.badge" class="listing-badge">{{ $t(journey.badge) }}</span>
    </div>

    <div class="listing-card-body">
      <h3><PublicLink class="listing-title-link" :to="journey.detailsHref">{{ $t(journey.title) }}</PublicLink></h3>
      <div class="listing-card-meta">
        <span><AppIcon name="pin" :size="14" />{{ $t(journey.destination) }}</span>
        <span><AppIcon name="clock" :size="14" />{{ $t(journey.duration) }}</span>
      </div>
      <div v-if="journey.reviewCount > 0 && journey.averageRating !== null" class="listing-card-rating" :aria-label="$t('Rated {rating} out of 5 from {count} reviews', { rating: journey.averageRating.toFixed(1), count: journey.reviewCount })">
        <AppIcon name="star" :size="15" />
        <strong>{{ $t(journey.averageRating.toFixed(1)) }}</strong>
        <span>({{ $t(journey.reviewCount) }})</span>
      </div>
      <div v-else class="listing-card-rating listing-card-rating--empty">{{ $t("No reviews yet") }}</div>
      <p class="listing-card-description">{{ $t(journey.description) }}</p>
      <div v-if="journey.tags?.length" class="listing-card-tags" :aria-label='$t("Journey features")'>
        <span v-for="tag in journey.tags" :key="tag">{{ $t(tag) }}</span>
      </div>
      <div class="listing-card-footer">
        <div v-if="formatUSD(journey.price)" class="listing-card-price">{{ $t("From") }} <strong>{{ formatUSD(journey.price) }}</strong></div>
        <div v-else class="listing-card-price listing-card-price--request">{{ $t("Price on request") }}</div>
        <PublicLink :to="journey.detailsHref" :aria-label="`${$t('View journey')}: ${$t(journey.title)}`">
          {{ $t("View journey") }} <AppIcon name="arrow" :size="15" />
        </PublicLink>
      </div>
    </div>
  </article>
</template>
