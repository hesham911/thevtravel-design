<script setup>
import { computed } from 'vue'
import { useAsyncData, useRuntimeConfig } from '#imports'
import SiteHeader from './SiteHeader.vue'
import SiteFooter from './SiteFooter.vue'
import { useI18n } from '~/utils/i18n'
import { fetchPageSections, textOr } from '~/services/pageContent'
import { localizedLegalHTML, sanitizeLegalHTML } from '~/services/legalContent'

// A legal page: its heading, an optional introduction, the body itself and
// the date it was last updated — all managed in the admin under Website
// Content → {page}, and all served for the requested language.
//
// The body is empty until approved copy is pasted into the editor. No
// privacy policy or terms have been supplied for TheVTravel, and none is
// invented here or in the fixtures: the page says so instead.
const props = defineProps({
  pageKey: { type: String, required: true },
  fallback: { type: Object, required: true },
})

const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()

const { data: sections } = await useAsyncData(
  () => `legal-${props.pageKey}`,
  () => fetchPageSections(runtime.apiBaseUrl, props.pageKey, locale.value),
  { watch: [locale], default: () => null },
)

const section = computed(() => sections.value?.content ?? null)

const title = computed(() => textOr(section.value?.title, translate(props.fallback.title)))
const intro = computed(() => textOr(section.value?.data?.intro, props.fallback.intro ? translate(props.fallback.intro) : ''))

// The CMS serves the body already resolved to the requested language; the
// fixture keeps its per-language shape. Both are sanitized the same way:
// rich-editor data is content, never executable markup.
// `body` is one of the keys the API lifts out of `data` (see
// PageSectionResource), alongside the title.
const html = computed(() => sanitizeLegalHTML(
  textOr(section.value?.body, localizedLegalHTML(props.fallback, locale.value)),
  translate('Table'),
))

const updatedAt = computed(() => section.value?.data?.updated_at || props.fallback.updatedAt || '')

const updated = computed(() => {
  if (!updatedAt.value) return ''
  const date = new Date(updatedAt.value)
  return Number.isNaN(date.valueOf()) ? '' : new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(date)
})
</script>
<template>
  <div class="legal-page">
    <SiteHeader />
    <main class="legal-main">
      <header class="legal-heading">
        <nav :aria-label="$t('Breadcrumb')"><NuxtLink to="/">{{ $t('Home') }}</NuxtLink><span aria-hidden="true">/</span><span>{{ title }}</span></nav>
        <h1>{{ title }}</h1>
        <p v-if="intro" class="legal-intro">{{ intro }}</p>
        <p v-if="updated" class="legal-updated">{{ $t('Last updated') }}: <time :datetime="updatedAt">{{ updated }}</time></p>
      </header>
      <article v-if="html.trim()" class="legal-rich-text" :aria-label="title" v-html="html"></article>
      <p v-else class="legal-empty" role="status">{{ $t('Content is being prepared.') }}</p>
    </main>
    <SiteFooter variant="booking" />
  </div>
</template>
