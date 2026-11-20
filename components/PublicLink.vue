<script setup>
import { computed } from 'vue'
import { useI18n } from '~/utils/i18n'
import { localizeDestination } from '~/utils/localizedRoutes'
defineOptions({ inheritAttrs: false })
const props = defineProps({ to: { type: [String, Object], required: true } })
const { locale } = useI18n()
const origin = useRuntimeConfig().public.siteUrl || useRequestURL().origin
const destination = computed(() => localizeDestination(props.to, locale.value, origin))
</script>
<template>
  <NuxtLink v-bind="$attrs" :to="destination"><slot /></NuxtLink>
</template>
