import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet'
import { applyMapLabelLanguage, mapLabelLocale } from '../utils/mapLabelLanguage.js'

setWorkerUrl(workerUrl)

export const DEFAULT_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const zoomTitles = { en: ['Zoom in', 'Zoom out'], ru: ['Увеличить', 'Уменьшить'], fr: ['Zoom avant', 'Zoom arrière'], de: ['Vergrößern', 'Verkleinern'] }
const attribution = '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> | <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'

// Leaflet owns interaction and markers. MapLibre only draws the vector basemap.
export function addLocalizedBasemap(map, { locale = 'en', styleUrl = DEFAULT_MAP_STYLE } = {}) {
  let language = mapLabelLocale(locale)
  let disposed = false
  let originals = new Map()
  const layer = maplibreGL({
    style: styleUrl || DEFAULT_MAP_STYLE,
    interactive: false,
    pane: 'tilePane',
    attributionControl: { customAttribution: attribution },
  })
  let renderer
  function localizeControls() {
    const container = map.zoomControl?.getContainer()
    for (const [index, selector] of ['.leaflet-control-zoom-in', '.leaflet-control-zoom-out'].entries()) {
      const control = container?.querySelector(selector)
      control?.setAttribute('title', zoomTitles[language][index])
      control?.setAttribute('aria-label', zoomTitles[language][index])
    }
  }
  function styleLoaded() {
    if (disposed) return
    originals = new Map(renderer.getStyle().layers
      .filter(item => item.type === 'symbol' && item.layout?.['text-field'])
      .map(item => [item.id, item.layout['text-field']]))
    applyMapLabelLanguage(renderer, originals, language)
  }
  function layerAdded() {
    renderer = layer.getMaplibreMap()
    renderer.on('style.load', styleLoaded)
  }
  layer.on('add', layerAdded)
  // Preserve the old raster layer's Leaflet zoom ceiling.
  map.setMaxZoom(19)
  localizeControls()
  layer.addTo(map)
  return {
    setLanguage(value) {
      language = mapLabelLocale(value)
      if (!disposed) localizeControls()
      if (!disposed && originals.size) applyMapLabelLanguage(renderer, originals, language)
    },
    destroy() {
      disposed = true
      layer.off('add', layerAdded)
      renderer?.off('style.load', styleLoaded)
      originals.clear()
      // The owning Leaflet map removes the layer in its existing teardown.
    },
  }
}
