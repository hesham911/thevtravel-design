<script setup>
// One of the transfer form's two location inputs, with address search.
//
// The step used to be a plain text box and a button that opened the map. A
// guest who knew the name of their hotel had nowhere to type it and get a
// real place back: the search existed only inside the map picker, and the
// picker itself could not resolve anything because no geocoding provider was
// configured. Both halves are fixed — the provider is now proxied by the API
// (GET {apiBaseUrl}/locations/search) and this field searches as the guest
// types, so the map is an option rather than the only route to a location.
//
// Pickup and drop-off each render one of these, so they are independent by
// construction: separate state, separate request, separate abort. One
// failing or finding nothing says nothing about the other.
//
// Typing is always allowed to win. A guest may ignore the suggestions
// entirely and submit the address they typed — the API accepts an address
// with no coordinates — and editing the text after choosing a result clears
// the coordinates it came with, so a stored point can never contradict the
// address printed beside it.
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from '../AppIcon.vue'

const props = defineProps({
  field: { type: String, required: true, validator: value => ['pickup', 'dropoff'].includes(value) },
  label: { type: String, required: true },
  address: { type: String, default: '' },
  // Present once a point has been chosen, from a result or from the map.
  latitude: { type: Number, default: null },
  error: { type: String, default: '' },
  // The adapter the flow hands down: `{ searchAvailable, search() }`.
  service: { type: Object, required: true },
  language: { type: String, default: 'en' },
})

const emit = defineEmits(['update:address', 'select', 'open-map'])

const id = useId()
const query = ref(props.address)
const suggestions = ref([])
// idle | loading | ready | empty | failed | short
const state = ref('idle')
const open = ref(false)
const activeIndex = ref(-1)

let debounceTimer, abortController, version = 0, disposed = false

const available = computed(() => Boolean(props.service?.searchAvailable))
const listboxVisible = computed(() => open.value && suggestions.value.length > 0)

// Three characters is the provider's own floor, and the API rejects less, so
// a shorter query is never sent.
const MINIMUM_QUERY = 3
const DEBOUNCE_MS = 350

function cancel() {
  clearTimeout(debounceTimer)
  abortController?.abort()
  return ++version
}

function reset() {
  suggestions.value = []
  activeIndex.value = -1
  state.value = 'idle'
  open.value = false
}

// The form owns the address; this input is a view of it. Every keystroke
// both reports the new text and invalidates the coordinates the old text
// came with, which is what keeps a pin from outliving the address it named.
function onInput(value) {
  query.value = value
  emit('update:address', value)
  schedule(value)
}

function schedule(value) {
  const term = value.trim()
  const current = cancel()

  if (!available.value) {
    reset()
    return
  }

  if (term.length < MINIMUM_QUERY) {
    suggestions.value = []
    activeIndex.value = -1
    // Only worth saying once they have started typing; an untouched field
    // is not a mistake.
    state.value = term.length > 0 ? 'short' : 'idle'
    open.value = false
    return
  }

  state.value = 'loading'
  open.value = true
  debounceTimer = setTimeout(() => run(term, current), DEBOUNCE_MS)
}

async function run(term, current) {
  abortController = new AbortController()
  // A lookup nobody is waiting for any more must not hold the field in its
  // loading state for ever.
  const timeout = setTimeout(() => abortController.abort(), 10000)

  try {
    const results = await props.service.search(term, { signal: abortController.signal, language: props.language })

    if (disposed || current !== version) {
      return
    }

    suggestions.value = results
    state.value = results.length ? 'ready' : 'empty'
    activeIndex.value = -1
    open.value = true
  } catch {
    // Never silent and never disguised as "no results": a guest told their
    // hotel does not exist would stop looking for it.
    if (!disposed && current === version) {
      suggestions.value = []
      state.value = 'failed'
      open.value = true
    }
  } finally {
    clearTimeout(timeout)
  }
}

function choose(location) {
  cancel()
  query.value = location.address
  reset()
  emit('select', location)
}

