<script setup>
import { computed, ref, watch } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import AppIcon from '../components/AppIcon.vue'
import JourneyListingCard from '../components/JourneyListingCard.vue'
import NeedHelpCTA from '../components/NeedHelpCTA.vue'
import { destinations, interests, journeys } from '../data/journeys'

const perPage = 9
const destination = ref('All destinations')
const interest = ref('All')
const sort = ref('recommended')
const page = ref(1)
const view = ref(sessionStorage.getItem('journeys-view') === 'list' ? 'list' : 'grid')

const interestIcons = {
  'Culture & History': 'landmark',
  'Nile & Cruising': 'sailboat',
  'Nature & Adventure': 'mountain',
  'Red Sea & Snorkeling': 'snorkel',
  Relaxation: 'relax',
  'Family Experiences': 'people',
}

const filteredJourneys = computed(() => {
  const filtered = journeys.filter((journey) => {
    const destinationMatch = destination.value === 'All destinations' || journey.destination === destination.value
    const interestMatch = interest.value === 'All' || journey.interest === interest.value
    return destinationMatch && interestMatch
  })

  if (sort.value === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
  if (sort.value === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
  return filtered
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredJourneys.value.length / perPage)))
const visibleJourneys = computed(() => filteredJourneys.value.slice((page.value - 1) * perPage, page.value * perPage))

const pageItems = computed(() => {
  const count = totalPages.value
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (page.value <= 4) return [1, 2, 3, 4, 'ellipsis', count]
  if (page.value >= count - 3) return [1, 'ellipsis', count - 3, count - 2, count - 1, count]
  return [1, 'ellipsis-start', page.value - 1, page.value, page.value + 1, 'ellipsis-end', count]
})

watch([destination, interest], () => { page.value = 1 })
watch(sort, () => { page.value = 1 })

function setView(nextView) {
  view.value = nextView
  sessionStorage.setItem('journeys-view', nextView)
}

function goToPage(nextPage) {
  page.value = Math.min(Math.max(nextPage, 1), totalPages.value)
  document.querySelector('.journeys-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="journeys-page">
    <SiteHeader />

    <main>
      <section class="journeys-hero" aria-labelledby="journeys-page-title">
        <div class="journeys-hero-copy">
          <nav class="journeys-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a><AppIcon name="chevron-right" :size="13" /><span aria-current="page">Journeys</span>
          </nav>
          <h1 id="journeys-page-title">All Journeys</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>Handpicked private experiences across Egypt.<br />You choose the date. We take care of the rest.</p>
        </div>
        <div class="journeys-hero-photo" role="img" aria-label="A felucca sailing past an ancient Nile temple at sunset"></div>
        <svg class="journeys-hero-route" viewBox="0 0 590 110" fill="none" aria-hidden="true">
          <path d="M2 94c79-1 127-4 181-14 52-10 91-1 133-31 41-30 67-40 105-28 30 10 57 10 83-3" />
          <g transform="translate(315 50)"><path d="M0-9a9 9 0 0 0-9 9c0 7 9 16 9 16S9 7 9 0a9 9 0 0 0-9-9Z" /><circle cy="0" r="3" /></g>
        </svg>
      </section>

      <section class="journeys-controls page-container" aria-label="Journey filters">
        <label class="destination-control">
          <span>Destination</span>
          <span class="select-shell"><AppIcon name="pin" :size="17" /><select v-model="destination"><option v-for="option in destinations" :key="option">{{ option }}</option></select></span>
        </label>

        <fieldset class="interest-filters">
          <legend>Interests</legend>
          <div class="interest-scroll">
            <button
              v-for="option in interests"
              :key="option"
              type="button"
              :class="{ active: interest === option }"
              :aria-pressed="interest === option"
              @click="interest = option"
            >
              <AppIcon v-if="option !== 'All'" :name="interestIcons[option]" :size="18" />{{ option }}
            </button>
          </div>
        </fieldset>
      </section>

      <section class="journeys-results page-container" aria-labelledby="results-count" tabindex="-1">
        <header class="results-header">
          <p id="results-count" aria-live="polite">{{ filteredJourneys.length }} {{ filteredJourneys.length === 1 ? 'journey' : 'journeys' }} found</p>
          <div class="results-actions">
            <label>Sort by:
              <select v-model="sort" aria-label="Sort journeys">
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </label>
            <div class="view-controls" aria-label="Journey layout">
              <button type="button" :class="{ active: view === 'grid' }" :aria-pressed="view === 'grid'" aria-label="Grid view" @click="setView('grid')"><AppIcon name="grid" :size="20" /></button>
              <button type="button" :class="{ active: view === 'list' }" :aria-pressed="view === 'list'" aria-label="List view" @click="setView('list')"><AppIcon name="list" :size="20" /></button>
            </div>
          </div>
        </header>

        <div v-if="visibleJourneys.length" class="listing-grid" :class="`listing-grid--${view}`">
          <JourneyListingCard
            v-for="journey in visibleJourneys"
            :id="`journey-${journey.id}`"
            :key="journey.id"
            :journey="journey"
            :layout="view"
          />
        </div>
        <div v-else class="journeys-empty">
          <h2>No journeys match these filters</h2>
          <p>Try another destination or interest.</p>
          <button class="button button-secondary" type="button" @click="destination = 'All destinations'; interest = 'All'">Clear filters</button>
        </div>

        <nav v-if="totalPages > 1" class="listing-pagination" aria-label="Journey pages">
          <button type="button" :disabled="page === 1" aria-label="Previous page" @click="goToPage(page - 1)"><AppIcon name="chevron-left" :size="17" /></button>
          <template v-for="item in pageItems" :key="item">
            <span v-if="String(item).startsWith('ellipsis')" aria-hidden="true">…</span>
            <button v-else type="button" :class="{ active: page === item }" :aria-current="page === item ? 'page' : undefined" @click="goToPage(item)">{{ item }}</button>
          </template>
          <button type="button" :disabled="page === totalPages" aria-label="Next page" @click="goToPage(page + 1)"><AppIcon name="chevron-right" :size="17" /></button>
        </nav>
      </section>

      <NeedHelpCTA floating />
    </main>

    <SiteFooter variant="booking" />
  </div>
</template>
