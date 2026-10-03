<script setup>
import { ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import JourneyCard from '../components/JourneyCard.vue'
import TransferBanner from '../components/TransferBanner.vue'
import SiteFooter from '../components/SiteFooter.vue'
import AppIcon from '../components/AppIcon.vue'
import HeroRouteLine from '../components/HeroRouteLine.vue'

const page = ref(1)

const journeys = [
  {
    title: 'Pyramids & Nile Escape', image: '/assets/journeys/journey-pyramids.png', alt: 'The Pyramids at sunset',
    locations: 'Cairo, Giza, Luxor, Aswan', duration: '6 days', tags: ['Private tour', 'Seamless transfers'],
    description: 'Stand before the Pyramids, sail the Nile and uncover Egypt’s greatest treasures.',
  },
  {
    title: 'Pharaohs of the Nile', image: '/assets/journeys/journey-karnak.png', alt: 'Ancient temple columns at Karnak',
    locations: 'Luxor, Aswan, Kom Ombo, Edfu', duration: '5 days', tags: ['Private tour', 'Expert guide'],
    description: 'Walk through ancient temples and sail between timeless wonders.',
  },
  {
    title: 'Abu Simbel Explorer', image: '/assets/journeys/journey-abu-simbel.png', alt: 'The temples of Abu Simbel',
    locations: 'Aswan, Abu Simbel', duration: '2 days', tags: ['Private tour', 'Seamless transfers'],
    description: 'Journey to Abu Simbel and explore one of Egypt’s most iconic sites.',
  },
  {
    title: 'Nile Serenity Cruise', image: '/assets/journeys/journey-felucca.png', alt: 'A felucca at sunset on the Nile',
    locations: 'Luxor, Edfu, Kom Ombo, Aswan', duration: '4 days', tags: ['Private cruise', 'Seamless transfers'],
    description: 'Relax on a private felucca and let the river set the rhythm.',
  },
  {
    title: 'Sinai Discovery', image: '/assets/journeys/journey-sinai.png', alt: 'Mountains of the Sinai Peninsula',
    locations: 'Cairo, St. Catherine, Dahab', duration: '5 days', tags: ['Private tour', 'Expert guide'],
    description: 'Explore sacred mountains and the beauty of the Sinai Peninsula.',
  },
  {
    title: 'Alexandria Day Escape', image: '/assets/journeys/journey-alexandria.png', alt: 'The Mediterranean coast at Alexandria',
    locations: 'Cairo, Alexandria', duration: '1 day', tags: ['Private tour', 'Seamless transfers'],
    description: 'Discover Alexandria’s rich heritage by the Mediterranean.', priceLabel: 'Price on request',
  },
]
</script>

<template>
  <div class="home-page">
    <SiteHeader />
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">All journeys</p>
        <h1 id="home-title">Journeys<br />across Egypt</h1>
        <span class="heading-rule" aria-hidden="true"></span>
        <p>Timeless places. Personal pace.</p>
        <p>Handpicked private journeys, locally planned<br class="desktop-only" /> and paid at the start of your trip.</p>
      </div>
      <div class="hero-photo" role="img" aria-label="A felucca sailing on the Nile below desert cliffs at sunset"></div>
      <HeroRouteLine />
    </section>

    <main>
      <section class="filter-section page-container" aria-label="Journey filters">
        <form class="filter-bar" @submit.prevent>
          <label>
            <span>Destination</span>
            <select><option>All destinations</option><option>Cairo</option><option>Luxor</option><option>Aswan</option></select>
          </label>
          <label>
            <span>Duration</span>
            <select><option>Any duration</option><option>1 day</option><option>2–3 days</option><option>4+ days</option></select>
          </label>
          <label>
            <span>Journey type</span>
            <select><option>All types</option><option>Private tour</option><option>Private cruise</option></select>
          </label>
          <label>
            <span>Sort by</span>
            <select><option>Recommended</option><option>Duration</option><option>Price</option></select>
          </label>
          <button type="reset" class="button button-secondary">Clear filters</button>
        </form>
      </section>

      <section id="journeys" class="journeys-section page-container" aria-labelledby="journeys-title">
        <h2 id="journeys-title">Available journeys</h2>
        <div class="journey-grid">
          <JourneyCard v-for="journey in journeys" :key="journey.title" :journey="journey" />
        </div>

        <nav class="pagination" aria-label="Journey pages">
          <button type="button" aria-label="Previous page"><AppIcon name="chevron-left" :size="17" /></button>
          <button v-for="number in [1, 2, 3]" :key="number" type="button" :class="{ active: page === number }" :aria-current="page === number ? 'page' : undefined" @click="page = number">{{ number }}</button>
          <span aria-hidden="true">…</span>
          <button type="button" aria-label="Next page"><AppIcon name="chevron-right" :size="17" /></button>
        </nav>
      </section>
      <TransferBanner />
    </main>
    <SiteFooter />
  </div>
</template>
