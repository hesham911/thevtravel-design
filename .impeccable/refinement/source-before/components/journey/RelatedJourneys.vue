<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import JourneyIcon from './JourneyIcon.vue'
const props = defineProps({ items: { type: Array, default: () => [] } })
const track = ref(null)
const index = ref(0)
const visible = ref(3)
const end = computed(() => Math.max(0, props.items.length - visible.value))
function measure() { visible.value = window.innerWidth < 768 ? 1 : window.innerWidth < 1000 ? 2 : 3; index.value = Math.min(index.value, end.value) }
async function move(direction) { index.value = Math.min(end.value, Math.max(0, index.value + direction)); await nextTick(); const card = track.value?.children[index.value]; if (card) track.value.scrollTo({ left: card.offsetLeft - track.value.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
function sync() { if (!track.value?.children.length) return; const width = track.value.children[0].getBoundingClientRect().width + 18; index.value = Math.min(end.value, Math.round(track.value.scrollLeft / width)) }
onMounted(() => { measure(); window.addEventListener('resize', measure) })
onBeforeUnmount(() => window.removeEventListener('resize', measure))
</script>
<template>
  <section class="jd-recommendations" aria-labelledby="jd-related-title">
    <h3 id="jd-related-title">You might also like</h3>
    <div class="jd-related-carousel"><button class="jd-related-arrow jd-related-prev" aria-label="Previous related journeys" :disabled="index === 0" @click="move(-1)"><JourneyIcon name="chevron-left" :size="21" /></button><div ref="track" class="jd-related-track" @scroll.passive="sync"><RouterLink v-for="item in items" :key="item.title" class="jd-related-card" :to="item.href || '/journeys'" draggable="false"><img :src="item.image.src" :alt="item.image.alt" loading="lazy" :style="{ objectPosition: item.image.position || 'center' }" width="600" height="300" /><div><h4>{{ item.title }}</h4><p>{{ item.text }}</p></div></RouterLink></div><button class="jd-related-arrow jd-related-next" aria-label="Next related journeys" :disabled="index >= end" @click="move(1)"><JourneyIcon name="chevron-right" :size="21" /></button></div>
  </section>
</template>
