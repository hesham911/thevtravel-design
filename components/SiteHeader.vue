<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from '#imports'
import AppIcon from './AppIcon.vue'
import LanguageSelector from './LanguageSelector.vue'
import { useTransferRequest } from '~/composables/useTransferRequest'
import { useTheme } from '~/composables/useTheme'

const transferRequested = useTransferRequest()
function requestTransfer() { transferRequested.value++ }
const header = ref(null)
let resizeObserver
onMounted(() => {
  resizeObserver = new ResizeObserver(() => document.documentElement.style.setProperty('--site-header-height', `${header.value.getBoundingClientRect().height}px`))
  resizeObserver.observe(header.value)
})
onBeforeUnmount(() => resizeObserver?.disconnect())
const open = ref(false)
const menuButton = ref(null)
function closeMenu() { open.value = false; menuButton.value?.focus() }
const route = useRoute()
const { isDark, toggleTheme } = useTheme()

function isActive(name) {
  return route.name === name || (name === 'journeys' && route.name === 'journey-details')
}
</script>

<template>
  <header ref="header" class="site-header">
    <NuxtLink class="brand-link" to="/" :aria-label='$t("TheVTravel home")'>
      <img class="logo-light" src="/assets/brand/logo-transparent.png" :alt='$t("TheVTravel")' width="174" height="58" />
      <img class="logo-dark" src="/assets/brand/logo-transparent-dark.png" :alt='$t("TheVTravel")' width="174" height="58" />
    </NuxtLink>
    <nav class="desktop-nav" :aria-label='$t("Main navigation")'>
      <NuxtLink to="/journeys" :class="{ active: isActive('journeys') }" :aria-current="isActive('journeys') ? 'page' : undefined">{{ $t("Journeys") }}</NuxtLink>
      <button class="nav-transfer" type="button" @click="requestTransfer">{{ $t("Private Transfers") }}</button>
      <NuxtLink to="/how-booking-works" :class="{ active: isActive('how-booking-works') }" :aria-current="isActive('how-booking-works') ? 'page' : undefined">{{ $t("How booking works") }}</NuxtLink>
      <NuxtLink to="/faq" :class="{ active: isActive('faq') }" :aria-current="isActive('faq') ? 'page' : undefined">{{ $t("FAQ") }}</NuxtLink>
      <NuxtLink to="/about" :class="{ active: isActive('about') }" :aria-current="isActive('about') ? 'page' : undefined">{{ $t("About us") }}</NuxtLink>
      <NuxtLink to="/contact" :class="{ active: isActive('contact') }" :aria-current="isActive('contact') ? 'page' : undefined">{{ $t("Contact us") }}</NuxtLink>
    </nav>
    <div class="header-actions">
      <button
        class="theme-toggle"
        type="button"
        :aria-label="$t(isDark ? 'Switch to light mode' : 'Switch to dark mode')"
        :title="$t(isDark ? 'Switch to light mode' : 'Switch to dark mode')"
        @click="toggleTheme"
      >
        <AppIcon :name="isDark ? 'sun' : 'moon'" :size="19" />
      </button>
      <LanguageSelector />
      <NuxtLink class="button button-primary header-cta" to="/journeys">{{ $t("Explore journeys") }}</NuxtLink>
      <button ref="menuButton" class="menu-button" type="button" :aria-expanded="open" aria-controls="mobile-navigation" :aria-label='$t("Toggle navigation")' @click="open = !open">
        <AppIcon :name="open ? 'close' : 'menu'" :size="24" />
      </button>
    </div>
    <nav @keydown.esc="closeMenu" v-if="open" id="mobile-navigation" class="mobile-nav" :aria-label='$t("Mobile navigation")'>
      <NuxtLink to="/journeys" :class="{ active: isActive('journeys') }" :aria-current="isActive('journeys') ? 'page' : undefined" @click="open = false">{{ $t("Journeys") }}</NuxtLink>
      <button class="nav-transfer" type="button" @click="open = false; requestTransfer()">{{ $t("Private Transfers") }}</button>
      <NuxtLink to="/how-booking-works" :class="{ active: isActive('how-booking-works') }" :aria-current="isActive('how-booking-works') ? 'page' : undefined" @click="open = false">{{ $t("How booking works") }}</NuxtLink>
      <NuxtLink to="/faq" :class="{ active: isActive('faq') }" :aria-current="isActive('faq') ? 'page' : undefined" @click="open = false">{{ $t("FAQ") }}</NuxtLink>
      <NuxtLink to="/about" :class="{ active: isActive('about') }" :aria-current="isActive('about') ? 'page' : undefined" @click="open = false">{{ $t("About us") }}</NuxtLink>
      <NuxtLink to="/contact" :class="{ active: isActive('contact') }" :aria-current="isActive('contact') ? 'page' : undefined" @click="open = false">{{ $t("Contact us") }}</NuxtLink>
      <NuxtLink class="button button-primary" to="/journeys" @click="open = false">{{ $t("Explore journeys") }}</NuxtLink>
      <button class="mobile-theme-control" type="button" @click="toggleTheme"><AppIcon :name="isDark ? 'sun' : 'moon'" :size="20" />{{ $t(isDark ? 'Switch to light mode' : 'Switch to dark mode') }}</button>
    </nav>
  </header>
</template>
