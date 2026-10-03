<script setup>
definePageMeta({"name": "journeys", "title": "All Journeys \u2014 TheVTravel"})
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import JourneyCard from '~/components/JourneyCard.vue'
import { useRoute } from '#imports'
import NeedHelpCTA from '~/components/NeedHelpCTA.vue'
import { destinations, interests, journeys } from '~/data/journeys'

const perPage = 9
const route = useRoute()
function readState() { try { return JSON.parse(sessionStorage.getItem('journeys-browse') || '{}') } catch { return {} } }
let saved = {}
let restoring = false
const destination = ref(destinations.includes(route.query.destination) ? route.query.destination : saved.destination || 'All destinations')
const interest = ref(interests.includes(saved.interest) ? saved.interest : 'All')
const sort = ref(['recommended', 'price-asc', 'price-desc'].includes(saved.sort) ? saved.sort : 'recommended')
const page = ref(route.query.destination ? 1 : Math.max(1, Number(saved.page) || 1))
const view = ref(saved.view === 'list' ? 'list' : 'grid')
let mobileQuery
const mobileLayout = ref(false)
const effectiveView = computed(() => mobileLayout.value ? 'grid' : view.value)
function updateMobileLayout(event) { mobileLayout.value = event.matches }
const loading = ref(false)
const sentinel = ref(null)
let observer, timer
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
const visibleJourneys = computed(() => filteredJourneys.value.slice(0, page.value * perPage))
const hasMore = computed(() => page.value < totalPages.value)
function saveState() {
  if (restoring || !import.meta.client) return
  try { sessionStorage.setItem('journeys-browse', JSON.stringify({ destination: destination.value, interest: interest.value, sort: sort.value, page: page.value, view: view.value, scroll: window.scrollY })) } catch {}
}
function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  // Local demo batches; replace with the paginated API adapter when available.
  timer = window.setTimeout(async () => {
    page.value++
    loading.value = false
    saveState()
    await nextTick()
    if (hasMore.value && sentinel.value?.getBoundingClientRect().top < window.innerHeight + 240) loadMore()
  }, 180)
}
watch([destination, interest, sort], () => {
  if (restoring) return
  clearTimeout(timer)
  loading.value = false
  page.value = 1
  saveState()
})
watch([page, view], saveState)
function setView(nextView) { view.value = nextView }
onMounted(async () => {
  saved = readState()
  restoring = true
  if (!route.query.destination) destination.value = destinations.includes(saved.destination) ? saved.destination : 'All destinations'
  interest.value = interests.includes(saved.interest) ? saved.interest : 'All'
  sort.value = ['recommended', 'price-asc', 'price-desc'].includes(saved.sort) ? saved.sort : 'recommended'
  page.value = route.query.destination ? 1 : Math.min(totalPages.value, Math.max(1, Number(saved.page) || 1))
  view.value = saved.view === 'list' ? 'list' : 'grid'
  mobileQuery = window.matchMedia('(max-width: 767px)')
  mobileLayout.value = mobileQuery.matches
  mobileQuery.addEventListener('change', updateMobileLayout)
  await nextTick()
  restoring = false
  if (!route.query.destination && saved.scroll) window.scrollTo({ top: saved.scroll, behavior: 'instant' })
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) loadMore() }, { rootMargin: '240px' })
    if (sentinel.value) observer.observe(sentinel.value)
  }
  window.addEventListener('scroll', saveState, { passive: true })
})
onBeforeUnmount(() => { mobileQuery?.removeEventListener('change', updateMobileLayout); saveState(); observer?.disconnect(); clearTimeout(timer); window.removeEventListener('scroll', saveState) })
</script>

