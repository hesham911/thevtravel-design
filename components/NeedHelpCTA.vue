<script setup>
import AppIcon from './AppIcon.vue'

defineProps({ floating: { type: Boolean, default: false } })
</script>

<template>
  <section class="booking-help" aria-labelledby="need-help-title">
    <div class="booking-help-inner page-container">
      <div class="booking-help-copy">
        <h2 id="need-help-title">{{ $t("Need help?") }}</h2>
        <p>{{ $t("Our travel experts are here for you.") }}</p>
        <button type="button" disabled :title='$t("WhatsApp contact is not configured")'>
          <AppIcon name="whatsapp" :size="22" />
          {{ $t("Chat on WhatsApp") }}
        </button>
      </div>
      <div class="booking-help-art" aria-hidden="true"></div>
    </div>
  </section>
</template>
