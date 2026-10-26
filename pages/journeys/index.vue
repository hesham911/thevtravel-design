<script setup>
definePageMeta({"name": "journeys", "title": "All Journeys — TheVTravel"})
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import JourneyCard from '~/components/JourneyCard.vue'
import { useRoute, useRuntimeConfig, useAsyncData, setResponseStatus } from '#imports'
import NeedHelpCTA from '~/components/NeedHelpCTA.vue'
import { useI18n } from '~/utils/i18n'
import { fetchJourneys, fetchJourneyFilters, toCard } from '~/services/journeys'
import { fetchPageSections, textOr } from '~/services/pageContent'
import { destinations as demoDestinations, interests as demoInterests, journeys as demoJourneys } from '~/data/journeys'

const perPage = 9
const route = useRoute()
const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()
const api = runtime.apiBaseUrl

// ── Hero ─────────────────────────────────────────────────────────────────────
// Managed in the admin under Website Content → Journeys Page. The API resolves
// every field to the requested language server-side, so a missing translation
// arrives as the English copy rather than as an empty hero.
const { data: sections } = await useAsyncData(
  'journeys-page-sections',
  () => fetchPageSections(api, 'journeys', locale.value),
  { watch: [locale], default: () => null },
)

const hero = computed(() => {
  const section = sections.value?.hero
  const body = typeof section?.body === 'string' ? section.body.split('\n').map(line => line.trim()).filter(Boolean) : []
  return {
    title: textOr(section?.title, translate('All Journeys')),
    lines: body.length ? body : [translate('Handpicked private experiences across Egypt.'), translate('You choose the date. We take care of the rest.')],
    photoAlt: textOr(section?.data?.image_alt, translate('A felucca sailing past an ancient Nile temple at sunset')),
    // Unset, each theme keeps its own built-in photo (see styles.css); an
    // image uploaded in the admin replaces both.
    image: section?.media?.image?.url || null,
  }
})

const heroPhotoStyle = computed(() => hero.value.image ? { '--hero-image': `url(${JSON.stringify(hero.value.image)})` } : null)

// ── Filter vocabulary ────────────────────────────────────────────────────────
// Matched on slugs, never on translated names: a filter a visitor picked in
// French still resolves after the name is edited, and ?destination=luxor means
// the same thing in every language.
const { data: filters } = await useAsyncData(
  'journeys-filters',
  () => fetchJourneyFilters(api, locale.value),
  { watch: [locale], default: () => null },
)

const demoMode = computed(() => filters.value?.status !== 'ok')

// The fixture interests have no icon of their own; the live ones carry theirs.
const demoInterestIcons = {
  'Culture & History': 'landmark',
  'Nile & Cruising': 'sailboat',
  'Nature & Adventure': 'mountain',
  'Red Sea & Snorkeling': 'snorkel',
  Relaxation: 'relax',
  'Family Experiences': 'people',
}

const destinationOptions = computed(() => {
  const all = { slug: '', name: translate('All destinations') }
  if (filters.value?.status === 'ok') return [all, ...filters.value.destinations.map(d => ({ slug: d.slug, name: d.name }))]
  // Demo mode keeps the fixture names as their own identifiers.
  return [all, ...demoDestinations.filter(name => name !== 'All destinations').map(name => ({ slug: name, name: translate(name) }))]
})

const interestOptions = computed(() => {
  const all = { slug: '', name: translate('All'), icon: null }
  if (filters.value?.status === 'ok') return [all, ...filters.value.interests.map(i => ({ slug: i.slug, name: i.name, icon: i.icon }))]
  return [all, ...demoInterests.filter(name => name !== 'All').map(name => ({ slug: name, name: translate(name), icon: demoInterestIcons[name] }))]
})

