<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from '#imports'
import AppIcon from './AppIcon.vue'
import LanguageSelector from './LanguageSelector.vue'
import { useTransferRequest } from '~/composables/useTransferRequest'
import { useTheme } from '~/composables/useTheme'
import { TRANSFER_TARGET, useSiteContent } from '~/composables/useSiteContent'

// The logos, the logo's description, the button label and the navigation's
// own labels and targets are managed in the admin under Website Content →
// Header & Footer (the logo files themselves under Settings → General). The
// rows are labels and destinations, not a menu builder: the routes are this
// application's own and a row points at one of them.
//
// The same rows draw the desktop bar and the mobile menu, so the two can
// never disagree, and the layout of both is unchanged — one <NuxtLink> per
// row, in order, with the transfer row still the one <button>.
const { header: chrome, nav } = useSiteContent()

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

// A row's target decides whether it is the page being read, so the highlight
// follows whatever routes the admin pointed the rows at. A section's own
// pages count as that section — /journeys/luxor highlights "Journeys", which
// is what the route-name check it replaces did for the journey detail page.
function isActive(link) {
  if (!link || link.startsWith('#')) {
    return false
  }

  const path = link.split(/[?#]/)[0].replace(/\/+$/, '')

  if (path === '') {
    return route.path === '/'
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}

/** The one row that opens the transfer panel rather than navigating. */
function opensTransfer(link) {
  return link === TRANSFER_TARGET
}
</script>

<template>
  <header ref="header" class="site-header">
    <NuxtLink class="brand-link" to="/" :aria-label='$t("TheVTravel home")'>
      <img class="logo-light" :src="chrome.logoLight || '/assets/brand/logo-transparent.png'" :alt="chrome.logoAlt" width="174" height="58" fetchpriority="low" />
      <img class="logo-dark" :src="chrome.logoDark || '/assets/brand/logo-transparent-dark.png'" :alt="chrome.logoAlt" width="174" height="58" fetchpriority="low" />
    </NuxtLink>
    <nav class="desktop-nav" :aria-label='$t("Main navigation")'>
      <template v-for="item in nav" :key="item.key">
        <button v-if="opensTransfer(item.link)" class="nav-transfer" type="button" @click="requestTransfer">{{ item.title }}</button>
        <NuxtLink v-else :to="item.link" :class="{ active: isActive(item.link) }" :aria-current="isActive(item.link) ? 'page' : undefined">{{ item.title }}</NuxtLink>
      </template>
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
      <NuxtLink class="button button-primary header-cta" to="/journeys">{{ chrome.ctaText }}</NuxtLink>
      <button ref="menuButton" class="menu-button" type="button" :aria-expanded="open" aria-controls="mobile-navigation" :aria-label='$t("Toggle navigation")' @click="open = !open">
        <AppIcon :name="open ? 'close' : 'menu'" :size="24" />
      </button>
    </div>
    <nav @keydown.esc="closeMenu" v-if="open" id="mobile-navigation" class="mobile-nav" :aria-label='$t("Mobile navigation")'>
      <template v-for="item in nav" :key="item.key">
        <button v-if="opensTransfer(item.link)" class="nav-transfer" type="button" @click="open = false; requestTransfer()">{{ item.title }}</button>
        <NuxtLink v-else :to="item.link" :class="{ active: isActive(item.link) }" :aria-current="isActive(item.link) ? 'page' : undefined" @click="open = false">{{ item.title }}</NuxtLink>
      </template>
      <NuxtLink class="button button-primary" to="/journeys" @click="open = false">{{ chrome.ctaText }}</NuxtLink>
      <button class="mobile-theme-control" type="button" @click="toggleTheme"><AppIcon :name="isDark ? 'sun' : 'moon'" :size="20" />{{ $t(isDark ? 'Switch to light mode' : 'Switch to dark mode') }}</button>
    </nav>
  </header>
</template>
