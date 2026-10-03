<script setup>
definePageMeta({"name": "privacy-policy", "title": "Privacy Policy", "legalKey": "privacy"})
import { computed } from 'vue'
import { useRoute } from '#imports'
import LegalContentPage from '~/components/LegalContentPage.vue'
import { legalPages } from '~/data/legalPages'
const route = useRoute()
const content = computed(() => legalPages[route.meta.legalKey])
</script>
<template><LegalContentPage :content="content" /></template>
