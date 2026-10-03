<script setup>
import AppIcon from '../AppIcon.vue'
defineProps({ name: String, size: { type: Number, default: 24 } })
</script>
<template><AppIcon :name="name" :size="size" /></template>
