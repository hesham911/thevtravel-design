<script setup>
import { contentImage } from '~/utils/contentImages'
import { computed } from 'vue'
import { useTransferRequest } from '~/composables/useTransferRequest'
import { useI18n } from '~/utils/i18n'
import { textOr } from '~/services/pageContent'
import { transferContent } from '~/data/homeContent'

// The banner's words, photo and button label are managed in the admin under
// Website Content → Home Page → Transfer Banner. What the button does —
// opening the transfer request panel — is this component's, and is not
// configured there.
const props = defineProps({ section: { type: Object, default: null } })

const { translate, locale } = useI18n()
const transferRequested = useTransferRequest()
function requestTransfer() { transferRequested.value++ }

const banner = computed(() => ({
  eyebrow: textOr(props.section?.subtitle, translate('Private transfers')),
  title: textOr(props.section?.title, translate(transferContent.title)),
  description: textOr(props.section?.body, translate(transferContent.description)),
  cta: textOr(props.section?.data?.cta_text, translate(transferContent.cta)),
  image: contentImage(props.section?.media?.image, 'transfer-banner', locale.value),
  alt: contentImage(props.section?.media?.image, 'transfer-banner', locale.value).alt || textOr(props.section?.data?.image_alt, translate(transferContent.alt)),
}))
</script>
<template>
  <section id="transfers" class="transfer-banner" aria-labelledby="transfer-title">
    <div class="transfer-copy">
      <p class="eyebrow">{{ banner.eyebrow }}</p>
      <h2 id="transfer-title">{{ banner.title }}</h2>
      <p>{{ banner.description }}</p>
      <button class="button button-primary" type="button" @click="requestTransfer">{{ banner.cta }}</button>
    </div>
    <div class="transfer-media">
      <img :src="banner.image.url" :srcset="banner.image.srcset" sizes="(max-width: 767px) 100vw, 60vw" :alt="banner.alt" :width="banner.image.width || 1672" :height="banner.image.height || 941" loading="lazy" />
    </div>
  </section>
</template>
