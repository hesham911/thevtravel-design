<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import { addLocalizedBasemap } from '~/services/leafletBasemap.client'
import { egyptBounds, serviceAreaLocations } from '~/data/serviceAreaLocations'
import { useI18n } from '~/utils/i18n'
const { translate, locale } = useI18n()
import { useTheme } from '~/composables/useTheme'

const { isDark } = useTheme()

const props = defineProps({
  locations: { type: Array, default: () => serviceAreaLocations },
  bounds: { type: Array, default: () => egyptBounds },
})

const container = ref(null)
const mapStyleUrl = useRuntimeConfig().public.mapStyleUrl
let map, basemap
let markers
let resizeObserver

function fitArea() {
  if (!map) return
  map.invalidateSize({ pan: false })
  map.fitBounds(props.bounds, { padding: [24, 24], animate: false })
}

function renderMarkers() {
  if (!markers) return
  markers.clearLayers()
  props.locations.forEach(({ name, coordinates }) => {
    const labelOnLeft = name === 'Hurghada' || name === 'Sharm El-Sheikh'
    // Use a text node so future caller-supplied names cannot inject HTML.
    const label = document.createElement('span')
    label.textContent = translate(name)
    L.circleMarker(coordinates, {
      radius: 6,
      color: '#fff',
      weight: 2,
      fillColor: '#011947',
      fillOpacity: 1,
      interactive: true,
    }).bindTooltip(label, {
      permanent: true,
      direction: labelOnLeft ? 'left' : 'right',
      offset: [labelOnLeft ? -8 : 8, 0],
      className: 'service-area-map-label',
    }).bindPopup(label.cloneNode(true)).addTo(markers)
  })
}

watch(locale, () => { renderMarkers(); basemap?.setLanguage(locale.value) })

onMounted(() => {
  map = L.map(container.value, {
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: true,
    keyboard: true,
    zoomSnap: 0,
  })
  map.attributionControl.setPrefix(false)
  basemap = addLocalizedBasemap(map, { locale: locale.value, styleUrl: mapStyleUrl })
  markers = L.layerGroup().addTo(map)
  renderMarkers()
  fitArea()
  resizeObserver = new ResizeObserver(fitArea)
  resizeObserver.observe(container.value)
})

watch(() => props.locations, renderMarkers, { deep: true })
watch(() => props.bounds, fitArea, { deep: true })

onBeforeUnmount(() => {
  basemap?.destroy()
  resizeObserver?.disconnect()
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="container" class="service-area-map" :class="{ 'is-dark': isDark }" role="region" :aria-label="$t('Map of Egypt. Service locations: {locations}.', { locations: locations.map(location => $t(location.name)).join(', ') })"></div>
</template>

<style scoped>
.service-area-map {
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: inherit;
  isolation: isolate;
  z-index: 0;
  background: var(--map-surface);
  font-family: var(--font-ui);
  touch-action: none;
  cursor: grab;
}

.service-area-map.leaflet-drag-target { cursor: grabbing; }
.service-area-map :deep(.leaflet-control-zoom a) {
  background: var(--contact-card);
  color: #011947;
  border-color: var(--contact-line);
}
.service-area-map.is-dark :deep(.leaflet-control-zoom a) { color: var(--contact-text); }
.service-area-map :deep(.leaflet-popup-content-wrapper),
.service-area-map :deep(.leaflet-popup-tip) {
  background: var(--contact-card);
  color: var(--contact-text);
}

.service-area-map :deep(.service-area-map-label) {
  border: 1px solid var(--contact-line);
  border-radius: 5px;
  padding: 3px 6px;
  background: var(--contact-card);
  color: #011947;
  box-shadow: 0 1px 4px rgb(1 25 71 / 12%);
  font: 600 10px/1.4 var(--font-ui);
}

.service-area-map :deep(.service-area-map-label::before) { display: none; }
.service-area-map :deep(.leaflet-control-attribution) {
  margin: 0;
  padding: 3px 6px;
  background: var(--contact-card);
  color: var(--contact-text);
  font: 10px/1.4 var(--font-ui);
}
.service-area-map :deep(.leaflet-control-attribution a) { color: #011947; }
.service-area-map.is-dark :deep(.service-area-map-label),
.service-area-map.is-dark :deep(.leaflet-control-attribution a) {
  color: var(--contact-text);
}
.service-area-map.is-dark :deep(.leaflet-tile-pane) {
  filter: brightness(.7) saturate(.65);
}
</style>
