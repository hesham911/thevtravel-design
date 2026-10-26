<script setup>
import { computed } from 'vue'
import { useRoute } from '#imports'
import LegalContentPage from '~/components/LegalContentPage.vue'
import { legalPages } from '~/data/legalPages'
definePageMeta({ name: 'privacy-policy', title: 'Privacy Policy', legalKey: 'privacy', pageKey: 'privacy-policy' })
const route = useRoute()
const fallback = computed(() => legalPages[route.meta.legalKey])
</script>
<template><LegalContentPage page-key="privacy-policy" :fallback="fallback" /></template>
