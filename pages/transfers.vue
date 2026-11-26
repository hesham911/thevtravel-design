<script setup>
import { computed, ref } from 'vue'
import { useAsyncData, useRuntimeConfig } from '#imports'
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import JourneyGalleryViewer from '~/components/journey/JourneyGalleryViewer.vue'
import { useI18n } from '~/utils/i18n'
import { contentImage, heroImageStyle, heroImagePreloads } from '~/utils/contentImages'
import { fetchPageSections, textOr } from '~/services/pageContent'
import { useTransferRequest } from '~/composables/useTransferRequest'

definePageMeta({ name: 'transfers', pageKey: 'transfers', title: 'Private Transfers — TheVTravel' })
const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()
const transferRequested = useTransferRequest()
const viewer = ref(null)
const failedImage = ref('')
const { data: sections } = await useAsyncData(
  () => `transfers-sections:${locale.value}`,
  () => fetchPageSections(runtime.apiBaseUrl, 'transfers', locale.value),
  { default: () => null },
)
const hero = computed(() => ({
  title: textOr(sections.value?.hero?.title, translate('Private Transfers')),
  body: textOr(sections.value?.hero?.body, translate('Airport transfers, city to city or private car with driver.')),
  cta: textOr(sections.value?.hero?.data?.cta_text, translate('Book Your Transfer')),
}))
const heroPhoto = computed(() => contentImage(null, 'faq-hero', locale.value))
useHead(() => ({ link: heroImagePreloads(heroPhoto.value) }))
const prices = computed(() => ({
  title: textOr(sections.value?.prices?.title, translate('Transfer Prices')),
  alt: textOr(sections.value?.prices?.data?.image_alt, translate('Transfer Prices')),
  url: sections.value?.prices?.media?.image?.url || '',
}))
const cta = computed(() => ({
  title: textOr(sections.value?.cta?.title, translate('Ready to book your transfer?')),
  body: textOr(sections.value?.cta?.body, translate('Share your pickup, destination and travel date. Our team will confirm the details with you.')),
  label: textOr(sections.value?.cta?.data?.cta_text, translate('Book Your Transfer')),
}))
function requestTransfer() { transferRequested.value++ }
function viewPrices() {
  viewer.value?.open([{ src: prices.value.url, alt: prices.value.alt, caption: prices.value.title, source: prices.value.title }])
}
</script>

<template>
  <div class="faq-page transfers-page">
    <SiteHeader />
    <main>
      <section class="faq-hero" aria-labelledby="transfers-title">
        <div class="faq-hero-photo" role="img" :aria-label="heroPhoto.alt" :style="heroImageStyle(heroPhoto)"></div>
        <div class="faq-hero-copy page-container">
          <nav class="faq-breadcrumb" :aria-label="$t('Breadcrumb')">
            <PublicLink to="/">{{ $t('Home') }}</PublicLink>
            <AppIcon name="chevron-right" :size="13" />
            <span aria-current="page">{{ $t('Private Transfers') }}</span>
          </nav>
          <h1 id="transfers-title">{{ hero.title }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>{{ hero.body }}</p>
          <div class="transfers-hero-action"><button class="button button-primary" type="button" @click="requestTransfer">{{ hero.cta }}</button></div>
        </div>
      </section>
      <div class="faq-main page-container">
        <section v-if="prices.url && prices.url !== failedImage" class="transfer-prices" aria-labelledby="transfer-prices-title">
          <div class="contact-section-heading">
            <h2 id="transfer-prices-title">{{ prices.title }}</h2>
            <span class="heading-rule" aria-hidden="true"></span>
          </div>
          <button class="transfer-price-image" type="button" :aria-label="$t('View full-size price list')" @click="viewPrices">
            <img :src="prices.url" :alt="prices.alt" loading="lazy" @error="failedImage = prices.url" />
          </button>
          <div class="transfer-price-actions">
            <button class="button button-secondary" type="button" @click="viewPrices">{{ $t('View full-size price list') }}</button>
            <a class="button button-secondary" :href="prices.url" target="_blank" rel="noopener noreferrer">{{ $t('Open original image') }}</a>
          </div>
        </section>
        <section class="faq-help" aria-labelledby="transfer-booking-title">
          <div class="faq-help-symbol" aria-hidden="true"><AppIcon name="car" :size="32" /></div>
          <div class="faq-help-copy">
            <h2 id="transfer-booking-title">{{ cta.title }}</h2>
            <p>{{ cta.body }}</p>
          </div>
          <div class="support-actions"><button class="button button-primary" type="button" @click="requestTransfer">{{ cta.label }}</button></div>
        </section>
      </div>
    </main>
    <SiteFooter variant="faq" />
    <JourneyGalleryViewer ref="viewer" :label="$t('Transfer Prices')" />
  </div>
</template>

<style scoped>
.transfers-hero-action { margin-top: 24px; }
.transfer-prices { padding-block: 24px; }
.transfer-price-image { display: block; width: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in; }
.transfer-price-image img { display: block; width: 100%; height: auto; }
.transfer-price-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 24px; }
</style>
