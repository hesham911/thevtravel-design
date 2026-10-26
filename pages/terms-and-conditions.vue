<script setup>
import { computed } from 'vue'
import { useRoute } from '#imports'
import LegalContentPage from '~/components/LegalContentPage.vue'
import { legalPages } from '~/data/legalPages'
definePageMeta({ name: 'terms-and-conditions', title: 'Terms & Conditions', legalKey: 'terms', pageKey: 'terms-and-conditions' })
const route = useRoute()
const fallback = computed(() => legalPages[route.meta.legalKey])
</script>
<template><LegalContentPage page-key="terms-and-conditions" :fallback="fallback" /></template>
