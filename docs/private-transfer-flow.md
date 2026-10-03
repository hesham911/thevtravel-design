# Private Transfer frontend flow

Added:
- `src/components/GlobalFloatingActions.vue`: global viewport-fixed Transfer and WhatsApp stack, 50% background alpha, opaque icons, desktop Transfer hover expansion and mobile Journey controls clearance.
- `src/components/transfer/TransferRequestFlow.vue`: exactly three steps, validation, contact country/dial code controls, review edits, success state and submission adapter.
- `src/components/transfer/TransferMapPicker.vue`: Leaflet/OpenStreetMap picker with map clicks, draggable marker, pan, wheel/pinch/double-click zoom and standard zoom controls.
- `src/composables/useRequestOverlay.js`: shared native-dialog lifecycle and reactive request visibility.
- `src/transfer-request.css`: scoped Transfer tokens and responsive overrides.

Changed:
- `src/App.vue`: mount the global actions and Transfer flow once.
- `src/components/NeedHelpCTA.vue`: remove its page-local floating WhatsApp duplicate; keep the existing help section.
- `src/components/journey/JourneyBookingFlow.vue`: use the extracted overlay lifecycle; existing Journey UI and fields remain unchanged.

Reused Journey resources: `journey-booking.css` dialog/backdrop, right-panel sizing and entry animation, bottom-sheet transition, scroll container, stepper styling, field shells, counters and review layout; `JourneyIcon.vue`; the native dialog Escape/focus trap and shared scroll-lock/focus-return composable. No background page redesign or service-area-map change.

`requestOverlayOpen` derives from the shared active request count. Both Journey and Transfer register while open and unregister on close or unmount. Global actions render only when this count is zero, including Transfer picker, review and success.

`picker` is null, pickup or dropoff; the same dialog switches its content to the map while retaining the reactive form. Back discards the unconfirmed map draft. Confirm emits `{latitude, longitude, address}` and writes the matching `pickup_latitude`, `pickup_longitude`, `pickup_address` or dropoff equivalents. Manual address edits clear stale coordinates. No reverse geocoder is configured. The map picker accepts a `reverseGeocode({ latitude, longitude })` async function returning a human-readable address, passed through TransferRequestFlow. It debounces selection changes and ignores stale responses. Coordinates are never displayed or included in address text. Until a resolver is supplied, the picker shows an address-unavailable status and retains its selected coordinates internally; confirmation is disabled until a readable address resolves. Users can go back and enter a manual address. Step 1 requires readable pickup and drop-off addresses. Confirmation is labeled Confirm pickup location or Confirm drop-off location and returns the resolved address plus internal coordinates. A reverse-geocoding provider/API adapter is still required; OpenStreetMap tiles alone do not supply address lookup. No provider, paid service, or fabricated address was added.

Integration limits: there is no request API configured. `submitRequest` saves a frontend request in localStorage under `thevtravel-transfer-requests` and emits `request-draft`; it does not transmit to the travel team. Replace this adapter with the real endpoint before production. WhatsApp is disabled until `VITE_WHATSAPP_URL` is configured.

Verification: production build passed. Browser checks at desktop 1440×1000 and mobile 390×844/default mobile viewport covered Step 1 → map → Step 1, selected coordinates, contact → review → success, scroll lock, Escape, request-action visibility, Journey Request visibility integration, light/dark Transfer text and CTA tokens, mobile bottom sheet and navigation clearance. Map clicking and zoom controls were exercised. Leaflet touch/pinch and marker dragging are enabled but physical touch gestures were not tested. The mechanical design scan reports intentional brief-specific colors, inherited dimensions/type sizes and the requested width hover animation.

The Contact page continues to use `ServiceAreaMap.vue` exclusively for its service-area display. Only TransferRequestFlow uses `TransferMapPicker.vue`; the geocoding callback and selected-address state are confined to the Transfer components. Contact map code, city markers, map interaction and layout were not modified.

## Address search and current location

TransferMapPicker uses the isolated `src/services/locationSearchService.js` adapter. All selection methods update `selectedLocation = { address, latitude, longitude }`. Search requires an explicit Search click or Enter in the input, requires 3 characters, supports keyboard-selectable results and filters invalid provider results. Typing only clears stale results and cancels an outdated lookup; it never starts a search request. The Search button shows Searching… and ignores duplicate submissions while loading. Search, reverse lookups and geolocation callbacks ignore stale results. Current Location is an accessible 44px crosshair control inside the map; permission denial, unavailable position, timeout and unsupported browsers leave the picker usable. A location can only be confirmed after a readable address is available.

No provider or credentials are configured. To enable search and reverse lookup, configure `VITE_LOCATION_API_URL` to a geocoding proxy base URL, then restart Vite. The proxy must provide:
- `GET {base}/search?q=...` → JSON array of `{ address: string, latitude: number, longitude: number }`.
- `GET {base}/reverse?latitude=...&longitude=...` → JSON `{ address: string, latitude: number, longitude: number }`.

That proxy still needs a real non-Google geocoding provider and any credentials required by that provider, configured server-side. No vendor has been chosen or configured in this project. Alternatively pass `searchLocations(query, {signal})` and `reverseGeocode({latitude, longitude}, {signal})` callbacks to TransferRequestFlow. The existing address-string reverse callback remains supported. Contact ServiceAreaMap has no dependency on this adapter.

The Transfer dark theme inherits existing site card, text, field, border, muted, placeholder, hover and error tokens. Light mode retains #011947 typography; CTA/active step remains #fd5400. Floating action resting backgrounds now use .4 alpha with fully opaque icons. Unit coverage verifies unconfigured behavior, short-query suppression, provider result validation, reverse adapter contracts, failure propagation and abort handling.

Latest verification: `npm run build` and all four `node --test tests/locationSearchService.test.js` cases pass. Browser review confirmed dark Step 1, Contact, Review, Map Picker and Success on desktop, and the picker in light/dark mobile viewports. Computed dark styles match existing site text (#f6eee9), card (#001122), field and border tokens; light text remains #011947. Floating backgrounds compute to rgba(254,84,1,0.4) and rgba(37,211,102,0.4) in both themes, with button/icon opacity 1. Live provider autocomplete and real browser geolocation were not exercised because no provider is configured and no location permission was requested during testing.
