<script setup>
import JourneyCard from './JourneyCard.vue'
defineProps({ journey: { type: Object, required: true }, layout: { type: String, default: 'grid' } })
</script>
<template><JourneyCard :journey="journey" :layout="layout" /></template>
