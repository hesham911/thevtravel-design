<script setup>
import AppIcon from './AppIcon.vue'
import BrandIcon from './BrandIcon.vue'

const props = defineProps({ variant: { type: String, default: 'default' }, socialLinks: { type: Object, default: () => ({}) } })
const socials = [{ name: 'instagram', label: 'Instagram' }, { name: 'facebook', label: 'Facebook' }, { name: 'whatsapp', label: 'WhatsApp' }]
function socialHref(name) {
  try { const url = new URL(props.socialLinks[name]); return ['https:', 'http:'].includes(url.protocol) ? url.href : null } catch { return null }
}
const detailed = props.variant === 'faq' || props.variant === 'contact' || props.variant === 'booking'

const columns = [
  { title: 'Journeys', links: ['All journeys', 'Cairo', 'Luxor', 'Aswan', 'Sinai'] },
  { title: 'Private transfers', links: ['Airport transfers', 'City to city', 'Hourly service', 'Long distance'] },
  { title: 'Company', links: ['About us', 'Travel with purpose', 'How booking works', 'Contact us'] },
  { title: 'Help', links: ['FAQ', 'Terms & Conditions', 'Privacy policy', 'Change a booking'] },
]

const faqColumns = [
  { title: 'Journeys', links: ['All journeys', 'Cairo', 'Luxor', 'Aswan', 'Hurghada', 'More destinations'] },
  { title: 'Private transfers', links: ['Airport transfers', 'City to city', 'Hourly service', 'Long distance'] },
  { title: 'Company', links: ['About us', 'How booking works', 'FAQ', 'Contact us'] },
  { title: 'Help', links: ['Terms & Conditions', 'Privacy policy'] },
]

const bookingColumns = [
  { title: 'Journeys', links: ['All journeys', 'Cairo', 'Luxor', 'Aswan', 'Hurghada', 'More destinations'] },
  { title: 'Private transfers', links: ['Airport transfers', 'City to city', 'Hourly service', 'Long distance'] },
  { title: 'Company', links: ['About us', 'How booking works', 'Contact us'] },
  { title: 'Help', links: ['FAQ', 'Terms & Conditions', 'Privacy policy'] },
]

function footerHref(link) {
  const routes = {
    'All journeys': '/journeys', Cairo: '/journeys', Luxor: '/journeys', Aswan: '/journeys', Hurghada: '/journeys', 'More destinations': '/journeys',
    'Airport transfers': '/#transfers', 'City to city': '/#transfers', 'Hourly service': '/#transfers', 'Long distance': '/#transfers',
    'Terms & Conditions': '/terms-and-conditions', 'Privacy policy': '/privacy-policy', 'About us': '/about', 'How booking works': '/how-booking-works', FAQ: '/faq', 'Contact us': '/contact',
  }
  return routes[link] || null
}
</script>

<template>
  <footer class="site-footer" :class="{ 'site-footer--faq': detailed }">
    <div class="footer-main page-container">
      <div class="footer-brand">
        <NuxtLink class="footer-logo" to="/" :aria-label='$t("TheVTravel home")'>
          <img class="logo-light" src="/assets/brand/logo-transparent.png" :alt='$t("TheVTravel")' width="174" height="58" />
          <img class="logo-dark" src="/assets/brand/logo-transparent-dark.png" :alt='$t("TheVTravel")' width="174" height="58" />
        </NuxtLink>
        <template v-if="detailed">
          <p>{{ $t("Private journeys across Egypt,") }}<br />{{ $t("at your own pace.") }}</p>
          <div v-if="props.variant === 'faq' || props.variant === 'booking'" class="footer-socials" :aria-label='$t("Social links")'>
            <template v-for="social in socials" :key="social.name">
              <a v-if="socialHref(social.name)" :href="socialHref(social.name)" :aria-label="$t(social.label)" rel="noopener noreferrer"><BrandIcon :name="social.name" :size="20" /></a>
              <span v-else role="img" :aria-label="$t(social.label)"><BrandIcon :name="social.name" :size="20" /></span>
            </template>
            <a href="mailto:hello@thevtravel.com" :aria-label='$t("Email")'><AppIcon name="mail" :size="20" /></a>
          </div>
        </template>
      </div>
      <section v-for="column in (detailed ? (props.variant === 'booking' ? bookingColumns : faqColumns) : columns)" :key="column.title" class="footer-column">
        <h2>{{ $t(column.title) }}</h2>
        <template v-for="link in column.links" :key="link">
          <a v-if="footerHref(link)" :href="footerHref(link)">{{ $t(link) }}</a>
          <span v-else>{{ $t(link) }}</span>
        </template>
      </section>
    </div>
    <div class="footer-bar page-container">
      <small>© {{ $t(detailed ? '2024 ' : '') }}{{ $t("TheVTravel. All rights reserved.") }}</small>
      <span v-if="props.variant === 'contact'"><AppIcon name="send" :size="18" /> {{ $t("We reply by message, every day.") }}</span>
      <span v-else-if="props.variant !== 'booking'"><AppIcon name="shield" :size="18" /> {{ $t(props.variant === 'faq' ? 'No online payment. Need to confirm your booking.' : 'No online payment. No deposit.') }}</span>
    </div>
  </footer>
</template>
