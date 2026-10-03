# Multilingual basemap update

## Provider decision

Use **OpenFreeMap Liberty vector tiles**, rendered by **MapLibre GL JS 6.11.2** through **@maplibre/maplibre-gl-leaflet 0.1.4**. Leaflet remains responsible for all interaction, markers and coordinates.

The [live OpenFreeMap TileJSON schema](https://tiles.openfreemap.org/planet) was inspected and contains `name:en`, `name:ru`, `name:fr` and `name:de` fields, including in the place/POI layers. Coverage depends on the supplied OpenStreetMap translations; this is not machine translation. Cairo's actual features supply Cairo, Каир, Le Caire and Kairo. Missing or empty translations fall back to native `name`, Latin/provider names and the original style expression. Road-number labels stay unchanged. Existing Leaflet zoom-control tooltips and accessible labels also follow EN/RU/FR/DE, without changing control markup or behavior.

[OpenFreeMap](https://github.com/hyperknot/openfreemap) advertises free public hosting, no account/API key, and no map-view/request limits. It remains an external public service; that statement is not a guaranteed uptime SLA. Its OpenFreeMap/OpenMapTiles/OpenStreetMap attribution is retained in the existing Leaflet attribution control.

[MapTiler's Leaflet integration](https://docs.maptiler.com/leaflet/) is a viable alternative with runtime language support. It requires a browser API key. Its [current pricing](https://www.maptiler.com/cloud/pricing/) lists a testing/personal/non-commercial free tier with 5,000 map sessions and 100,000 API requests per month; free service pauses when limits are exhausted. OpenFreeMap avoids adding account/token requirements to this project.

## Implementation scope

- Changed the basemap layer in `TransferMapPicker.vue` and `ServiceAreaMap.vue` only. Templates, picker layout, Transfer steps and form state are unchanged.
- `services/leafletBasemap.client.js` adds a non-interactive vector layer in Leaflet's existing tile pane. Leaflet still handles map clicks, marker dragging, zoom controls and geolocation. The previous maximum zoom of 19 is retained.
- `utils/mapLabelLanguage.js` updates real MapLibre symbol-layer `text-field` expressions. Existing original expressions are kept for provider fallback and repeated language switches. No DOM/CSS label translation is used.
- Locale changes update the existing renderer in place. They do not recreate the map, move its camera or marker, or reset pickup/dropoff/form data. Existing search/reverse-geocoding locale handling remains intact.
- Contact's map can be added before Leaflet receives its initial bounds; renderer listeners attach when the layer is actually added. A locale selected while loading becomes the initial label locale.
- MapLibre's module worker is bundled through Vite and served from the application. MapLibre 6 shapes/reorders native Arabic fallback labels itself; no additional remote RTL plugin is loaded. See [MapLibre's RTL documentation](https://maplibre.org/maplibre-gl-js/docs/API/functions/setRTLTextPlugin/).
- Existing dark-mode tile-pane filtering applies to the new layer. Existing Leaflet controls, marker artwork, map dimensions and current-location button are retained. Only provider cartography/labels and the required attribution differ.
- Both map components remain behind their existing `ClientOnly` boundaries. Public content and surrounding pages remain SSR-enabled. MapLibre is imported only by the dynamically loaded map components.

## Configuration

No token or secret is required for the default provider.

`NUXT_PUBLIC_MAP_STYLE_URL` optionally overrides `runtimeConfig.public.mapStyleUrl`, defaulting to `https://tiles.openfreemap.org/styles/liberty`. Overrides must use an OpenMapTiles-compatible name-field schema. This URL is visible to browsers and must never contain a secret credential. A different token-based provider needs its own documented public-token configuration; it has not been silently added here.

The new vector renderer requires WebGL. Translation coverage is provider data dependent, so some individual streets/places may still display native Arabic in any locale where a translated name is absent.

## Verification

- 15 unit tests pass, including all existing currency/legal/location/search tests and two new MapLibre-expression tests for all four languages, empty/missing translations, original-provider fallback, preservation of road references/metadata, and repeated switches.
- Nuxt production build passes, including the locally bundled worker.
- Browser tests inspect actual MapLibre label expressions and real OpenFreeMap feature properties while changing EN/RU/FR/DE with the picker open. Both Contact and Transfer map camera positions are unchanged. The picker marker position and previously entered pickup field remain unchanged.
- Existing search/reverse contracts, current location, pickup/dropoff confirmation and complete Transfer review/success/persistence are verified with a mocked location proxy. Submitted coordinates remain the supplied search/geolocation coordinates. Map click selection and marker dragging still trigger reverse lookups. Dark-mode filtering is verified on the vector tile pane. No location API implementation was changed.
- Screenshots of the real basemap are saved as `artifacts/basemap-en.png`, `basemap-ru.png`, `basemap-fr.png`, `basemap-de.png`; English and Russian screenshots were visually inspected.
- Browser checks record hydration/console errors in `artifacts/multilingual-basemap-checks.json`. SSR checks retain useful content for all 45 public routes.

The earlier Nuxt migration comparison report is historical evidence against the raster baseline. This subsequent user-requested vector-basemap presentation change intentionally replaces that cartography.

Repeat the browser checks with `NUXT_PUBLIC_LOCATION_API_URL=/test-geocode PORT=3011 node .output/server/index.mjs`, then run `node scripts/verify-multilingual-basemap.cjs` with Playwright available through Node module resolution. The test instruments the renderer only in browser responses to inspect its public API; application source/assets are not altered. It also checks map clicks and marker dragging continue to generate reverse lookups.