// ── Browse state ─────────────────────────────────────────────────────────────
function readState() { try { return JSON.parse(sessionStorage.getItem('journeys-browse') || '{}') } catch { return {} } }
let saved = {}
let restoring = false
const destination = ref(typeof route.query.destination === 'string' ? route.query.destination : '')
const interest = ref('')
const sort = ref('recommended')
const page = ref(1)
const view = ref('grid')
let mobileQuery
const mobileLayout = ref(false)
const effectiveView = computed(() => mobileLayout.value ? 'grid' : view.value)
function updateMobileLayout(event) { mobileLayout.value = event.matches }
const loading = ref(false)
const sentinel = ref(null)
let observer, timer

// ── Results ──────────────────────────────────────────────────────────────────
// Page 1 is fetched on the server and refetched whenever the filters, the sort
// or the language change. Further pages are appended client-side, so "load
// more" never re-renders what is already on screen.
const extraPages = ref([])

const { data: firstPage, pending, refresh } = await useAsyncData(
  'journeys-results',
  () => fetchJourneys(api, {
    destination: destination.value || undefined,
    interest: interest.value || undefined,
    sort: sort.value,
    page: 1,
    perPage,
    language: locale.value,
  }),
  { watch: [destination, interest, sort, locale], default: () => null },
)

watch(firstPage, () => { extraPages.value = [] })

