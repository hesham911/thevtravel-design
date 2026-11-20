<script setup>
import { contentImage } from '~/utils/contentImages'
import { computed } from 'vue'
import { useAsyncData, useRuntimeConfig } from '#imports'
definePageMeta({ name: 'about', title: 'About TheVTravel — Egypt, planned with local care' })
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import ContentIcon from '~/components/ContentIcon.vue'
import { useI18n } from '~/utils/i18n'
import { fetchPageSections, itemsOr, linesOf, textOr } from '~/services/pageContent'

const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()

// Managed in the admin under Website Content → About Us. The API resolves
// every field to the requested language server-side, so a missing
// translation arrives as the English copy rather than as an empty page, and
// the page is refetched when the visitor switches language.
const { data: sections } = await useAsyncData(
  'about-sections',
  () => fetchPageSections(runtime.apiBaseUrl, 'about-us', locale.value),
  { watch: [locale], default: () => null },
)

// The page's own copy, used only while the CMS has nothing to serve (no API
// base URL configured, the API unreachable, or the page unpublished). Every
// string stays translatable through the demo table, exactly as before.
const fallback = {
  philosophy: [
    { key: 'private', icon: 'lock', title: 'Private by design', description: 'Your journey is crafted around you. From the pace to the places, every choice is yours.' },
    { key: 'local', icon: 'pin', title: 'Local knowledge', description: 'We live and work here. You benefit from trusted relationships and up-to-date local insight.' },
    { key: 'human', icon: 'people-pin', title: 'Clear human confirmation', description: 'A real person confirms every detail before you travel, so there are no surprises on the day.' },
  ],
  process: [
    { key: 'listen', icon: 'ear', title: 'Listen', description: 'We listen carefully to understand your travel style.' },
    { key: 'design', icon: 'map', title: 'Design', description: 'We shape your journey with the right places and practical detail.' },
    { key: 'confirm', icon: 'person', title: 'Confirm', description: 'A real person reviews and confirms everything with you.' },
    { key: 'care', icon: 'sunrise', title: 'Care', description: 'We stay by your side throughout your journey in Egypt.' },
  ],
  bookingSteps: [
    { key: 'request', title: 'Send your request', description: 'Tell us your dates, interests and travel style.' },
    { key: 'confirm', title: 'We confirm every detail', description: 'We plan your journey and confirm everything with you.' },
    { key: 'pay', title: 'Pay at the start', description: 'You pay securely at the start of your trip. No online payment.' },
  ],
  destinations: [
    { key: 'cairo', icon: 'pin', title: 'Cairo', description: 'Timeless heritage\nand vibrant life.' },
    { key: 'luxor', icon: 'pin', title: 'Luxor', description: 'Pharaohs, temples and\niconic river landscapes.' },
    { key: 'aswan', icon: 'pin', title: 'Aswan', description: 'Serene river life and\nNubian culture.' },
    { key: 'nile', icon: 'pin', title: 'The Nile', description: 'Sail, relax and let the\nriver set the rhythm.' },
    { key: 'abu-simbel', icon: 'pin', title: 'Abu Simbel', description: 'An unforgettable journey\ninto ancient history.' },
  ],
  values: [
    { key: 'culture', icon: 'leaf', title: 'Respect culture', description: 'We promote respectful travel and meaningful connections.' },
    { key: 'local', icon: 'community', title: 'Support local', description: 'We work with local partners and support local livelihoods.' },
    { key: 'places', icon: 'protect', title: 'Protect places', description: 'We encourage responsible choices that care for nature and heritage.' },
    { key: 'mindful', icon: 'heart', title: 'Travel mindfully', description: 'We believe small choices create a better experience for everyone.' },
  ],
}

// A card list's own copy, with every string translated through the demo
// table — the shape itemsOr() returns for a CMS-managed list.
function fallbackCards(cards) {
  return cards.map(card => ({
    key: card.key,
    icon: card.icon ?? null,
    // The page's own copy ships no artwork, and a card's icon is now the
    // uploaded file alone, so these cards keep their words and hold the
    // icon's square empty until the CMS has one.
    iconImageUrl: '',
    iconImageDarkUrl: '',
    title: translate(card.title),
    description: translate(card.description),
  }))
}

const hero = computed(() => {
  const section = sections.value?.hero
  return {
    eyebrow: textOr(section?.subtitle, translate('About TheVTravel')),
    title: textOr(section?.title, translate('Egypt, planned with local care')),
    body: textOr(section?.body, translate('We create private journeys and transfers shaped around you—planned by real people who know Egypt and confirm every detail before you travel.')),
    photoAlt: textOr(section?.data?.image_alt, translate('A felucca sailing on the Nile at sunset')),
    // Unset, the page keeps the hero photo the design crops and masks.
    image: section?.media?.image?.url || null,
  }
})

