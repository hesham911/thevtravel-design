<script setup>
import JourneyIcon from './JourneyIcon.vue'
defineProps({ journey: { type: Object, required: true }, review: Boolean })
</script>
<template>
  <article class="jb-summary" :class="{ 'jb-summary--review': review }">
    <img v-if="review" :src="journey.image.src" :alt="journey.image.alt" />
    <div><span v-if="!review" class="jb-badge">Private journey</span><h3>{{ journey.title }}</h3>
      <ul><li v-for="[icon, text] in [['pin', journey.location], ['clock', journey.duration], ['community', journey.group], ['globe', journey.language]]" :key="icon"><JourneyIcon :name="icon" :size="19" /><span>{{ text }}</span></li></ul>
    </div>
  </article>
</template>