// The fixtures, filtered and sorted in the browser exactly as before — used
// only while no API base URL is configured (deliberate demo mode).
const demoFiltered = computed(() => {
  const filtered = demoJourneys.filter(journey => {
    const destinationMatch = !destination.value || journey.destination === destination.value
    const interestMatch = !interest.value || journey.interest === interest.value
    return destinationMatch && interestMatch
  })
  if (sort.value === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
  if (sort.value === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
  return filtered
})

const failed = computed(() => firstPage.value?.status === 'error')

// A catalogue the API could not serve is a temporary fault, not a page with
// nothing on it: 503 tells a crawler to come back rather than to index an
// error panel as this page's content.
if (import.meta.server && failed.value) setResponseStatus(503)

const visibleJourneys = computed(() => {
  if (demoMode.value && firstPage.value?.status !== 'ok') return demoFiltered.value.slice(0, page.value * perPage)
  if (firstPage.value?.status !== 'ok') return []
  return [...firstPage.value.journeys, ...extraPages.value.flat()]
})

const totalCount = computed(() => {
  if (demoMode.value && firstPage.value?.status !== 'ok') return demoFiltered.value.length
  return firstPage.value?.meta?.total ?? 0
})

const lastPage = computed(() => {
  if (demoMode.value && firstPage.value?.status !== 'ok') return Math.max(1, Math.ceil(demoFiltered.value.length / perPage))
  return firstPage.value?.meta?.last_page ?? 1
})

const hasMore = computed(() => !failed.value && page.value < lastPage.value)

function saveState() {
  if (restoring || !import.meta.client) return
  try { sessionStorage.setItem('journeys-browse', JSON.stringify({ destination: destination.value, interest: interest.value, sort: sort.value, view: view.value, scroll: window.scrollY })) } catch {}
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  const next = page.value + 1

  if (demoMode.value && firstPage.value?.status !== 'ok') {
    timer = window.setTimeout(async () => {
      page.value = next
      loading.value = false
      saveState()
      await nextTick()
      if (hasMore.value && sentinel.value?.getBoundingClientRect().top < window.innerHeight + 240) loadMore()
    }, 180)
    return
  }

  const result = await fetchJourneys(api, {
    destination: destination.value || undefined,
    interest: interest.value || undefined,
    sort: sort.value,
    page: next,
    perPage,
    language: locale.value,
  })

  if (result.status === 'ok') {
    extraPages.value = [...extraPages.value, result.journeys]
    page.value = next
  }

  loading.value = false
  saveState()
  await nextTick()
  if (hasMore.value && sentinel.value?.getBoundingClientRect().top < window.innerHeight + 240) loadMore()
}

watch([destination, interest, sort, locale], () => {
  if (restoring) return
  clearTimeout(timer)
  loading.value = false
  page.value = 1
  extraPages.value = []
  saveState()
})
watch(view, saveState)
function setView(nextView) { view.value = nextView }

function clearFilters() { destination.value = ''; interest.value = '' }

onMounted(async () => {
  saved = readState()
  restoring = true
  const knownDestination = slug => destinationOptions.value.some(option => option.slug === slug)
  const knownInterest = slug => interestOptions.value.some(option => option.slug === slug)
  if (typeof route.query.destination === 'string' && knownDestination(route.query.destination)) destination.value = route.query.destination
  else if (!route.query.destination) destination.value = knownDestination(saved.destination) ? saved.destination : ''
  interest.value = knownInterest(saved.interest) ? saved.interest : ''
  sort.value = ['recommended', 'price-asc', 'price-desc'].includes(saved.sort) ? saved.sort : 'recommended'
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
          <h1 id="journeys-page-title">{{ hero.title }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p><template v-for="(line, index) in hero.lines" :key="index"><br v-if="index" />{{ line }}</template></p>
        </div>
        <div class="journeys-hero-photo" role="img" :aria-label="hero.photoAlt" :style="heroPhotoStyle"></div>
        <svg class="journeys-hero-route" viewBox="0 0 590 110" fill="none" aria-hidden="true">
          <path d="M2 94c79-1 127-4 181-14 52-10 91-1 133-31 41-30 67-40 105-28 30 10 57 10 83-3" />
          <g transform="translate(315 50)"><path d="M0-9a9 9 0 0 0-9 9c0 7 9 16 9 16S9 7 9 0a9 9 0 0 0-9-9Z" /><circle cy="0" r="3" /></g>
        </svg>
      </section>

      <section class="journeys-controls page-container" :aria-label='$t("Journey filters")'>
        <label class="destination-control">
          <span>{{ $t("Destination") }}</span>
          <span class="select-shell"><AppIcon name="pin" :size="17" /><select v-model="destination"><option v-for="option in destinationOptions" :key="option.slug" :value="option.slug">{{ option.name }}</option></select></span>
        </label>

        <fieldset class="interest-filters">
          <legend>{{ $t("Interests") }}</legend>
          <div class="interest-scroll">
            <button
              v-for="option in interestOptions"
              :key="option.slug"
              type="button"
              :class="{ active: interest === option.slug }"
              :aria-pressed="interest === option.slug"
              @click="interest = option.slug"
            >
              <AppIcon v-if="option.icon" :name="option.icon" :size="18" />{{ option.name }}
            </button>
          </div>
        </fieldset>
      </section>

      <section class="journeys-results page-container" aria-labelledby="results-count" tabindex="-1">
        <header class="results-header">
          <p id="results-count" aria-live="polite">{{ $t(totalCount) }} {{ $t(totalCount === 1 ? 'journey' : 'journeys') }} {{ $t("found") }}</p>
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

        <div v-if="failed" class="journeys-empty" role="alert">
          <h2>{{ $t("Journeys are unavailable right now") }}</h2>
          <p>{{ $t("We could not load the journeys. Please try again in a moment.") }}</p>
          <button class="button button-secondary" type="button" @click="refresh()">{{ $t("Try again") }}</button>
        </div>

        <div v-else-if="visibleJourneys.length" class="listing-grid" :class="`listing-grid--${effectiveView}`">
          <JourneyCard
            v-for="journey in visibleJourneys"
            :id="`journey-${journey.id}`"
            :key="journey.id"
            :journey="journey"
            :layout="effectiveView"
          />
        </div>
        <div v-else-if="!pending" class="journeys-empty">
          <h2>{{ $t("No journeys match these filters") }}</h2>
          <p>{{ $t("Try another destination or interest.") }}</p>
          <button class="button button-secondary" type="button" @click="clearFilters">{{ $t("Clear filters") }}</button>
        </div>

        <div v-if="!failed" ref="sentinel" class="journeys-load-more" :aria-busy="loading">
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