const philosophy = computed(() => {
  const section = sections.value?.philosophy
  return {
    eyebrow: textOr(section?.subtitle, translate('Our philosophy')),
    title: textOr(section?.title, translate('Private travel. Considered in every detail.')),
    body: textOr(section?.body, translate('Travel in Egypt should feel personal, unhurried and effortless. We believe the best journeys are built on listening closely, sharing honest advice and handling the details with care. No scripts—just thoughtful planning and local expertise you can rely on.')),
    cards: itemsOr(section, fallbackCards(fallback.philosophy)),
  }
})

const route = computed(() => {
  const section = sections.value?.route_horizon
  return {
    eyebrow: textOr(section?.subtitle, translate('Route & horizon')),
    titleLines: linesOf(section?.title, [translate('The route we follow.'), translate('The horizon we keep.')]),
    body: textOr(section?.body, translate('We connect the timeless places of Egypt with a travel experience that is smooth, private and deeply local.')),
    steps: itemsOr(section, fallbackCards(fallback.process)),
  }
})

// The badge over each step is its position, never stored content, so adding,
// removing or reordering steps in the admin can never leave a gap or a
// duplicate in the numbering.
const booking = computed(() => {
  const section = sections.value?.booking_steps
  return {
    eyebrow: textOr(section?.subtitle, translate('How TheVTravel works')),
    title: textOr(section?.title, translate('Simple steps. Personal care.')),
    paymentNote: textOr(section?.data?.payment_note, translate('No online payment. No deposit.')),
    steps: itemsOr(section, fallbackCards(fallback.bookingSteps)),
  }
})

const people = computed(() => {
  const section = sections.value?.people
  return {
    eyebrow: textOr(section?.subtitle, translate('People-focused service')),
    title: textOr(section?.title, translate('Real people. Here for your journey.')),
    body: textOr(section?.body, translate('From your first message to your final day in Egypt, you’ll have a dedicated local team on hand—responsive, discreet and committed to your peace of mind.')),
    image: contentImage(section?.media?.image, 'about-people', locale.value),
    imageAlt: contentImage(section?.media?.image, 'about-people', locale.value).alt || textOr(section?.data?.image_alt, translate('A local TheVTravel host welcoming a guest')),
  }
})

const destinations = computed(() => {
  const section = sections.value?.destinations
  return {
    eyebrow: textOr(section?.subtitle, translate('Journeys across Egypt')),
    title: textOr(section?.title, translate('Timeless places. Seamless journeys.')),
    places: itemsOr(section, fallbackCards(fallback.destinations)),
  }
})

const values = computed(() => {
  const section = sections.value?.values
  return {
    eyebrow: textOr(section?.subtitle, translate('Responsible guest care')),
    title: textOr(section?.title, translate('Travel well. Leave only what is good.')),
    body: textOr(section?.body, translate('We care for the places we share with you and the people who welcome us. Our choices support local communities, respect culture and protect the beauty of Egypt.')),
    cards: itemsOr(section, fallbackCards(fallback.values)),
  }
})

const cta = computed(() => {
  const section = sections.value?.cta
  return {
    title: textOr(section?.title, translate('Ready to explore Egypt your way?')),
    body: textOr(section?.body, translate('Share your ideas and we’ll take care of the rest.')),
    label: textOr(section?.data?.cta_text, translate('Explore journeys')),
    link: textOr(section?.data?.cta_url, '/journeys'),
    photoAlt: textOr(section?.data?.image_alt, translate('Feluccas sailing on the Nile at sunset')),
  }
})

const heroPhotoStyle = computed(() => hero.value.image ? { '--hero-image': `url(${JSON.stringify(hero.value.image)})` } : null)
useHead(() => ({ link: hero.value.image ? [{ key: 'page-hero-preload', rel: 'preload', as: 'image', href: hero.value.image, fetchpriority: 'high' }] : [
  { key: 'about-hero-mobile', rel: 'preload', as: 'image', href: '/assets/content/about-nile-768.webp', media: '(max-width: 767px)', fetchpriority: 'high' },
  { key: 'about-hero-retina', rel: 'preload', as: 'image', href: '/assets/content/about-nile-2178.webp', media: '(min-width: 768px) and (min-resolution: 1.5dppx)', fetchpriority: 'high' },
  { key: 'about-hero-desktop', rel: 'preload', as: 'image', href: '/assets/content/about-nile-1600.webp', media: '(min-width: 768px) and (resolution < 1.5dppx)', fetchpriority: 'high' },
] }))


const destinationIcons = ['landmark', 'landmark', 'sunrise', 'sailboat', 'landmark']

const stepNumber = index => String(index + 1)
</script>

