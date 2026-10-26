<script setup>
definePageMeta({"name": "home", "title": "TheVTravel — Journeys across Egypt"})
import { computed } from 'vue'
import { useRuntimeConfig, useAsyncData } from '#imports'
import SiteHeader from '~/components/SiteHeader.vue'
import JourneyCard from '~/components/JourneyCard.vue'
import TransferBanner from '~/components/TransferBanner.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import HeroRouteLine from '~/components/HeroRouteLine.vue'
import { useI18n } from '~/utils/i18n'
import { fetchFeaturedJourneys, fetchJourneyFilters } from '~/services/journeys'
import { fetchPageSections, textOr } from '~/services/pageContent'
import { journeys as demoJourneys } from '~/data/journeys'
import { homeContent } from '~/data/homeContent'

const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()
const api = runtime.apiBaseUrl

// The words around the journey sections are managed in the admin under
// Website Content → Home Page; the journeys and destinations themselves are
// records, edited in Journeys and Destinations. Nothing on this page keeps a
// second copy of either.
const { data: sections } = await useAsyncData(
  'home-journey-sections',
  () => fetchPageSections(api, 'home', locale.value),
  { watch: [locale], default: () => null },
)

const { data: featuredResult } = await useAsyncData(
  'home-featured-journeys',
  () => fetchFeaturedJourneys(api, { limit: 3, language: locale.value }),
  { watch: [locale], default: () => null },
)

const { data: filters } = await useAsyncData(
  'home-journey-filters',
  () => fetchJourneyFilters(api, locale.value),
  { watch: [locale], default: () => null },
)

const hero = computed(() => {
  const section = sections.value?.journeys_hero
  return {
    eyebrow: textOr(section?.subtitle, translate(homeContent.eyebrow)),
    title: textOr(section?.title, translate(homeContent.title)),
    tagline: textOr(section?.body, translate(homeContent.subtitle)),
    description: textOr(section?.sub_body, translate(homeContent.description)),
    photoAlt: textOr(section?.data?.image_alt, translate('A felucca sailing on the Nile below desert cliffs at sunset')),
    // Unset, each theme keeps its own built-in photo (see styles.css).
    image: section?.media?.image?.url || null,
  }
})

const heroPhotoStyle = computed(() => hero.value.image ? { '--hero-image': `url(${JSON.stringify(hero.value.image)})` } : null)

const featured = computed(() => {
  if (featuredResult.value?.status === 'ok') return featuredResult.value.journeys
  // No API base URL configured: deliberate demo mode, same as every other page.
  if (featuredResult.value?.status === 'demo') return demoJourneys.slice(0, 3)
  return []
})

const featuredHeading = computed(() => ({
  title: textOr(sections.value?.featured_journeys?.title, translate(homeContent.featuredTitle)),
  description: textOr(sections.value?.featured_journeys?.body, translate(homeContent.featuredDescription)),
}))

const benefitsTitle = computed(() => textOr(sections.value?.why_travel?.title, translate(homeContent.benefitsTitle)))

const benefits = computed(() => {
  const items = sections.value?.why_travel?.items
  if (Array.isArray(items) && items.length) {
    return items.map((item, index) => ({ key: item.id ?? index, icon: item.icon || 'people', title: item.title || '', text: item.description || '' }))
  }
  return homeContent.benefits.map((item, index) => ({ key: index, icon: item.icon, title: translate(item.title), text: translate(item.text) }))
})

const destinationsHeading = computed(() => ({
  title: textOr(sections.value?.popular_destinations?.title, translate(homeContent.destinationsTitle)),
  description: textOr(sections.value?.popular_destinations?.body, translate(homeContent.destinationsDescription)),
}))

// Each card links to the catalogue already filtered by that destination's
// slug — a stable identifier, so the link means the same thing in every
// language and survives the name being edited.
const destinations = computed(() => {
  if (filters.value?.status === 'ok') {
    return filters.value.homeDestinations.map(destination => ({
      key: destination.slug,
      name: destination.name,
      image: destination.image?.url ?? null,
      alt: destination.image?.alt ?? destination.name,
      query: { destination: destination.slug },
    }))
  }
  return homeContent.destinations.map(destination => ({
    key: destination.name,
    name: translate(destination.name),
    image: destination.image,
    alt: translate(destination.alt),
    query: { destination: destination.name },
  }))
})
</script>
<template>
  <div class="home-page">
    <SiteHeader />
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">{{ hero.eyebrow }}</p>
        <h1 id="home-title">{{ hero.title }}</h1>
        <span class="heading-rule" aria-hidden="true"></span>
        <p>{{ hero.tagline }}</p>
        <p>{{ hero.description }}</p>
        <NuxtLink class="button button-primary explore-cta" to="/journeys">{{ $t("Explore journeys") }} <AppIcon name="arrow" /></NuxtLink>
      </div>
      <div class="hero-photo" role="img" :aria-label="hero.photoAlt" :style="heroPhotoStyle"></div>
      <HeroRouteLine />
    </section>
    <main>
      <section v-if="featured.length" class="home-featured page-container" aria-labelledby="featured-title">
        <div class="home-section-heading"><h2 id="featured-title">{{ featuredHeading.title }}</h2><p>{{ featuredHeading.description }}</p></div>
        <div class="listing-grid listing-grid--grid"><JourneyCard v-for="journey in featured" :key="journey.id" :journey="journey" /></div>
        <div class="home-all-link"><NuxtLink class="button button-secondary" to="/journeys">{{ $t("View all journeys") }} <AppIcon name="arrow" /></NuxtLink></div>
      </section>
      <section class="home-benefits page-container" aria-labelledby="benefits-title">
        <h2 id="benefits-title">{{ benefitsTitle }}</h2>
        <div class="home-benefit-grid"><article v-for="item in benefits" :key="item.key"><AppIcon :name="item.icon" :size="26" /><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>
      </section>
      <section v-if="destinations.length" class="home-destinations page-container" aria-labelledby="destinations-title">
        <div class="home-section-heading"><h2 id="destinations-title">{{ destinationsHeading.title }}</h2><p>{{ destinationsHeading.description }}</p></div>
        <div class="destination-grid"><NuxtLink v-for="item in destinations" :key="item.key" :to="{ path: '/journeys', query: item.query }" class="destination-card"><img v-if="item.image" :src="item.image" :alt="item.alt" loading="lazy" width="600" height="400" /><span>{{ item.name }} <AppIcon name="arrow" :size="20" /></span></NuxtLink></div>
      </section>
      <TransferBanner :section="sections?.transfer_banner ?? null" />
    </main>
    <SiteFooter />
  </div>
</template>
