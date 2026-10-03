<script setup>
import { formatUSD } from '~/utils/currency'
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import JourneyIcon from './JourneyIcon.vue'
const props = defineProps({ active: String, journey: Object, bookingOpen: Boolean })
const emit = defineEmits(['select', 'request'])
const open = ref(false)
const controls = ref(null)
const moreButton = ref(null)
const moreActive = computed(() => ['included', 'good-to-know'].includes(props.active))
const items = [['overview', 'Overview', 'home'], ['itinerary', 'Itinerary', 'calendar'], ['gallery', 'Gallery', 'image'], ['reviews', 'Reviews', 'outline-star']]
function select(id) { open.value = false; emit('select', id) }
async function toggle() { open.value = !open.value; if (open.value) { await nextTick(); controls.value?.querySelector('.jd-more-option')?.focus() } }
function dismiss(e) { if (!controls.value?.contains(e.target)) open.value = false }
function escape(e) { if (e.key === 'Escape' && open.value) { open.value = false; moreButton.value?.focus() } }
onMounted(() => { document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', escape) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) })
</script>
<template>
  <div ref="controls" class="jd-mobile-controls">
    <div v-if="open && !bookingOpen" id="journey-more" class="jd-more-menu" :aria-label='$t("More journey sections")'><div><strong>{{ $t("More") }}</strong><button :aria-label='$t("Close more menu")' @click="open = false; moreButton?.focus()"><JourneyIcon name="close" :size="20" /></button></div><button v-for="[id, title, icon] in [['included', 'Included', 'shield'], ['good-to-know', 'Good to know', 'clock']]" :key="id" class="jd-more-option" :class="{ active: active === id }" :aria-current="active === id ? 'true' : undefined" @click="select(id)"><JourneyIcon :name="icon" :size="20" />{{ $t(title) }}</button></div>
    <div v-if="!bookingOpen" class="jd-booking-bar"><p v-if="formatUSD(journey.price)">{{ $t("From") }} <strong>{{ formatUSD(journey.price) }}</strong><span>{{ $t("per person") }}</span></p><p v-else>{{ $t("Price on request") }}</p><button class="jd-button jd-primary" @click="open = false; $emit('request')">{{ $t("Request") }}</button></div>
    <nav class="jd-bottom-nav" :aria-label='$t("Journey sections")'><button v-for="[id, title, icon] in items" :key="id" :class="{ active: active === id }" :aria-current="active === id ? 'true' : undefined" @click="select(id)"><JourneyIcon :name="icon" :size="24" /><span>{{ $t(title) }}</span></button><button ref="moreButton" :class="{ active: moreActive }" :aria-expanded="open" aria-controls="journey-more" @click="toggle"><JourneyIcon name="more" :size="24" /><span>{{ $t("More") }}</span></button></nav>
  </div>
</template>
