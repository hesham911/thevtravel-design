<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useTheme } from '../theme'

const open = ref(false)
const route = useRoute()
const { isDark, toggleTheme } = useTheme()

function isActive(name) {
  return route.name === name || (name === 'journeys' && route.name === 'journey-details')
}
</script>

<template>
  <header class="site-header">
    <a class="brand-link" href="/" aria-label="TheVTravel home">
      <img class="logo-light" src="/assets/brand/logo-transparent.png" alt="TheVTravel" width="174" height="58" />
      <img class="logo-dark" src="/assets/brand/logo-transparent-dark.png" alt="TheVTravel" width="174" height="58" />
    </a>
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="/journeys" :class="{ active: isActive('journeys') }" :aria-current="isActive('journeys') ? 'page' : undefined">Journeys <AppIcon name="chevron-down" :size="13" /></a>
      <a href="/#transfers">Private Transfers</a>
      <a href="/how-booking-works" :class="{ active: isActive('how-booking-works') }" :aria-current="isActive('how-booking-works') ? 'page' : undefined">How booking works</a>
      <a href="/faq" :class="{ active: isActive('faq') }" :aria-current="isActive('faq') ? 'page' : undefined">FAQ</a>
      <a href="/about" :class="{ active: isActive('about') }" :aria-current="isActive('about') ? 'page' : undefined">About us</a>
      <a href="/contact" :class="{ active: isActive('contact') }" :aria-current="isActive('contact') ? 'page' : undefined">Contact us</a>
    </nav>
    <div class="header-actions">
      <button
        class="theme-toggle"
        type="button"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <AppIcon :name="isDark ? 'sun' : 'moon'" :size="19" />
      </button>
      <button class="header-language" type="button" aria-label="Select language">
        <AppIcon name="globe" :size="19" /> English <AppIcon name="chevron-down" :size="13" />
      </button>
      <a class="button button-primary header-cta" href="/journeys">Explore journeys</a>
      <button class="menu-button" type="button" :aria-expanded="open" aria-controls="mobile-navigation" aria-label="Toggle navigation" @click="open = !open">
        <AppIcon :name="open ? 'close' : 'menu'" :size="24" />
      </button>
    </div>
    <nav v-if="open" id="mobile-navigation" class="mobile-nav" aria-label="Mobile navigation">
      <a href="/journeys" :class="{ active: isActive('journeys') }" :aria-current="isActive('journeys') ? 'page' : undefined" @click="open = false">Journeys</a>
      <a href="/#transfers" @click="open = false">Private Transfers</a>
      <a href="/how-booking-works" :class="{ active: isActive('how-booking-works') }" :aria-current="isActive('how-booking-works') ? 'page' : undefined" @click="open = false">How booking works</a>
      <a href="/faq" :class="{ active: isActive('faq') }" :aria-current="isActive('faq') ? 'page' : undefined" @click="open = false">FAQ</a>
      <a href="/about" :class="{ active: isActive('about') }" :aria-current="isActive('about') ? 'page' : undefined" @click="open = false">About us</a>
      <a href="/contact" :class="{ active: isActive('contact') }" :aria-current="isActive('contact') ? 'page' : undefined" @click="open = false">Contact us</a>
      <a class="button button-primary" href="/journeys" @click="open = false">Explore journeys</a>
    </nav>
  </header>
</template>
