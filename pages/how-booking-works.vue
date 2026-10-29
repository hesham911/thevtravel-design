<script setup>
definePageMeta({"name": "how-booking-works", "title": "How Booking Works \u2014 TheVTravel"})
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import ContentIcon from '~/components/ContentIcon.vue'
import NeedHelpCTA from '~/components/NeedHelpCTA.vue'
import { useI18n } from '~/utils/i18n'
import { fetchPageSections, textOr } from '~/services/pageContent'

const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()

// Managed in the admin under Website Content → How Booking Works. The API
// resolves every field to the requested language server-side, so a missing
// translation arrives as the English copy rather than as an empty page.
// Refetched when the visitor switches language.
const { data: sections } = await useAsyncData(
  'how-booking-works-sections',
  () => fetchPageSections(runtime.apiBaseUrl, 'how-booking-works', locale.value),
  { watch: [locale], default: () => null },
)

// The page's own copy, used only while the CMS has nothing to serve (no API
// base URL configured, the API unreachable, or the page unpublished). Every
// string stays translatable through the demo table, exactly as before.
const fallbackSteps = [
  { icon: 'search', title: 'Explore journeys', description: 'Browse our handpicked private experiences across Egypt and find the one that inspires you.' },
  { icon: 'booking-calendar', title: 'Request your date & details', description: 'Choose your preferred date, number of travelers and any special requests.' },
  { icon: 'person', title: 'We confirm availability', description: 'We check availability and send you a personalized confirmation.' },
  { icon: 'chat', title: 'We get in touch with you', description: 'Our travel expert contacts you via WhatsApp to finalize the details.' },
  { icon: 'checklist', title: 'You’re all set!', description: 'Once everything is confirmed, your journey is ready to go.' },
  { icon: 'pin', title: 'Enjoy your journey', description: 'Relax and enjoy your private experience. We take care of everything.' },
]
const fallbackHeroLines = [
  'Booking your private journey with TheVTravel',
  'is simple and flexible. You choose the experience,',
  'we take care of the rest.',
]

// The badge above each card is the step's position, never stored content, so
// adding, removing or reordering steps in the admin can never leave a gap or
// a duplicate in the numbering.
const stepNumber = index => String(index + 1).padStart(2, '0')

const hero = computed(() => {
  const section = sections.value?.hero
  const body = typeof section?.body === 'string' ? section.body.split('\n').map(line => line.trim()).filter(Boolean) : []
  return {
    eyebrow: textOr(section?.subtitle, translate('Simple, private & personal')),
    title: textOr(section?.title, translate('How booking works')),
    lines: body.length ? body : fallbackHeroLines.map(line => translate(line)),
    photoAlt: textOr(section?.data?.image_alt, translate('A felucca sailing beside ancient temple columns on the Nile at sunset')),
  }
})

const stepsHeading = computed(() => textOr(sections.value?.steps?.title, translate('Your journey in 6 easy steps')))

const steps = computed(() => {
  const items = sections.value?.steps?.items
  if (Array.isArray(items) && items.length) {
    return items.map((item, index) => ({
      key: item.id ?? index,
      number: stepNumber(index),
      icon: item.icon || 'search',
      iconImageUrl: item.icon_image_url || '',
      iconImageDarkUrl: item.icon_image_dark_url || '',
      title: item.title || '',
      description: item.description || '',
    }))
  }
  return fallbackSteps.map((step, index) => ({
    key: index,
    number: stepNumber(index),
    // The page's own copy ships no artwork, and a step's icon is now the
    // uploaded file alone, so these steps keep their words and hold the
    // icon's square empty until the CMS has one.
    iconImageUrl: '',
    iconImageDarkUrl: '',
    title: translate(step.title),
    description: translate(step.description),
  }))
})

const payment = computed(() => {
  const section = sections.value?.payment_note
  return {
    label: textOr(section?.data?.aria_label, translate('Payment information')),
    title: textOr(section?.title, translate('No online payment required')),
    body: textOr(section?.body, translate('Payment is taken manually at the start of your trip.')),
  }
})
</script>

<template>
  <div class="booking-page">
    <SiteHeader />

    <main>
      <section class="booking-hero" aria-labelledby="booking-page-title">
        <div class="booking-hero-copy">
          <p class="eyebrow">{{ hero.eyebrow }}</p>
          <h1 id="booking-page-title">{{ hero.title }}</h1>
          <p>
            <template v-for="(line, index) in hero.lines" :key="index"><br v-if="index" class="desktop-only" />{{ index ? ' ' : '' }}{{ line }}</template>
          </p>
        </div>
        <div class="booking-hero-photo" role="img" :aria-label="hero.photoAlt"></div>
        <svg class="booking-hero-route" viewBox="0 0 520 150" fill="none" aria-hidden="true">
          <path d="M5 131C56 90 116 111 166 104c48-7 59-37 105-29 45 8 73 31 118 5 20-12 28-31 39-54" />
          <circle cx="271" cy="75" r="6" />
          <g transform="translate(428 26)">
            <path d="M0-10a10 10 0 0 0-10 10c0 7 10 17 10 17S10 7 10 0A10 10 0 0 0 0-10Z" fill="currentColor" stroke="none" />
            <circle cy="0" r="3.2" class="booking-route-pin-center" stroke="none" />
          </g>
          <path class="booking-route-arrow" d="M452 34c9-3 17 0 23 7m-4-6 4 6-6 2" />
        </svg>
      </section>

      <section class="booking-steps-section page-container" aria-labelledby="booking-steps-title">
        <header class="booking-section-heading">
          <h2 id="booking-steps-title">{{ stepsHeading }}</h2>
          <span aria-hidden="true"></span>
        </header>

        <div class="booking-step-grid">
          <article v-for="step in steps" :key="step.key" class="booking-step-card">
            <span class="booking-step-number">{{ step.number }}</span>
            <span class="booking-step-icon"><ContentIcon :image-url="step.iconImageUrl" :image-dark-url="step.iconImageDarkUrl" :size="54" /></span>
            <h3>{{ step.title }}</h3>
            <i aria-hidden="true"></i>
            <p>{{ step.description }}</p>
          </article>
        </div>

        <aside class="payment-panel" :aria-label="payment.label">
          <div>
            <h2>{{ payment.title }}</h2>
            <p>{{ payment.body }}</p>
          </div>
        </aside>
      </section>

      <NeedHelpCTA floating />
    </main>

    <SiteFooter variant="booking" />

  </div>
</template>
