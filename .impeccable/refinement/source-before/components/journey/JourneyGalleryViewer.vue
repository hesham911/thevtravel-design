<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import JourneyIcon from './JourneyIcon.vue'
const dialog = ref(null)
const photos = ref([])
const index = ref(0)
const current = computed(() => photos.value[index.value])
const touchStart = ref(null)
let previousOverflow = null
let previousFocus = null
function lock() { if (previousOverflow === null) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden' } }
function unlock() { if (previousOverflow !== null) { document.body.style.overflow = previousOverflow; previousOverflow = null } }
async function open(items, start = 0) { if (!items?.length) return; photos.value = items; index.value = Math.max(0, Math.min(items.length - 1, start)); previousFocus = document.activeElement; await nextTick(); lock(); dialog.value.showModal(); dialog.value.querySelector('.jd-gallery-close')?.focus() }
function close() { dialog.value?.close() }
function closed() { unlock(); previousFocus?.focus?.({ preventScroll: true }) }
function move(delta) { index.value = (index.value + delta + photos.value.length) % photos.value.length }
function keys(e) { if (e.key === 'ArrowRight') { e.preventDefault(); move(1) } if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) } }
function startSwipe(e) { touchStart.value = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } }
function endSwipe(e) { if (!touchStart.value) return; const dx = e.changedTouches[0].clientX - touchStart.value.x; const dy = e.changedTouches[0].clientY - touchStart.value.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1); touchStart.value = null }
watch(index, async () => { await nextTick(); const thumb = dialog.value?.querySelector('.jd-gallery-thumb.active'); thumb?.scrollIntoView({ block:'nearest', inline:'nearest', behavior:'instant' }) })
onBeforeUnmount(unlock)
defineExpose({ open })
</script>
<template>
  <dialog ref="dialog" class="jd-gallery-viewer" aria-label="Journey photo gallery" @close="closed" @keydown="keys">
    <template v-if="current"><header class="jd-gallery-top"><span>{{ current.source || 'TheVTravel · Journey gallery' }}</span><button class="jd-gallery-close" aria-label="Close photo viewer" @click="close"><JourneyIcon name="close" :size="26" /></button></header>
      <div class="jd-gallery-stage" @touchstart.passive="startSwipe" @touchend.passive="endSwipe"><button class="jd-gallery-prev" :disabled="photos.length < 2" aria-label="Previous photo" @click="move(-1)"><JourneyIcon name="chevron-left" :size="30" /></button><img :src="current.src" :alt="current.alt" draggable="false" /><button class="jd-gallery-next" :disabled="photos.length < 2" aria-label="Next photo" @click="move(1)"><JourneyIcon name="chevron-right" :size="30" /></button></div>
      <div class="jd-gallery-caption"><p>{{ current.alt }}</p><span aria-live="polite">{{ index + 1 }} / {{ photos.length }}</span></div>
      <nav class="jd-gallery-thumbnails" aria-label="Gallery thumbnails"><button v-for="(photo, i) in photos" :key="i" class="jd-gallery-thumb" :class="{ active: i === index }" :aria-label="`Show photo ${i + 1}: ${photo.alt}`" :aria-current="i === index ? 'true' : undefined" @click="index = i"><img :src="photo.src" :alt="photo.alt" loading="lazy" /></button></nav>
    </template>
  </dialog>
</template>
