<script setup>
import { computed, ref, watch } from 'vue'
import JourneyIcon from './JourneyIcon.vue'
import { hasVideoSource } from '../../utils/journeyMedia'
const props = defineProps({ media: { type: Object, required: true } })
const emit = defineEmits(['unavailable'])
const usable = computed(() => hasVideoSource(props.media))
const playing = ref(false)
const error = ref(false)
watch(() => props.media.src, () => { playing.value = false; error.value = false })
</script>
<template>
  <figure v-if="usable && !error" class="jd-video-card">
    <video v-if="playing && media.src && !error" :src="media.src" :poster="media.poster?.src" controls autoplay playsinline preload="metadata" :aria-label="media.title" @error="error = true; playing = false; emit('unavailable')"><track v-if="media.captions" kind="captions" :src="media.captions" srclang="en" label="English" default /></video>
    <div v-else class="jd-video-poster"><img v-if="media.poster" :src="media.poster.src" :alt="media.poster.alt" loading="lazy" width="800" height="500" /><button class="jd-video-play" :aria-label="`Play ${media.title}`" @click="playing = true"><JourneyIcon name="play" :size="31" /></button></div>
    <figcaption class="jd-video-caption">{{ media.title }}</figcaption>
  </figure>
</template>