function keys(event) {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    event.stopPropagation()
    open.value = false

    return
  }

  if (event.key === 'Enter') {
    // Enter picks the highlighted result; with none highlighted it must fall
    // through to the form, where it continues to the next step.
    if (listboxVisible.value && activeIndex.value >= 0) {
      event.preventDefault()
      choose(suggestions.value[activeIndex.value])
    }

    return
  }

  if (!['ArrowDown', 'ArrowUp'].includes(event.key) || suggestions.value.length === 0) {
    return
  }

  event.preventDefault()
  open.value = true

  const last = suggestions.value.length - 1
  const step = event.key === 'ArrowDown' ? 1 : -1

  activeIndex.value = activeIndex.value < 0
    ? (step === 1 ? 0 : last)
    : (activeIndex.value + step + suggestions.value.length) % suggestions.value.length
}

// The form may replace the address from elsewhere — the map picker's confirm,
// or the reset after a successful submission — and the input has to follow.
watch(() => props.address, (value) => {
  if (value !== query.value) {
    query.value = value ?? ''
    cancel()
    reset()
  }
})

// A different language is a different answer from the provider, so the
// results in hand are no longer the right ones.
watch(() => props.language, () => {
  cancel()
  reset()
})

onBeforeUnmount(() => {
  disposed = true
  cancel()
})
</script>

<template>
  <div class="jb-field tf-location-field" @focusout="!$event.currentTarget.contains($event.relatedTarget) && (open = false)">
    <label :for="`tf-${field}`">{{ $t(label) }}</label>
    <div class="tf-location">
      <input
        :id="`tf-${field}`"
        :value="query"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        autocomplete="off"
        :aria-expanded="listboxVisible"
        :aria-controls="`${id}-results`"
        :aria-activedescendant="listboxVisible && activeIndex >= 0 ? `${id}-result-${activeIndex}` : undefined"
        :aria-describedby="error ? `tf-${field}-error` : `${id}-status`"
        :placeholder="$t(latitude != null && !query ? 'Address unavailable — enter an address if known' : 'Address, hotel or landmark')"
        :aria-invalid="!!error"
        @input="onInput($event.target.value)"
        @keydown="keys"
        @focus="suggestions.length && (open = true)"
      />
      <button type="button" :aria-label="$t(`Select ${label.toLowerCase()} on map`)" @click="emit('open-map')">
        <AppIcon name="map" :size="22" />
      </button>
    </div>
    <ul v-show="listboxVisible" :id="`${id}-results`" class="tf-location-results" role="listbox" :aria-label="$t(`${label} suggestions`)">
      <li
        v-for="(location, index) in suggestions"
        :id="`${id}-result-${index}`"
        :key="`${location.latitude}-${location.longitude}-${location.address}`"
        role="option"
        :aria-selected="activeIndex === index"
        @pointerdown.prevent="choose(location)"
      >{{ location.address }}</li>
    </ul>
    <small v-if="error" :id="`tf-${field}-error`" class="jb-error">{{ $t(error) }}</small>
    <small v-else :id="`${id}-status`" class="tf-location-status" aria-live="polite">
      <template v-if="!available">{{ $t("Address search is unavailable. Type the address, or choose the location on the map.") }}</template>
      <template v-else-if="state === 'loading'">{{ $t("Searching…") }}</template>
      <template v-else-if="state === 'short'">{{ $t("Keep typing to search for a place.") }}</template>
      <template v-else-if="state === 'empty'">{{ $t("No places found. Try a more specific address, or choose it on the map.") }}</template>
      <template v-else-if="state === 'failed'">{{ $t("Address search is unavailable right now. Type the address, or choose the location on the map.") }}</template>
      <template v-else-if="latitude != null">{{ $t("Exact location saved.") }}</template>
    </small>
  </div>
</template>

<style scoped>
.tf-location-field { position: relative; }
/* The same list the map picker's own search draws, so choosing a place looks
   the same wherever a guest does it. */
.tf-location-results { list-style: none; padding: 0; margin: 4px 0 0; border: 1px solid var(--line); border-radius: 6px; max-height: 220px; overflow-y: auto; background: var(--field-bg); color: var(--text); position: absolute; left: 0; right: 0; top: 100%; z-index: 5; }
.tf-location-results li { font-weight: 400; font-size: 14px; line-height: 1.5; padding: 12px 14px; cursor: pointer; border-bottom: 1px solid var(--line); }
.tf-location-results li:last-child { border-bottom: 0; }
.tf-location-results li:hover,
.tf-location-results li[aria-selected='true'] { background: var(--surface-hover); }
.tf-location-status { font-size: 12px; font-weight: 400; line-height: 1.6; color: var(--muted); }
</style>
