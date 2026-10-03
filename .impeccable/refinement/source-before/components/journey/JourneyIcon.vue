<script setup>
import AppIcon from '../AppIcon.vue'
defineProps({ name: String, size: { type: Number, default: 24 } })
const paths = {
  check: 'm5 12 4 4 10-10',
  play: 'M7 3v18l15-9Z',
  home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
  image: 'M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M16 7h.01',
  'outline-star': 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  crown: 'm3 7 4 5 5-8 5 8 4-5-2 13H5ZM5 16h14',
  bottle: 'M10 2h4v4l3 4v11H7V10l3-4ZM10 3h4M7 13h10',
  walk: 'M13 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 12l3-3 4 3 4 1M11 9l-1 7-4 5M10 16l4 1 2 4',
  hat: 'M3 15c0-2 4-4 9-4s9 2 9 4-4 4-9 4-9-2-9-4ZM7 12l2-6h6l2 6',
  share: 'M8 12l9-6M8 12l9 6M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
}
</script>
<template>
  <svg v-if="paths[name]" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="name === 'more' ? 4 : 1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name]" :fill="name === 'play' ? 'currentColor' : 'none'" /></svg>
  <AppIcon v-else :name="name" :size="size" />
</template>
