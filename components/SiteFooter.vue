<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import BrandIcon from './BrandIcon.vue'
import { useSiteContent } from '~/composables/useSiteContent'

// The footer's words, its link columns and its notes are managed in the
// admin under Website Content → Header & Footer; the logos, the email
// address and the social links come from Settings. The link targets are
// this application's own routes, stored as entered — a label and where it
// goes, not a menu builder.
//
// `variant` stays what it has always been: which of the footer's two
// layouts a page draws, and which of its notes belongs in the bar. It is
// the design's, not content.
const props = defineProps({ variant: { type: String, default: 'default' } })

const { footer, contact, column } = useSiteContent()

const socials = [{ name: 'instagram', label: 'Instagram' }, { name: 'facebook', label: 'Facebook' }, { name: 'whatsapp', label: 'WhatsApp' }]

// A social link is rendered only when it is a real http(s) address: an
// unconfigured or malformed one leaves the icon in place, unlinked, exactly
// as before.
function socialHref(name) {
  try {
    const url = new URL(contact.value.social[name])
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

const detailed = computed(() => ['faq', 'contact', 'booking'].includes(props.variant))

const columns = computed(() => [
  column('footer_journeys', { title: 'Journeys', links: [{ key: 'all', title: 'All journeys', link: '/journeys' }] }),
  column('footer_transfers', {
    title: 'Private transfers',
    links: [
      { key: 'airport', title: 'Airport transfers', link: '/#transfers' },
      { key: 'city', title: 'City to city', link: '/#transfers' },
      { key: 'hourly', title: 'Hourly service', link: '/#transfers' },
      { key: 'long', title: 'Long distance', link: '/#transfers' },
    ],
  }),
  column('footer_company', {
    title: 'Company',
    links: [
      { key: 'about', title: 'About us', link: '/about' },
      { key: 'how', title: 'How booking works', link: '/how-booking-works' },
      { key: 'contact', title: 'Contact us', link: '/contact' },
    ],
  }),
  column('footer_help', {
    title: 'Help',
    links: [
      { key: 'faq', title: 'FAQ', link: '/faq' },
      { key: 'terms', title: 'Terms & Conditions', link: '/terms-and-conditions' },
      { key: 'privacy', title: 'Privacy policy', link: '/privacy-policy' },
    ],
  }),
])

// The year is this one, every year — a date in the copy would go stale the
// moment it was written.
const copyright = computed(() => `© ${new Date().getFullYear()} ${footer.value.copyright}`)

const barNote = computed(() => {
  if (props.variant === 'contact') return { icon: 'send', text: footer.value.replyNote }
  if (props.variant === 'booking') return null
  return { icon: 'shield', text: props.variant === 'faq' ? footer.value.bookingNote : footer.value.paymentNote }
})
</script>

<template>
  <footer class="site-footer" :class="{ 'site-footer--faq': detailed }">
    <div class="footer-main page-container">
      <div class="footer-brand">
        <NuxtLink class="footer-logo" to="/" :aria-label='$t("TheVTravel home")'>
          <img class="logo-light" :src="footer.logoLight || '/assets/brand/logo-transparent.png'" :alt="footer.logoAlt" width="174" height="58" />
          <img class="logo-dark" :src="footer.logoDark || '/assets/brand/logo-transparent-dark.png'" :alt="footer.logoAlt" width="174" height="58" />
        </NuxtLink>
        <template v-if="detailed">
          <p><template v-for="(line, index) in footer.taglineLines" :key="index"><br v-if="index" />{{ line }}</template></p>
          <div v-if="variant === 'faq' || variant === 'booking'" class="footer-socials" :aria-label='$t("Social links")'>
            <template v-for="social in socials" :key="social.name">
              <a v-if="socialHref(social.name)" :href="socialHref(social.name)" :aria-label="$t(social.label)" rel="noopener noreferrer"><BrandIcon :name="social.name" :size="20" /></a>
              <span v-else role="img" :aria-label="$t(social.label)"><BrandIcon :name="social.name" :size="20" /></span>
            </template>
            <a v-if="contact.email" :href="`mailto:${contact.email}`" :aria-label='$t("Email")'><AppIcon name="mail" :size="20" /></a>
            <span v-else role="img" :aria-label='$t("Email")'><AppIcon name="mail" :size="20" /></span>
          </div>
        </template>
      </div>
      <section v-for="col in columns" :key="col.key" class="footer-column">
        <h2>{{ col.title }}</h2>
        <template v-for="link in col.links" :key="link.key">
          <a v-if="link.link" :href="link.link">{{ link.title }}</a>
          <span v-else>{{ link.title }}</span>
        </template>
      </section>
    </div>
    <div class="footer-bar page-container">
      <small>{{ copyright }}</small>
      <span v-if="barNote"><AppIcon :name="barNote.icon" :size="18" /> {{ barNote.text }}</span>
    </div>
  </footer>
</template>
