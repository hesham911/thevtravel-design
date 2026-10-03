<script setup>
import { computed } from 'vue'
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
const props = defineProps({ name: { type: String, required: true }, size: { type: Number, default: 20 } })
const brands = { facebook: faFacebookF, instagram: faInstagram, whatsapp: faWhatsapp }
const icon = computed(() => brands[props.name]?.icon)
</script>
<template>
  <svg v-if="icon" :width="size" :height="size" :viewBox="`0 0 ${icon[0]} ${icon[1]}`" fill="currentColor" aria-hidden="true" focusable="false"><path v-for="(path, index) in (Array.isArray(icon[4]) ? icon[4] : [icon[4]])" :key="index" :d="path" /></svg>
</template>
