<script setup>
import { computed, onMounted, onBeforeUnmount, ref, useId, watch } from 'vue'
import L from 'leaflet'
import { addLocalizedBasemap } from '~/services/leafletBasemap.client'
import { useI18n } from '~/utils/i18n'
const { locale, translate } = useI18n()
import AppIcon from '../AppIcon.vue'
import { createLocationSearchService, useLocationSearchService, normalizeLocation } from '~/services/locationSearchService'
const props = defineProps({
  latitude: Number,
  longitude: Number,
  address: String,
  locationType: { type: String, default: 'pickup', validator: value => ['pickup', 'dropoff'].includes(value) },
  reverseGeocode: { type: Function, default: null },
  searchLocations: { type: Function, default: null },
})
const locationSearchService = useLocationSearchService()
const mapStyleUrl = useRuntimeConfig().public.mapStyleUrl
const emit = defineEmits(['confirm'])
const service = props.reverseGeocode || props.searchLocations ? createLocationSearchService({
  search: props.searchLocations || (locationSearchService.searchAvailable ? locationSearchService.search : undefined),
  reverseGeocode: props.reverseGeocode || (locationSearchService.reverseAvailable ? locationSearchService.reverseGeocode : undefined),
}) : locationSearchService
const container = ref(null), searchInput = ref(null), query = ref(''), suggestions = ref([])
const searchState = ref('idle'), activeSuggestion = ref(-1), suggestionsOpen = ref(false)
const locating = ref(false), locationError = ref('')
const id = useId()
const initialAddress = props.latitude != null && props.longitude != null ? props.address || '' : ''
const selectedLocation = ref({ address: initialAddress, latitude: props.latitude ?? 30.0444, longitude: props.longitude ?? 31.2357 })
const lookupState = ref(initialAddress ? 'resolved' : 'unavailable')
const canConfirm = computed(() => !locating.value && lookupState.value === 'resolved' && !!normalizeLocation(selectedLocation.value))
let map, marker, observer, basemap, lookupTimer, lookupVersion = 0, searchVersion = 0, geoVersion = 0, disposed = false
let lookupAbort, searchAbort
function cancelLookup() { clearTimeout(lookupTimer); lookupAbort?.abort(); return ++lookupVersion }
function cancelSearch() { searchAbort?.abort(); return ++searchVersion }
function cancelGeolocation() { geoVersion++; locating.value = false }
async function resolveAddress(version) {
  if (!service.reverseAvailable) { lookupState.value = 'unavailable'; return }
  lookupState.value = 'loading'
  const controller = new AbortController(); lookupAbort = controller
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const { latitude, longitude } = selectedLocation.value
    const address = await service.reverseGeocode({ latitude, longitude }, { signal: controller.signal, language: locale.value })
    if (disposed || version !== lookupVersion) return
    selectedLocation.value = { ...selectedLocation.value, address }
    lookupState.value = address ? 'resolved' : 'unavailable'
  } catch {
    if (!disposed && version === lookupVersion) lookupState.value = 'failed'
  } finally { clearTimeout(timeout) }
}
// Every selection path uses this state and invalidates older address lookups.
function selectLocation(location, { center = false, debounce = false } = {}) {
  const version = cancelLookup()
  selectedLocation.value = { address: location.address || '', latitude: location.latitude, longitude: location.longitude }
  marker.setLatLng([location.latitude, location.longitude])
  if (center) map.setView([location.latitude, location.longitude], 16)
  locationError.value = ''
  if (selectedLocation.value.address) { lookupState.value = 'resolved'; return }
  lookupState.value = service.reverseAvailable ? 'loading' : 'unavailable'
  if (debounce) lookupTimer = setTimeout(() => resolveAddress(version), 300)
  else resolveAddress(version)
}
function moved(latlng) {
  cancelGeolocation()
  suggestionsOpen.value = false
  selectLocation({ latitude: latlng.lat, longitude: latlng.lng }, { debounce: true })
}
watch(query, () => {
  cancelSearch()
  suggestions.value = []; activeSuggestion.value = -1
  searchState.value = 'idle'; suggestionsOpen.value = false
}, { flush: 'sync' })
watch(locale, () => {
  basemap?.setLanguage(locale.value)
  cancelSearch(); suggestions.value = []; activeSuggestion.value = -1
  searchState.value = 'idle'; suggestionsOpen.value = false
  const element = marker?.getElement()
  element?.setAttribute('title', translate('Drag to select location'))
  element?.setAttribute('alt', translate('Selected location marker'))
  if (service.reverseAvailable) resolveAddress(cancelLookup())
})
async function searchAddress() {
  if (searchState.value === 'loading' || !service.searchAvailable) return
  const value = query.value.trim()
  if (value.length < 3) { searchState.value = 'invalid'; return }
  const version = cancelSearch()
  suggestions.value = []; activeSuggestion.value = -1
  searchState.value = 'loading'; suggestionsOpen.value = true
  const controller = new AbortController(); searchAbort = controller
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const result = await service.search(value, { signal: controller.signal, language: locale.value })
    if (disposed || version !== searchVersion) return
    suggestions.value = result; searchState.value = result.length ? 'ready' : 'empty'
  } catch {
    if (!disposed && version === searchVersion) searchState.value = 'failed'
  } finally { clearTimeout(timeout) }
}
function chooseSuggestion(location) {
  cancelGeolocation(); cancelSearch()
  suggestionsOpen.value = false; suggestions.value = []; searchState.value = 'idle'; activeSuggestion.value = -1
  selectLocation(location, { center: true })
  searchInput.value?.focus()
}
function searchKeys(event) {
  if (event.key === 'Enter') { event.preventDefault(); searchAddress(); return }
  if (event.key === 'Escape' && suggestionsOpen.value) { event.preventDefault(); event.stopPropagation(); suggestionsOpen.value = false; return }
  if (!suggestions.value.length) return
  if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault(); suggestionsOpen.value = true
    activeSuggestion.value = activeSuggestion.value < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.value.length - 1) : (activeSuggestion.value + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.value.length) % suggestions.value.length
  }
}
function useCurrentLocation() {
  locationError.value = ''
  if (!navigator.geolocation) { locationError.value = 'Your browser does not support current location. Search for an address or select it on the map instead.'; return }
  const version = ++geoVersion; locating.value = true
  navigator.geolocation.getCurrentPosition(position => {
    if (disposed || version !== geoVersion) return
    locating.value = false
    selectLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }, { center: true })
  }, error => {
    if (disposed || version !== geoVersion) return
    locating.value = false
    const reason = error.code === 1 ? 'Location permission was denied.' : error.code === 3 ? 'Finding your location timed out.' : 'Your current location is unavailable.'
    locationError.value = `${reason} Search for an address or select it on the map instead.`
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
}
function confirm() { if (canConfirm.value) emit('confirm', { ...selectedLocation.value }) }
onMounted(() => {
  map = L.map(container.value, { scrollWheelZoom: true, touchZoom: true, doubleClickZoom: true }).setView([selectedLocation.value.latitude, selectedLocation.value.longitude], 12)
  map.attributionControl.setPrefix(false)
  basemap = addLocalizedBasemap(map, { locale: locale.value, styleUrl: mapStyleUrl })
  const icon = L.divIcon({ className:'transfer-map-pin', html:'<svg width="36" height="44" viewBox="0 0 36 44"><path fill="#fd5400" stroke="white" stroke-width="2" d="M18 42S2 25 2 18a16 16 0 0 1 32 0c0 7-16 24-16 24Z"/><circle cx="18" cy="18" r="5" fill="white"/></svg>', iconSize:[36,44], iconAnchor:[18,42] })
  marker = L.marker([selectedLocation.value.latitude, selectedLocation.value.longitude], { draggable:true, icon, title:translate('Drag to select location'), alt:translate('Selected location marker') }).addTo(map)
  map.on('click', e => moved(e.latlng))
  marker.on('dragend', () => moved(marker.getLatLng()))
  observer = new ResizeObserver(() => map.invalidateSize({ pan:false })); observer.observe(container.value)
  if (!initialAddress) resolveAddress(++lookupVersion)
})
onBeforeUnmount(() => { disposed = true; basemap?.destroy(); cancelLookup(); cancelSearch(); cancelGeolocation(); observer?.disconnect();
  // Leaflet 1.9 retains a 250ms zoom callback. Keep its detached pane alive
  // until that callback settles when a picker is confirmed during zoom.
  const closingMap = map
  closingMap?.stop()
  if (closingMap) setTimeout(() => closingMap.remove(), 300) })
