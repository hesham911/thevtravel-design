<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import AppIcon from './AppIcon.vue'
import TransferRequestFlow from './transfer/TransferRequestFlow.vue'
import { useTransferRequest } from '~/composables/useTransferRequest'
import { useOverlayState } from '~/composables/useRequestOverlay'
const route = useRoute()
const transferRequested = useTransferRequest()
const activeRequests = useOverlayState()
const requestOverlayOpen = computed(() => activeRequests.value > 0)
const transfer = ref(null)
watch(transferRequested, () => transfer.value?.open())
const whatsappUrl = useRuntimeConfig().public.whatsappUrl
</script>
<template>
  <div v-if="!requestOverlayOpen && !route.meta.legalKey" class="global-floating-actions" :class="{ 'above-journey-nav': route.name === 'journey-details' }">
    <button class="floating-transfer" type="button" :aria-label='$t("Request a transfer")' @click="transfer.open()"><span>{{ $t("Request a transfer") }}</span><AppIcon name="car" :size="28" /></button>
    <a v-if="whatsappUrl" class="floating-whatsapp" :href="whatsappUrl" target="_blank" rel="noopener noreferrer" :aria-label='$t("Chat on WhatsApp")'><AppIcon name="whatsapp" :size="30" /></a>
    <button v-else class="floating-whatsapp" type="button" disabled :aria-label='$t("WhatsApp contact is not configured")' :title='$t("WhatsApp contact is not configured")'><AppIcon name="whatsapp" :size="30" /></button>
  </div>
  <TransferRequestFlow ref="transfer" />
</template>
<style scoped>
.global-floating-actions { position:fixed; right:20px; bottom:calc(20px + env(safe-area-inset-bottom)); z-index:30; display:flex; flex-direction:column; align-items:flex-end; gap:12px; }
.global-floating-actions button,.global-floating-actions a { display:flex; align-items:center; justify-content:center; width:54px; height:54px; border:0; border-radius:50%; color:white; padding:0; text-decoration:none; cursor:pointer; }
.global-floating-actions .floating-transfer { background:rgb(254 84 1 / .4); gap:12px; border-radius:27px; }
.global-floating-actions .floating-whatsapp { background:rgb(37 211 102 / .4); }
.floating-transfer svg { flex-shrink:0; }.floating-transfer span { display:none; font-size:13px; white-space:nowrap; }
.global-floating-actions button:disabled { cursor:not-allowed; }
.global-floating-actions :focus-visible { outline:3px solid #011947; outline-offset:3px; }
@media (hover:hover) and (min-width:768px) { .floating-transfer { transition:width .2s ease; }.global-floating-actions .floating-transfer:hover { width:208px; }.floating-transfer:hover span { display:block; } }
@media(max-width:767px) { .global-floating-actions.above-journey-nav { bottom:calc(164px + env(safe-area-inset-bottom)); } }
@media(prefers-reduced-motion:reduce) { .floating-transfer { transition:none; } }
</style>
