<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  journey: { type: Object, required: true },
})
</script>

<template>
  <article class="journey-card">
    <img class="journey-image" :src="journey.image" :alt="journey.alt" width="488" height="284" loading="lazy" />
    <div class="journey-body">
      <h3>{{ journey.title }}</h3>
      <div class="journey-meta">
        <span><AppIcon name="pin" :size="15" />{{ journey.locations }}</span>
        <span><AppIcon name="clock" :size="15" />{{ journey.duration }}</span>
      </div>
      <p>{{ journey.description }}</p>
      <div class="journey-tags" aria-label="Journey features">
        <span v-for="tag in journey.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="journey-footer">
        <strong>{{ journey.priceLabel || 'From' }} <span v-if="!journey.priceLabel">—</span></strong>
        <a href="#request">View journey <AppIcon name="arrow" :size="16" /></a>
      </div>
    </div>
  </article>
</template>
