<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useI18n } from '~/utils/i18n'
import { useSiteContent } from '~/composables/useSiteContent'
import { textOr } from '~/services/pageContent'

// The words come from whichever page draws this panel; the WhatsApp address
// comes from Settings → Social, and the button stays disabled while it is
// unset rather than pointing nowhere.
const props = defineProps({
  floating: { type: Boolean, default: false },
  section: { type: Object, default: null },
})

const { translate } = useI18n()
const { whatsappUrl } = useSiteContent()

const help = computed(() => ({
  title: textOr(props.section?.title, translate('Need help?')),
  body: textOr(props.section?.body, translate('Our travel experts are here for you.')),
  cta: textOr(props.section?.data?.cta_text, translate('Chat on WhatsApp')),
}))
</script>

<template>
  <section class="booking-help" aria-labelledby="need-help-title">
    <div class="booking-help-inner page-container">
      <div class="booking-help-copy">
        <h2 id="need-help-title">{{ help.title }}</h2>
        <p>{{ help.body }}</p>
        <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">
          <AppIcon name="whatsapp" :size="22" />
          {{ help.cta }}
        </a>
        <button v-else type="button" disabled :title='$t("WhatsApp contact is not configured")'>
          <AppIcon name="whatsapp" :size="22" />
          {{ help.cta }}
        </button>
      </div>
      <div class="booking-help-art" aria-hidden="true"></div>
    </div>
  </section>
</template>