<template>
  <div class="journeys-page">
    <SiteHeader />

    <main>
      <section class="journeys-hero" aria-labelledby="journeys-page-title">
        <div class="journeys-hero-copy">
          <nav class="journeys-breadcrumb" :aria-label='$t("Breadcrumb")'>
            <NuxtLink to="/">{{ $t("Home") }}</NuxtLink><AppIcon name="chevron-right" :size="13" /><span aria-current="page">{{ $t("Journeys") }}</span>
          </nav>
          <h1 id="journeys-page-title">{{ $t("All Journeys") }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>{{ $t("Handpicked private experiences across Egypt.") }}<br />{{ $t("You choose the date. We take care of the rest.") }}</p>
        </div>
        <div class="journeys-hero-photo" role="img" :aria-label='$t("A felucca sailing past an ancient Nile temple at sunset")'></div>
        <svg class="journeys-hero-route" viewBox="0 0 590 110" fill="none" aria-hidden="true">
          <path d="M2 94c79-1 127-4 181-14 52-10 91-1 133-31 41-30 67-40 105-28 30 10 57 10 83-3" />
          <g transform="translate(315 50)"><path d="M0-9a9 9 0 0 0-9 9c0 7 9 16 9 16S9 7 9 0a9 9 0 0 0-9-9Z" /><circle cy="0" r="3" /></g>
        </svg>
      </section>

      <section class="journeys-controls page-container" :aria-label='$t("Journey filters")'>
        <label class="destination-control">
          <span>{{ $t("Destination") }}</span>
          <span class="select-shell"><AppIcon name="pin" :size="17" /><select v-model="destination"><option v-for="option in destinations" :key="option" :value="option">{{ $t(option) }}</option></select></span>
        </label>

        <fieldset class="interest-filters">
          <legend>{{ $t("Interests") }}</legend>
          <div class="interest-scroll">
            <button
              v-for="option in interests"
              :key="option"
              type="button"
              :class="{ active: interest === option }"
              :aria-pressed="interest === option"
              @click="interest = option"
            >
              <AppIcon v-if="option !== 'All'" :name="interestIcons[option]" :size="18" />{{ $t(option) }}
            </button>
          </div>
        </fieldset>
      </section>

      <section class="journeys-results page-container" aria-labelledby="results-count" tabindex="-1">
        <header class="results-header">
          <p id="results-count" aria-live="polite">{{ $t(filteredJourneys.length) }} {{ $t(filteredJourneys.length === 1 ? 'journey' : 'journeys') }} {{ $t("found") }}</p>
          <div class="results-actions">
            <label>{{ $t("Sort by:") }}
              <select v-model="sort" :aria-label='$t("Sort journeys")'>
                <option value="recommended">{{ $t("Recommended") }}</option>
                <option value="price-asc">{{ $t("Price: Low to High") }}</option>
                <option value="price-desc">{{ $t("Price: High to Low") }}</option>
              </select>
            </label>
            <div v-if="!mobileLayout" class="view-controls" :aria-label='$t("Journey layout")'>
              <button type="button" :class="{ active: view === 'grid' }" :aria-pressed="view === 'grid'" :aria-label='$t("Grid view")' @click="setView('grid')"><AppIcon name="grid" :size="20" /></button>
              <button type="button" :class="{ active: view === 'list' }" :aria-pressed="view === 'list'" :aria-label='$t("List view")' @click="setView('list')"><AppIcon name="list" :size="20" /></button>
            </div>
          </div>
        </header>

        <div v-if="visibleJourneys.length" class="listing-grid" :class="`listing-grid--${effectiveView}`">
          <JourneyCard
            v-for="journey in visibleJourneys"
            :id="`journey-${journey.id}`"
            :key="journey.id"
            :journey="journey"
            :layout="effectiveView"
          />
        </div>
        <div v-else class="journeys-empty">
          <h2>{{ $t("No journeys match these filters") }}</h2>
          <p>{{ $t("Try another destination or interest.") }}</p>
          <button class="button button-secondary" type="button" @click="destination = 'All destinations'; interest = 'All'">{{ $t("Clear filters") }}</button>
        </div>

        <div ref="sentinel" class="journeys-load-more" :aria-busy="loading">
          <p role="status" aria-live="polite">{{ $t(loading ? 'Loading more journeys…' : hasMore ? '' : 'You’ve seen all matching journeys.') }}</p>
          <div v-if="loading" class="journey-loading-skeleton" aria-hidden="true"></div>
          <button v-if="hasMore" type="button" class="button button-secondary" :disabled="loading" @click="loadMore">{{ $t("Load more journeys") }}</button>
        </div>
      </section>

      <NeedHelpCTA floating />
    </main>

    <SiteFooter variant="booking" />
  </div>
</template>