</script>
<template>
  <div class="tf-map-search jb-field" @focusout="!$event.currentTarget.contains($event.relatedTarget) && (suggestionsOpen = false)">
    <label :for="`${id}-search`">{{ $t("Search address / place") }}</label>
    <div class="tf-search-row"><input :id="`${id}-search`" ref="searchInput" v-model="query" type="search" role="combobox" aria-autocomplete="none" :aria-expanded="suggestionsOpen && suggestions.length > 0" :aria-controls="`${id}-suggestions`" :aria-activedescendant="suggestionsOpen && activeSuggestion >= 0 ? `${id}-suggestion-${activeSuggestion}` : undefined" :aria-describedby="`${id}-search-status`" :disabled="!service.searchAvailable" :placeholder='$t("Search for an address or place")' autocomplete="off" @keydown="searchKeys" @focus="suggestionsOpen = true" /><button class="tf-primary tf-search-button" type="button" :disabled="!service.searchAvailable || searchState === 'loading'" :aria-busy="searchState === 'loading'" @click="searchAddress">{{ $t(searchState === 'loading' ? 'Searching…' : 'Search') }}</button></div>
    <ul :id="`${id}-suggestions`" v-show="suggestionsOpen && suggestions.length" role="listbox" :aria-label='$t("Address suggestions")' class="tf-map-suggestions">
      <li v-for="(location,i) in suggestions" :id="`${id}-suggestion-${i}`" :key="`${location.latitude}-${location.longitude}-${location.address}`" role="option" tabindex="0" :aria-selected="activeSuggestion === i" @pointerdown.prevent="chooseSuggestion(location)" @keydown.enter.prevent.stop="chooseSuggestion(location)" @keydown.space.prevent="chooseSuggestion(location)">{{ location.address }}</li>
    </ul>
    <small :id="`${id}-search-status`" class="tf-location-status" aria-live="polite"><template v-if="!service.searchAvailable">{{ $t("Address search is currently unavailable. Select a location on the map or go back to enter an address.") }}</template><template v-else-if="searchState === 'loading'">{{ $t("Searching…") }}</template><template v-else-if="searchState === 'empty'">{{ $t("No places found. Try a more specific address.") }}</template><template v-else-if="searchState === 'failed'">{{ $t("Address search is unavailable right now. Try again or select a location on the map.") }}</template><template v-else-if="searchState === 'invalid' || (query.trim().length > 0 && query.trim().length < 3)">{{ $t("Enter at least 3 characters to search.") }}</template></small>
  </div>
  <p class="tf-map-instruction">{{ $t("Tap on the map or drag the marker to choose the exact location.") }}</p>
  <div class="tf-map-wrapper"><div ref="container" class="tf-map" :aria-label='$t("Choose a location on the map")'></div>
    <button class="tf-current-location" type="button" :disabled="locating" :aria-label="$t(locating ? 'Finding your current location' : 'Use current location')" :aria-busy="locating" :title='$t("Use current location")' @click="useCurrentLocation"><span v-if="locating" class="tf-location-spinner" aria-hidden="true"></span><AppIcon v-else name="locate" :size="24" /></button>
  </div>
  <p v-if="locating || locationError" class="tf-location-status" role="status">{{ $t(locating ? 'Finding your current location…' : locationError) }}</p>
  <section class="tf-selected" aria-live="polite"><small>{{ $t("Selected location") }}</small><strong v-if="selectedLocation.address">{{ selectedLocation.address }}</strong><div v-else-if="lookupState === 'loading'">{{ $t("Finding the address…") }}</div><div v-else-if="lookupState === 'failed'">{{ $t("Address lookup failed. Search for an address or go back to enter it in the form.") }}</div><div v-else>{{ $t("Address unavailable. Go back to enter the address in the form.") }}</div></section>
  <button class="tf-primary" type="button" :disabled="!canConfirm" @click="confirm">{{ $t(locationType === 'pickup' ? 'Confirm pickup location' : 'Confirm drop-off location') }}</button>