<template>
  <div class="about-page">
    <SiteHeader />

    <main>
      <section class="about-hero" aria-labelledby="about-title">
        <div class="about-hero-copy">
          <p class="eyebrow">{{ hero.eyebrow }}</p>
          <h1 id="about-title">{{ hero.title }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>{{ hero.body }}</p>
        </div>
        <div class="about-hero-photo" role="img" :aria-label="hero.photoAlt" :style="heroPhotoStyle"></div>
        <svg class="about-hero-route" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
          <path d="M76 573C122 485 239 490 335 500c105 12 181 12 255-26 50-25 94-61 158-74" />
          <circle cx="76" cy="573" r="6" /><circle cx="590" cy="474" r="6" />
        </svg>
      </section>

      <section class="about-section philosophy-section page-container" aria-labelledby="philosophy-title">
        <div class="section-intro centered">
          <p class="eyebrow">{{ philosophy.eyebrow }}</p>
          <h2 id="philosophy-title">{{ philosophy.title }}</h2>
          <p>{{ philosophy.body }}</p>
        </div>
        <div class="philosophy-grid">
          <article v-for="item in philosophy.cards" :key="item.key" class="icon-feature">
            <span class="icon-ring"><ContentIcon :image-url="item.iconImageUrl" :image-dark-url="item.iconImageDarkUrl" :size="30" /></span>
            <div><h3>{{ item.title }}</h3><p>{{ item.description }}</p></div>
          </article>
        </div>
      </section>

      <section class="route-section" aria-labelledby="route-title">
        <div class="route-layout page-container">
          <div class="route-copy">
            <p class="eyebrow">{{ route.eyebrow }}</p>
            <h2 id="route-title"><template v-for="(line, index) in route.titleLines" :key="index"><br v-if="index" />{{ line }}</template></h2>
            <span class="heading-rule" aria-hidden="true"></span>
            <p>{{ route.body }}</p>
          </div>
          <div class="route-process">
            <svg class="process-route-line" viewBox="0 0 900 115" preserveAspectRatio="none" aria-hidden="true">
              <path d="M18 78C72 20 145 53 207 58c72 6 111-32 174-34 77-2 86 48 158 35 56-10 68-64 133-54 58 9 93 59 194 28" />
            </svg>
            <article v-for="item in route.steps" :key="item.key" class="process-step">
              <ContentIcon :image-url="item.iconImageUrl" :image-dark-url="item.iconImageDarkUrl" :size="34" />
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </article>
            <div class="horizon-mark" aria-hidden="true"><AppIcon name="sunrise" :size="62" /><i></i><i></i></div>
          </div>
        </div>
      </section>

      <section id="how" class="about-section booking-section page-container" aria-labelledby="booking-title">
        <div class="section-intro centered compact">
          <p class="eyebrow">{{ booking.eyebrow }}</p>
          <h2 id="booking-title">{{ booking.title }}</h2>
        </div>
        <div class="booking-steps">
          <article v-for="(step, index) in booking.steps" :key="step.key" class="booking-step">
            <span class="step-number">{{ stepNumber(index) }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </article>
        </div>
        <p class="payment-note"><AppIcon name="shield" :size="26" /> {{ booking.paymentNote }}</p>
      </section>

      <section class="people-section" aria-labelledby="people-title">
        <div class="people-copy">
          <p class="eyebrow">{{ people.eyebrow }}</p>
          <h2 id="people-title">{{ people.title }}</h2>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>{{ people.body }}</p>
        </div>
        <img :src="people.image.url" :srcset="people.image.srcset" sizes="(max-width: 767px) 100vw, 55vw" :alt="people.imageAlt" :width="people.image.width || 1672" :height="people.image.height || 941" loading="lazy" decoding="async" />
      </section>

      <section class="about-section destinations-section page-container" aria-labelledby="destinations-title">
        <h2 id="destinations-title">{{ destinations.title }}</h2>
        <div class="destination-route">
          <article v-for="(place, index) in destinations.places" :key="place.key">
            <span class="place-pin">
              <ContentIcon v-if="place.iconImageUrl" :image-url="place.iconImageUrl" :image-dark-url="place.iconImageDarkUrl" :size="30" />
              <AppIcon v-else :name="destinationIcons[index] || 'pin'" :size="30" />
            </span>
            <h3>{{ place.title }}</h3>
            <p>{{ place.description.replaceAll('\n', ' ') }}</p>
          </article>
        </div>
      </section>

      <section class="about-section values-section page-container" aria-labelledby="values-title">
        <div class="values-heading">
          <div><p class="eyebrow">{{ values.eyebrow }}</p><h2 id="values-title">{{ values.title }}</h2></div>
          <p>{{ values.body }}</p>
        </div>
        <div class="values-grid">
          <article v-for="item in values.cards" :key="item.key" class="value-item">
            <ContentIcon :image-url="item.iconImageUrl" :image-dark-url="item.iconImageDarkUrl" :size="48" />
            <div><h3>{{ item.title }}</h3><p>{{ item.description }}</p></div>
          </article>
        </div>
      </section>

      <section id="request" class="editorial-cta" aria-labelledby="about-cta-title">
        <div class="editorial-cta-inner page-container">
          <AppIcon name="compass" :size="48" />
          <div><h2 id="about-cta-title">{{ cta.title }}</h2><p>{{ cta.body }}</p></div>
          <PublicLink class="button button-primary" :to="cta.link">{{ cta.label }} <AppIcon name="arrow" :size="18" /></PublicLink>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
