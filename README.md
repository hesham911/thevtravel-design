# TheVTravel Nuxt frontend

The approved Vue frontend has been migrated to Nuxt 4 with SSR. Existing page templates, CSS, fonts, images, icons, demo data and request contracts are retained.

Use Node.js 22.19+ within the 22.x release line, 24.11+ within 24.x, or 26+.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Production runs with `node .output/server/index.mjs`. `HOST` and `PORT` configure its listener. Copy `.env.example` to `.env` for local configuration; provide environment variables to the production process.

| Previous setting | Nuxt setting | Purpose |
| --- | --- | --- |
| `VITE_WHATSAPP_URL` | `NUXT_PUBLIC_WHATSAPP_URL` | Public WhatsApp contact URL |
| `VITE_LOCATION_API_URL` | `NUXT_PUBLIC_LOCATION_API_URL` | Public geocoding proxy URL; existing `/search` and `/reverse` contracts |
| None | `NUXT_PUBLIC_API_BASE_URL` | Reserved for future Laravel integration; currently unused |
| None | `NUXT_PUBLIC_SITE_URL` | Real deployment origin for absolute canonical and Open Graph URLs |

Public configuration must contain URLs, never provider secrets. A future Laravel proxy owns geocoding credentials. No Laravel API or CMS integration has been added.

Pages live in `pages/`, reused components in `components/`, styles in `assets/css/`, and existing static files in `public/assets/`. `data/` retains demo records. The only client-only rendering boundaries are the two Leaflet map implementations; Contact and Journey pages remain server rendered.

Theme and language cookies provide per-request SSR state. Existing localStorage preferences migrate after hydration. English remains the default and existing public URLs are unchanged.

See [the migration report](docs/nuxt-migration-report.md) for the route map and verification results. Original Vite source/configuration is archived in `artifacts/vite-source-before-migration.tar.gz`.

## Additional verification

With production preview running on port 3001:

```sh
npm run test:ssr
```

Browser verification scripts use Playwright with the installed Chrome browser. Make Playwright available through Node's module resolution, such as `NODE_PATH` pointing to the Codex bundled Node packages, then run:

```sh
node scripts/verify-nuxt-browser.cjs
node scripts/compare-nuxt-parity.cjs
node scripts/compare-nuxt-dialogs.cjs
```

Comparisons expect the preserved Vite app on port 5173 and Nuxt preview on port 3001. Extract the Vite archive to a separate directory, provide its original dependencies and the unchanged public assets, then run its dev server on port 5173. These checks compare visible text, geometry and computed typography/colors; equivalent SVG inlining is recorded separately.

For mocked geocoding verification, run a second production instance with `NUXT_PUBLIC_LOCATION_API_URL=/test-geocode PORT=3002 node .output/server/index.mjs`, then `node scripts/verify-nuxt-maps.cjs`. The browser test supplies mock responses; no backend endpoint is created.

## Multilingual basemap

Both maps retain Leaflet interaction/markers and use OpenFreeMap vector tiles rendered by MapLibre underneath them. EN/RU/FR/DE change the real vector-label `text-field` expressions in place. Missing or empty translations fall back to native names and then the provider's original expression. Road numbers and other non-name labels are preserved.

The default OpenFreeMap Liberty style requires no account or key. `NUXT_PUBLIC_MAP_STYLE_URL` optionally selects an OpenMapTiles-compatible style; it is a public browser URL, never a place for a secret credential. OpenFreeMap advertises free public hosting with no request/map-view limits, but the public service is still an external dependency. Retain its attribution. WebGL is required for the vector renderer. MapLibre's worker is bundled locally; no remote worker script or RTL plugin is needed with MapLibre 6.

See [the basemap change report](docs/multilingual-basemap.md) for provider research and verification. The earlier migration parity report describes the approved raster-map baseline before this explicitly requested basemap change.

### Mobile LCP verification

The scoped optimization findings and limits are in `docs/mobile-lcp-report.md`.
Start an isolated production preview to avoid measuring a stale running build:

```sh
npm run build
HOST=127.0.0.1 PORT=3014 node .output/server/index.mjs
```

With Playwright available through `NODE_PATH`, run:

```sh
LCP_ORIGIN=http://127.0.0.1:3014 node scripts/measure-lcp.cjs after
LCP_ORIGIN=http://127.0.0.1:3014 node scripts/verify-lcp-routes.cjs
NUXT_PREVIEW_ORIGIN=http://127.0.0.1:3014 npm run test:ssr
```

The measurement script records Chrome's actual LCP node, resource timing, FCP,
CLS, long-task blocking time, hero bounds, and screenshots at 320/360/390/430px
plus desktop. Only the 390px cases use a cold cache, 150ms latency, 1.6Mbps
download, and 4× CPU throttling; the other widths check element identity/layout.
Long-task blocking time is a diagnostic, not Lighthouse's TBT metric.
The route audit checks every Journey detail route, both Home/listing themes,
theme preference initialization, and on-demand map loading.

With Sharp available through `NODE_PATH`, regenerate the lossless hero assets:

```sh
node scripts/optimize-lcp-images.cjs
```

Generated filenames hash the encoded contents. Rebuild after regeneration. New
CMS image URLs fall back to their original source until optimized variants exist.
Nuxt/Nitro serves precompressed static assets and cache headers in Node preview.
If Hostinger or a CDN serves `.output/public` directly, its own static configuration
must retain these headers and negotiate `.br`/`.gz` using `Accept-Encoding` with
`Vary: Accept-Encoding`. Do not apply immutable caching to SSR HTML.
