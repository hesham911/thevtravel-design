<script setup>
import { computed } from 'vue'
import { useI18n } from '~/utils/i18n'
import { contentImage } from '~/utils/contentImages'
const { locale } = useI18n()
const photo = computed(() => contentImage(null, 'closing-cta', locale.value))
</script>
<template>
  <section id="request" class="journey-cta" aria-labelledby="request-title">
    <div class="journey-cta-copy">
      <h2 id="request-title">{{ $t("Ready to plan your") }}<br />{{ $t("Egypt journey?") }}</h2>
      <p>{{ $t("Send your request and we’ll take care of the rest.") }}</p>
      <a class="button button-primary" href="#request">{{ $t("Send your request") }}</a>
    </div>
    <div class="journey-cta-media">
      <img :src="photo.url" :srcset="photo.srcset" sizes="(max-width: 767px) 100vw, 55vw" :alt="photo.alt" :width="photo.width" :height="photo.height" loading="lazy" />
    </div>
  </section>
</template>
