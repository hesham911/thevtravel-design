# Mobile LCP optimization — 3 October 2026

The production code reduces the measured LCP substantially without redesigning
pages, changing business logic, cropping images, or removing visible content.
The <4s target is **not yet met for Home, All Journeys, or Luxor Details** in the
cold-cache local mobile trace. Abu Simbel Details is below 2.5s.

## 1. Exact LCP elements

Chrome PerformanceObserver captured actual `largest-contentful-paint` entries,
not inferred candidates. At 320, 360, 390 and 430px:

- Home: `section.hero > div.hero-photo`, the felucca CSS background.
- All Journeys: `section.journeys-hero > div.journeys-hero-photo`, the selected
  light/dark felucca CSS background.
- Journey Details: `.jd-hero-image > img`. This was confirmed for **all 37 detail
  routes at 390px** and for Luxor/Abu Simbel at all four requested mobile widths.
- At 1440px, Home/listing/Luxor retain their image LCP; Abu Simbel's LCP is
  `h1#journey-title`. Its image preload is therefore limited to mobile.

Evidence: `artifacts/lcp-before.json`, `artifacts/lcp-after.json`, and
`artifacts/lcp-route-audit.json` contain exact nodes, URLs, timings and bounds.

## 2. Why LCP was delayed

The Home background request started at ~5.85s, after the shared stylesheet
finished (~5.81s), and completed at ~14.04s in the baseline mobile trace.
The initial stylesheet was 216KB uncompressed and included global map CSS.
Nuxt also emitted speculative prefetch hints for the unmounted map picker,
including a **1,172,519-byte Leaflet/MapLibre engine chunk**. Its download competed
with critical media even though no map was open. Existing async imports alone
were insufficient to prevent this network request.

The final Home hero begins at ~0.25s, before stylesheet completion. Its preload
is high priority. The stylesheet is served with Brotli (~20KB). Map CSS and the
map engine are absent from initial Home/listing/details network requests.

## 3. Files changed

- `app.vue`: route-specific LCP preloads, including early theme-aware listing
  preload and a mobile-only catalog-detail preload.
- `assets/css/styles.css`: only Home/listing hero URLs replaced.
- `components/journey/JourneyHero.vue`: optimized source and explicit eager load;
  existing high fetch priority, crop and object position preserved.
- `components/JourneyCard.vue`, `components/SiteHeader.vue`: low priority for
  competing non-LCP image requests. Existing content and dimensions retained.
- `components/ServiceAreaMap.vue`, `components/transfer/TransferMapPicker.vue`:
  map library CSS imported with its owning lazy component.
- `nuxt.config.ts`: disable speculative async chunk hints; prefetch route links
  on interaction; Brotli/gzip static compression; scoped browser cache headers.
- `data/lcpImages.json`, `utils/lcpImage.js`, `public/assets/lcp/*`: ten lossless,
  content-hashed WebP assets and safe source fallback.
- `scripts/optimize-lcp-images.cjs`, `scripts/measure-lcp.cjs`,
  `scripts/verify-lcp-routes.cjs`, `scripts/verify-nuxt-ssr.mjs`: reproducible
  generation/production diagnostics and configurable SSR preview origin.
- `README.md`, this report, and `artifacts/lcp-*`: instructions and evidence.

## 4. Image format, dimensions and bytes

| Original source | Format / native dimensions | Original bytes | Lossless WebP bytes |
|---|---|---:|---:|
| `/assets/photos/home-hero-clean.png` | PNG 514×330 | 273,842 | 192,788 |
| `/assets/photos/how-booking-hero-light.png` | PNG 577×345 | 319,446 | 245,480 |
| `/assets/photos/how-booking-hero-dark.png` | PNG 577×345 | 325,550 | 249,648 |
| `/assets/photos/hero-colossi-wide.png` | PNG 434×312 | 309,279 | 162,338 |
| `/assets/journeys/journey-karnak.png` | PNG 244×142 | 89,057 | 45,842 |
| `/assets/journeys/journey-abu-simbel.png` | PNG 244×142 | 98,125 | 51,644 |
| `/assets/journeys/journey-felucca.png` | PNG 244×142 | 88,786 | 43,528 |
| `/assets/journeys/journey-sinai.png` | PNG 244×142 | 100,129 | 53,766 |
| `/assets/journeys/journey-alexandria.png` | PNG 244×142 | 81,846 | 41,812 |
| `/assets/journeys/journey-pyramids.png` | PNG 244×142 | 83,320 | 40,244 |

At the four requested mobile widths, rendered Home media is viewport-width ×
300px; listing media is viewport-width × 269px; detail media is viewport-width ×
190px. For example, at 390px these are 390×300, 390×269 and 390×190 CSS pixels.
Device pixel ratio was 2 in the mobile diagnostic.

Sources are already only 244–577px wide. Smaller responsive variants or a
`srcset` would reduce available detail in these cover crops, especially at DPR 2.
No image was resized or upscaled; no unnecessary desktop-resolution asset is
sent to mobile. WebP reduces bytes by 23–52%. Lossless AVIF was evaluated for
Home/listing but was larger than WebP. All ten WebP files were verified to have
**identical decoded RGBA pixels** (`artifacts/lcp-lossless-verification.json`).

## 5. Preload and priority

