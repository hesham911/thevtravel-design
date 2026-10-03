<script setup>
import { computed } from 'vue'
import SiteHeader from './SiteHeader.vue'
import SiteFooter from './SiteFooter.vue'
import { useI18n } from '~/utils/i18n'
const { locale, translate } = useI18n()
import { localizedLegalHTML, sanitizeLegalHTML } from '~/services/legalContent'
const props = defineProps({ content: { type: Object, required: true } })
const html = computed(() => sanitizeLegalHTML(localizedLegalHTML(props.content, locale.value), translate('Table')))
const updated = computed(() => {
  if (!props.content.updatedAt) return ''
  const date = new Date(props.content.updatedAt)
  return Number.isNaN(date.valueOf()) ? '' : new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(date)
})
</script>
<template>
  <div class="legal-page">
    <SiteHeader />
    <main class="legal-main">
      <header class="legal-heading">
        <nav :aria-label="$t('Breadcrumb')"><NuxtLink to="/">{{ $t('Home') }}</NuxtLink><span aria-hidden="true">/</span><span>{{ $t(content.title) }}</span></nav>
        <h1>{{ $t(content.title) }}</h1>
        <p v-if="content.intro" class="legal-intro">{{ $t(content.intro) }}</p>
        <p v-if="updated" class="legal-updated">{{ $t('Last updated') }}: <time :datetime="content.updatedAt">{{ updated }}</time></p>
      </header>
      <article v-if="html.trim()" class="legal-rich-text" :aria-label="$t(content.title)" v-html="html"></article>
      <p v-else class="legal-empty" role="status">{{ $t('Content is being prepared.') }}</p>
    </main>
    <SiteFooter variant="booking" />
  </div>
</template>
