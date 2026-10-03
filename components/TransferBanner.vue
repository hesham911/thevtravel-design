<script setup>
import { transferContent } from '~/data/homeContent'
import { useTransferRequest } from '~/composables/useTransferRequest'
const transferRequested = useTransferRequest()
function requestTransfer() { transferRequested.value++ }
</script>
<template>
  <section id="transfers" class="transfer-banner" aria-labelledby="transfer-title">
    <div class="transfer-copy">
      <p class="eyebrow">{{ $t("Private transfers") }}</p>
      <h2 id="transfer-title">{{ $t(transferContent.title) }}</h2>
      <p>{{ $t(transferContent.description) }}</p>
      <button class="button button-primary" type="button" @click="requestTransfer">{{ $t(transferContent.cta) }}</button>
    </div>
    <div class="transfer-media">
      <img :src="transferContent.image" :alt='$t(transferContent.alt)' width="602" height="345" loading="lazy" />
    </div>
  </section>
</template>