Home and detail images receive route-specific `as=image` preloads with
`fetchpriority=high`; catalog details use `(max-width: 767px)` on their preload.
Detail images explicitly use `loading=eager` and `fetchpriority=high`.

Listing inserts one early high-priority image preload after the existing theme
bootstrap, before the stylesheet. It reads the actual applied theme so cookie,
legacy localStorage and system preference do not download the wrong-theme hero.
Cookie light/dark, legacy dark, and system dark initialization were verified.
No unrelated media or all-font preload was introduced.

## 6. CSS backgrounds and fonts

Home/listing backgrounds were retained. Early preload removes the delayed
CSS discovery dependency while keeping every background layer, mask,
background-size and background-position intact. Converting the complicated
Home multi-layer background to an `<img>` was unnecessary for discoverability
and could have changed its crop. Details retain their semantic `<img>`.

All existing fonts retain `font-display: swap`. Mobile LCP was image-based;
no extra font preload was justified. Desktop Abu Simbel text renders with the
existing swap policy. Fonts and their metrics were not changed.

All 20 before/after geometry measurements match exactly. Sampled screenshots
were inspected; source pixels are identical. Some screenshots have minor
rasterization differences, so this is not a claim that every screenshot is
pixel-identical (`artifacts/lcp-visual-parity.json`).

## 7. Maps, icons and dialogs

The baseline network downloaded the combined Leaflet/MapLibre chunk despite
the picker being closed. The final build still produces a large engine chunk,
but **none of the 57 audited initial-load cases downloads it or its worker**.
Global map CSS was removed from the render-blocking entry sheet. The map picker
remains async and client-only. Contact still loads its real rendered map.

A production Home → transfer → pickup-map interaction verified that the engine,
canvas and map CSS load on demand, with no page errors. Existing multilingual
basemap services were not altered. All language-cookie SSR checks pass.
Lucide uses named, tree-shaken imports; no full icon namespace is imported.
Existing dialogs remain available. There was no broad JS or hydration rewrite.

## 8. Cache and production verification

Nuxt production build succeeds; all 15 unit tests pass; all 45 SSR routes and
EN/RU/FR/DE language cookies plus dark theme pass. Chrome audited all requested
widths, every detail route at 390px, both Home/listing themes, and map opening.
No initial map engine request or hydration error occurred in the 57-case audit.

Production HEAD checks confirm:

- Hashed `/_nuxt/*` and content-hashed `/assets/lcp/*`:
  `Cache-Control: public, max-age=31536000, immutable`.
- Mutable `/assets/*`: `public, max-age=86400`, with ETag/Last-Modified revalidation.
- Static CSS: Brotli encoding and `Vary: Accept-Encoding`.
- Dynamic SSR HTML: no long-lived/immutable caching rule added.

These are verified Nitro Node headers. A Hostinger/CDN static front end may
need its own equivalent configuration; the actual deployed response headers
cannot be confirmed without the deployment URL/access.

## 9. Before/after mobile measurements

Same production code baseline/final, cold Chrome cache, 390×900 CSS viewport,
DPR 2, 150ms latency, 1.6Mbps download, 750Kbps upload, 4× CPU slowdown. These
are single-run **local diagnostics**, not repeat-run medians or Hostinger results.
Other requested widths were checked without artificial throttling.

| Route | Before LCP | After LCP | After FCP | After CLS | Long-task blocking* |
|---|---:|---:|---:|---:|---:|
| `/` | 14.04s | 5.61s | 0.96s | 0.00000 | 73ms |
| `/journeys` | 15.35s | 6.89s | 1.03s | 0.00000 | 78ms |
| `/journeys/luxor-west-bank-at-dawn` | 11.56s | 4.53s | 1.01s | 0.02236 | 85ms |
| `/journeys/abu-simbel-day-tour` | 6.18s | 1.65s | 0.99s | 0.00039 | 111ms |

*Long-task blocking sums max(duration−50ms, 0) over the observation window;
this is not Lighthouse's bounded TBT calculation.

Independent mobile Lighthouse (default simulated throttling) on final Home:
Performance 72, LCP 6.09s, FCP 3.18s, TBT 0ms, CLS 0.

Its modeled timings should not be directly compared to the observed CDP trace.
Evidence: `artifacts/lcp-lighthouse-home-mobile.json`.

## 10. Remaining limitations

The supplied Hostinger baseline (mobile LCP 11.2s, FCP 2.1s, TBT 70ms, CLS 0)
was not reproduced on that host: no deployed URL or full Lighthouse trace was
provided. No deployment was made. A real Hostinger after-value is therefore
**unverified**, and no claim of 11.2s → a local result is made.

Home/listing and Luxor still exceed the <4s local target. Cold-network contention
remains from the two existing brand PNGs (~793KB combined), nearby lazy card
imagery, and fonts. Their priorities were lowered where appropriate, but their
assets and visual appearance were preserved within this LCP-focused scope.
TBT is not the dominant problem. Further reductions may need hosting/CDN
verification or optimization of those competing assets. No visible content was
removed and hero quality was not reduced to obtain a score.

The loading strategy follows [web.dev's LCP guidance](https://web.dev/articles/optimize-lcp),
[Nuxt's build manifest hook](https://nuxt.com/docs/4.x/api/advanced/hooks), and
[Nuxt's interaction prefetch documentation](https://nuxt.com/docs/4.x/api/components/nuxt-link).
