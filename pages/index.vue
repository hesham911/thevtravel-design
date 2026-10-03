<script setup>
definePageMeta({"name": "home", "title": "TheVTravel \u2014 Journeys across Egypt"})
import SiteHeader from '~/components/SiteHeader.vue'
import JourneyCard from '~/components/JourneyCard.vue'
import TransferBanner from '~/components/TransferBanner.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import HeroRouteLine from '~/components/HeroRouteLine.vue'
import { journeys } from '~/data/journeys'
import { homeContent } from '~/data/homeContent'
const featured = journeys.slice(0, 3)
</script>
<template>
  <div class="home-page">
    <SiteHeader />
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">{{ $t(homeContent.eyebrow) }}</p>
        <h1 id="home-title">{{ $t(homeContent.title) }}</h1>
        <span class="heading-rule" aria-hidden="true"></span>
        <p>{{ $t(homeContent.subtitle) }}</p>
        <p>{{ $t(homeContent.description) }}</p>
        <NuxtLink class="button button-primary explore-cta" to="/journeys">{{ $t("Explore journeys") }} <AppIcon name="arrow" /></NuxtLink>
      </div>
      <div class="hero-photo" role="img" :aria-label='$t("A felucca sailing on the Nile below desert cliffs at sunset")'></div>
      <HeroRouteLine />
    </section>
    <main>
      <section class="home-featured page-container" aria-labelledby="featured-title">
        <div class="home-section-heading"><h2 id="featured-title">{{ $t(homeContent.featuredTitle) }}</h2><p>{{ $t(homeContent.featuredDescription) }}</p></div>
        <div class="listing-grid listing-grid--grid"><JourneyCard v-for="journey in featured" :key="journey.id" :journey="journey" /></div>
        <div class="home-all-link"><NuxtLink class="button button-secondary" to="/journeys">{{ $t("View all journeys") }} <AppIcon name="arrow" /></NuxtLink></div>
      </section>
      <section class="home-benefits page-container" aria-labelledby="benefits-title">
        <h2 id="benefits-title">{{ $t(homeContent.benefitsTitle) }}</h2>
        <div class="home-benefit-grid"><article v-for="item in homeContent.benefits" :key="item.title"><AppIcon :name="item.icon" :size="26" /><h3>{{ $t(item.title) }}</h3><p>{{ $t(item.text) }}</p></article></div>
      </section>
      <section class="home-destinations page-container" aria-labelledby="destinations-title">
        <div class="home-section-heading"><h2 id="destinations-title">{{ $t(homeContent.destinationsTitle) }}</h2><p>{{ $t(homeContent.destinationsDescription) }}</p></div>
        <div class="destination-grid"><NuxtLink v-for="item in homeContent.destinations" :key="item.name" :to="{ path: '/journeys', query: { destination: item.name } }" class="destination-card"><img :src="item.image" :alt="$t(item.alt)" loading="lazy" width="600" height="400" /><span>{{ $t(item.name) }} <AppIcon name="arrow" :size="20" /></span></NuxtLink></div>
      </section>
      <TransferBanner />
    </main>
    <SiteFooter />
  </div>
</template>
