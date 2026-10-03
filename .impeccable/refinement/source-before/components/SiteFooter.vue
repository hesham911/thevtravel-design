<script setup>
import AppIcon from './AppIcon.vue'

const props = defineProps({ variant: { type: String, default: 'default' } })
const detailed = props.variant === 'faq' || props.variant === 'contact' || props.variant === 'booking'

const columns = [
  { title: 'Journeys', links: ['All journeys', 'Cairo', 'Luxor', 'Aswan', 'Sinai'] },
  { title: 'Private transfers', links: ['Airport transfers', 'City to city', 'Hourly service', 'Long distance'] },
  { title: 'Company', links: ['About us', 'Travel with purpose', 'How booking works', 'Contact us'] },
  { title: 'Help', links: ['FAQ', 'Booking terms', 'Privacy policy', 'Change a booking'] },
]

const faqColumns = [
  { title: 'Journeys', links: ['All journeys', 'Cairo', 'Luxor', 'Aswan', 'Hurghada', 'More destinations'] },
  { title: 'Private transfers', links: ['Airport transfers', 'City to city', 'Hourly service', 'Long distance'] },
  { title: 'Company', links: ['About us', 'How booking works', 'FAQ', 'Contact us'] },
  { title: 'Help', links: ['Booking terms', 'Privacy policy'] },
]

const bookingColumns = [
  { title: 'Journeys', links: ['All journeys', 'Cairo', 'Luxor', 'Aswan', 'Hurghada', 'More destinations'] },
  { title: 'Private transfers', links: ['Airport transfers', 'City to city', 'Hourly service', 'Long distance'] },
  { title: 'Company', links: ['About us', 'How booking works', 'Contact us'] },
  { title: 'Help', links: ['FAQ', 'Booking terms', 'Privacy policy'] },
]

function footerHref(link) {
  const routes = {
    'All journeys': '/journeys', Cairo: '/journeys', Luxor: '/journeys', Aswan: '/journeys', Hurghada: '/journeys', 'More destinations': '/journeys',
    'Airport transfers': '/#transfers', 'City to city': '/#transfers', 'Hourly service': '/#transfers', 'Long distance': '/#transfers',
    'About us': '/about', 'How booking works': '/how-booking-works', FAQ: '/faq', 'Contact us': '/contact',
  }
  return routes[link] || null
}
</script>

<template>
  <footer class="site-footer" :class="{ 'site-footer--faq': detailed }">
    <div class="footer-main page-container">
      <div class="footer-brand">
        <a class="footer-logo" href="/" aria-label="TheVTravel home">
          <img class="logo-light" src="/assets/brand/logo-transparent.png" alt="TheVTravel" width="174" height="58" />
          <img class="logo-dark" src="/assets/brand/logo-transparent-dark.png" alt="TheVTravel" width="174" height="58" />
        </a>
        <template v-if="detailed">
          <p>Private journeys across Egypt,<br />at your own pace.</p>
          <div v-if="props.variant === 'faq' || props.variant === 'booking'" class="footer-socials" aria-label="Social links">
            <span aria-label="Instagram"><AppIcon name="instagram" :size="20" /></span>
            <span aria-label="Facebook"><AppIcon name="facebook" :size="20" /></span>
            <span aria-label="WhatsApp"><AppIcon name="whatsapp" :size="20" /></span>
            <span aria-label="Email"><AppIcon name="mail" :size="20" /></span>
          </div>
        </template>
      </div>
      <section v-for="column in (detailed ? (props.variant === 'booking' ? bookingColumns : faqColumns) : columns)" :key="column.title" class="footer-column">
        <h2>{{ column.title }}</h2>
        <template v-for="link in column.links" :key="link">
          <a v-if="footerHref(link)" :href="footerHref(link)">{{ link }}</a>
          <span v-else>{{ link }}</span>
        </template>
      </section>
    </div>
    <div class="footer-bar page-container">
      <small>© {{ detailed ? '2024 ' : '' }}TheVTravel. All rights reserved.</small>
      <span v-if="props.variant === 'contact'"><AppIcon name="send" :size="18" /> We reply by message, every day.</span>
      <span v-else-if="props.variant !== 'booking'"><AppIcon name="shield" :size="18" /> {{ props.variant === 'faq' ? 'No online payment. Need to confirm your booking.' : 'No online payment. No deposit.' }}</span>
    </div>
  </footer>
</template>
