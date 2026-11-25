<script setup>
import AppIcon from '../AppIcon.vue'
import ContentIcon from '../ContentIcon.vue'
defineProps({
  name: { type: String, default: 'help-circle' },
  size: { type: Number, default: 24 },
  imageUrl: { type: String, default: '' },
  imageDarkUrl: { type: String, default: '' },
})
</script>
<template>
  <ContentIcon v-if="imageUrl" :image-url="imageUrl" :image-dark-url="imageDarkUrl" :size="size" />
  <AppIcon v-else :name="name || 'help-circle'" :size="size" />
</template>