</template>
<style scoped>
.tf-map-search { position:relative; }.tf-search-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; align-items:stretch; }.tf-search-button { width:auto; min-height:46px; padding:0 14px; font-size:13px; }.tf-map-suggestions li:focus-visible { outline:3px solid #fd5400; outline-offset:-3px; }.tf-map-suggestions { list-style:none; padding:0; margin:0; border:1px solid var(--line); border-radius:6px; max-height:220px; overflow-y:auto; background:var(--field-bg); color:var(--text); }
.tf-map-suggestions li { font-weight:400; font-size:14px; line-height:1.5; padding:12px 14px; cursor:pointer; border-bottom:1px solid var(--line); }.tf-map-suggestions li:last-child { border-bottom:0; }.tf-map-suggestions li:hover,.tf-map-suggestions li[aria-selected='true'] { background:var(--surface-hover); }
.tf-location-status { font-size:12px; font-weight:400; line-height:1.6; color:var(--muted); }.tf-map-search input:disabled { cursor:not-allowed; }.tf-map-wrapper { position:relative; }
.tf-current-location { position:absolute; bottom:30px; right:12px; z-index:1; width:44px; height:44px; border:2px solid var(--tf-map-control-border, rgb(1 25 71 / .2)); border-radius:50%; background:var(--card); color:var(--text); display:grid; place-items:center; cursor:pointer; }.tf-current-location:disabled { cursor:wait; }
.tf-location-spinner { width:20px; height:20px; border:2px solid var(--line); border-top-color:#fd5400; border-radius:50%; animation:tf-location-spin 1s linear infinite; }.tf-primary:disabled { cursor:not-allowed; }
:global(:root[data-theme='dark']) .tf-current-location { --tf-map-control-border:var(--line); }
@keyframes tf-location-spin { to { transform:rotate(360deg); } }
@media(prefers-reduced-motion:reduce) { .tf-location-spinner { animation:none; } }
</style>
