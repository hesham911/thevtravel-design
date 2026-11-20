<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useI18n } from '~/utils/i18n'
import { useSiteContent } from '~/composables/useSiteContent'
import { textOr } from '~/services/pageContent'

// The words come from whichever page draws this panel; the WhatsApp address
// comes from Settings → Social. Contact remains available when WhatsApp
// has not been configured.
const props = defineProps({
  floating: { type: Boolean, default: false },
  section: { type: Object, default: null },
})

const { translate } = useI18n()
const { whatsappUrl, buttons } = useSiteContent()

// The panel's own words belong to the page that draws it; the button's are
// the site-wide WhatsApp label (Website Content → Header & Footer →
// Buttons), so the same words appear on every WhatsApp button. A page that
// sets its own button text on the section still wins — a closing panel may
// legitimately want a different call than the floating button does.
const help = computed(() => ({
  title: textOr(props.section?.title, translate('Need help?')),
  body: textOr(props.section?.body, translate('Our travel experts are here for you.')),
  cta: textOr(props.section?.data?.cta_text, buttons.value.whatsapp),
}))
</script>

<template>
  <section class="booking-help" aria-labelledby="need-help-title">
    <div class="booking-help-inner page-container">
      <AppIcon class="support-mark" name="headset" :size="32" />
      <div class="booking-help-copy">
        <h2 id="need-help-title">{{ help.title }}</h2>
        <p>{{ help.body }}</p>
      </div>
      <div class="support-actions">
        <a v-if="whatsappUrl" class="support-whatsapp" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">
          <AppIcon name="whatsapp" :size="20" />{{ help.cta }}
        </a>
        <PublicLink :class="whatsappUrl ? 'support-contact' : 'button button-primary'" to="/contact">{{ $t('Contact us') }} <AppIcon name="arrow" :size="18" /></PublicLink>
      </div>
    </div>
  </section>
</template>
