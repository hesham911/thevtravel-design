# TheVTravel frontend refinement report

Implemented the requested refinement and global typography continuation in the existing frontend. The recent Journey Details, request flows, and Contact design remain the reference. No CMS/backend or new booking flow was introduced.

## 1. Files changed

- [src/components/AppIcon.vue](/Users/hanafawy/Herd/vtravel-design/src/components/AppIcon.vue)
- [src/components/BottomJourneyCTA.vue](/Users/hanafawy/Herd/vtravel-design/src/components/BottomJourneyCTA.vue)
- [src/components/GlobalFloatingActions.vue](/Users/hanafawy/Herd/vtravel-design/src/components/GlobalFloatingActions.vue)
- [src/components/JourneyCard.vue](/Users/hanafawy/Herd/vtravel-design/src/components/JourneyCard.vue)
- [src/components/JourneyListingCard.vue](/Users/hanafawy/Herd/vtravel-design/src/components/JourneyListingCard.vue)
- [src/components/LanguageSelector.vue](/Users/hanafawy/Herd/vtravel-design/src/components/LanguageSelector.vue)
- [src/components/NeedHelpCTA.vue](/Users/hanafawy/Herd/vtravel-design/src/components/NeedHelpCTA.vue)
- [src/components/ServiceAreaMap.vue](/Users/hanafawy/Herd/vtravel-design/src/components/ServiceAreaMap.vue)
- [src/components/SiteFooter.vue](/Users/hanafawy/Herd/vtravel-design/src/components/SiteFooter.vue)
- [src/components/SiteHeader.vue](/Users/hanafawy/Herd/vtravel-design/src/components/SiteHeader.vue)
- [src/components/TransferBanner.vue](/Users/hanafawy/Herd/vtravel-design/src/components/TransferBanner.vue)
- [src/components/journey/JourneyBookingFlow.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/JourneyBookingFlow.vue)
- [src/components/journey/JourneyBookingSummary.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/JourneyBookingSummary.vue)
- [src/components/journey/JourneyGalleryViewer.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/JourneyGalleryViewer.vue)
- [src/components/journey/JourneyHero.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/JourneyHero.vue)
- [src/components/journey/JourneyIcon.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/JourneyIcon.vue)
- [src/components/journey/JourneySectionContent.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/JourneySectionContent.vue)
- [src/components/journey/JourneyVideo.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/JourneyVideo.vue)
- [src/components/journey/MobileJourneyControls.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/MobileJourneyControls.vue)
- [src/components/journey/RelatedJourneys.vue](/Users/hanafawy/Herd/vtravel-design/src/components/journey/RelatedJourneys.vue)
- [src/components/transfer/TransferMapPicker.vue](/Users/hanafawy/Herd/vtravel-design/src/components/transfer/TransferMapPicker.vue)
- [src/components/transfer/TransferRequestFlow.vue](/Users/hanafawy/Herd/vtravel-design/src/components/transfer/TransferRequestFlow.vue)
- [src/composables/useTransferRequest.js](/Users/hanafawy/Herd/vtravel-design/src/composables/useTransferRequest.js)
- [src/data/demoTranslations.json](/Users/hanafawy/Herd/vtravel-design/src/data/demoTranslations.json)
- [src/data/homeContent.js](/Users/hanafawy/Herd/vtravel-design/src/data/homeContent.js)
- [src/data/journeys.js](/Users/hanafawy/Herd/vtravel-design/src/data/journeys.js)
- [src/i18n.js](/Users/hanafawy/Herd/vtravel-design/src/i18n.js)
- [src/journey-booking.css](/Users/hanafawy/Herd/vtravel-design/src/journey-booking.css)
- [src/journey-details.css](/Users/hanafawy/Herd/vtravel-design/src/journey-details.css)
- [src/main.js](/Users/hanafawy/Herd/vtravel-design/src/main.js)
- [src/refinements.css](/Users/hanafawy/Herd/vtravel-design/src/refinements.css)
- [src/styles.css](/Users/hanafawy/Herd/vtravel-design/src/styles.css)
- [src/typography.css](/Users/hanafawy/Herd/vtravel-design/src/typography.css)
- [src/views/AboutPage.vue](/Users/hanafawy/Herd/vtravel-design/src/views/AboutPage.vue)
- [src/views/ContactPage.vue](/Users/hanafawy/Herd/vtravel-design/src/views/ContactPage.vue)
- [src/views/FAQPage.vue](/Users/hanafawy/Herd/vtravel-design/src/views/FAQPage.vue)
- [src/views/HomePage.vue](/Users/hanafawy/Herd/vtravel-design/src/views/HomePage.vue)
- [src/views/HowBookingWorksPage.vue](/Users/hanafawy/Herd/vtravel-design/src/views/HowBookingWorksPage.vue)
- [src/views/JourneyDetailsPage.vue](/Users/hanafawy/Herd/vtravel-design/src/views/JourneyDetailsPage.vue)
- [src/views/JourneysPage.vue](/Users/hanafawy/Herd/vtravel-design/src/views/JourneysPage.vue)

Also changed `package.json`, `package-lock.json`, and `DESIGN.md`; added this report. Vite regenerated `dist/`.

## 2. Shared components

- Promoted the incumbent listing card to `JourneyCard`; `JourneyListingCard` delegates to it as a compatibility wrapper.
- Home, catalog grid/list, and the existing related carousel render the same card.
- Added a native, keyboard-accessible `LanguageSelector` backed by one configuration.
- `JourneyIcon` delegates to the shared Lucide registry in `AppIcon`.
- Reused `SiteHeader`, `SiteFooter`, `TransferBanner`, the existing related carousel, and existing request dialogs. A small shared transfer trigger opens the one existing global dialog instance.

## 3. Home

Retained the hero; removed the full filter panel, duplicate catalog, and numbered pagination. Added three featured catalog journeys, View all journeys, four compact benefits, and three existing destinations (Luxor, Cairo, Aswan). The transfer banner opens the existing flow. Explore journeys goes to `/journeys` with the requested `#fd5501` background. Its text is white, following the approved mobile-review continuation.

## 4. Cards and image reuse

Cards share image ratio, metadata, tags, descriptions, ratings, price/request states, and CTA markup. Text can grow and wrap; footers align naturally without title truncation. Phones use full-width stacked cards. Related cards reuse the same catalog records. The Luxor catalog record derives its image, title, price, alt, rating, and slug from the Details record. Card images use `--journey-image-ratio`, `object-fit: cover`, and optional `imagePosition`; Details uses that source with its own cover crop. No separate Admin image upload is required.

## 5. Progressive loading

Initial batch: nine records. IntersectionObserver loads another batch within 240px of the results bottom. New records append; a loading announcement and subtle skeleton expose progress. Loading is guarded against duplicate requests, filters/sort reset batches, and a completion message appears at the end. Load more remains a functional fallback without IntersectionObserver. Local demo data remains local; no API contract changed.

`journeys-browse` in sessionStorage retains destination, interest, sort, view, batch count, and scroll. Router scroll handling preserves query-only section navigation and restores browsing position on return. Browser verification restored 18 loaded records and exactly 1,800px of scroll after opening Details and going back.

## 6–7. Languages and demo translations

Configuration and shared translation helper: [src/i18n.js](/Users/hanafawy/Herd/vtravel-design/src/i18n.js). Demo catalog: [src/data/demoTranslations.json](/Users/hanafawy/Herd/vtravel-design/src/data/demoTranslations.json), containing 687 English fallback keys with Russian, French, and German values. English is the default; a user's selection persists.

All page templates, shared navigation/footer, catalog demo records, Details content/tabs/gallery/reviews, request labels, validation, empty/loading states, and map-picker messages use the shared translation helper. Document language and title update with the selection. Dynamic accessible labels support parameters. Translations were machine-assisted, with manual corrections to key navigation, transfer terminology, Luxor's west bank, and whole-heading grammar. Proper names, brand artwork, internal form values, and user-entered identity/address data remain intact. Language labels always appear in their native names.

## 8. Icons

The project had no established UI icon dependency. Added Lucide's official Vue package, `@lucide/vue`, and retained one registry rather than parallel icon systems. Replaced semantic custom SVGs, request plus/minus controls, breadcrumb chevrons, and the map location control where appropriate. Preserved the logo, social brand artwork, and intentional decorative route/illustration assets. [Lucide documentation](https://lucide.dev/guide/vue).

## 9. Responsive and interaction fixes

- Mobile language selector is visible in the header; theme control is discoverable in the drawer. Escape closes the drawer and restores trigger focus.
- Desktop navigation supports longer labels; intermediate widths avoid header collisions.
- Home cards stack on phones; destination cards reflow; compact benefits use fewer columns at narrow widths.
- Filters remain on the listing. Interest chips scroll on mobile and wrap long desktop labels; sort and layout controls have usable touch targets.
- Related-carousel arrows remain within page bounds rather than creating tablet overflow.
- Details benefits reflow to one column at narrow widths; translated titles and metadata can wrap.
- Footer tracks can shrink without clipping; mobile transfer imagery remains visible.
- Mobile form text is 16px; buttons can wrap; request sheets keep their existing behavior.
- Existing floating positions, 40% alpha, opaque icons, and Details mobile bottom-navigation clearance remain intact.

## 10–11. Imagery and remaining assets

No raster assets were replaced. The built-in image-generation attempt returned HTTP 429 `usage_limit_reached`. Existing assets were retained, with cover sizing and corrected layout/cropping.

Replacement priorities when generation becomes available:

| Assets | Current resolution | Reason |
| --- | --- | --- |
| `public/assets/journeys/journey-{karnak,abu-simbel,felucca,pyramids,sinai,alexandria}.png` and duplicate `photos/` copies | 244×142 each | Too small for presentation-quality desktop cards; use one high-resolution source per journey. |
| `public/assets/photos/home-hero-clean.png` | 514×330 | Too small for a wide hero. |
| `public/assets/sections/hero-transfer-van.png` | 602×345 | Small source with baked fade/decoration; replace with an edge-to-edge premium transport photograph. |
| Demo snorkeling/White Desert/balloon records using reused coastal/desert images | Reused thumbnails | Need subject-specific presentation photographs, especially for reefs and White Desert. |

No images were stretched or programmatically upscaled to imply new source quality.

## 12. CMS readiness

Home marketing, benefit, destination, and transfer content is separated in `src/data/homeContent.js`. Existing journey records remain separate from card rendering. `translate()` accepts localized `{ en, ru, fr, de }` records as well as English demo keys. Shared cards support an optional source focal position. Content length can grow without relying on fixed title heights or independently maintained page card systems. This prepares presentation boundaries for later Admin/API content; it does not implement a CMS.

## 13. Intentionally preserved

Journey/Transfer step sequences, validations and submission adapters, pricing/payment rules, map search/geocoding contracts, Contact service-area interactions, approved floating behavior, dark mode, logos, and primary navigation structure. Presentation-only changes localize messages and dates and standardize icons/fonts. Existing unconfigured WhatsApp, geocoding, and backend delivery integrations remain unconfigured; no contact details, successful server delivery, or provider results were fabricated. The existing catalog's available Details routes remain unchanged.

## 14. Verification

- `npm run build`: passed, with route splitting and no oversized-chunk warning in the final build.
- `node --test tests/*.test.js`: all seven existing location-search/map-picker tests passed.
- Headless desktop Chrome browser checks: all eight requested widths (320, 360, 390, 430, 768, 1024, 1280, 1440), English/Russian/French/German, and light/dark.
- Final page confirmation: 384 combinations covering Home, All Journeys, Contact, booking guide, FAQ, and About; no detected overflow or clipped headings/footer columns, and no page errors.
- Final Details/map confirmation: 448 combinations covering all six Details tabs and the transfer map picker; no detected overflow, incorrect interface font families, or page errors.
- Both request flows were walked to review across languages, themes, and widths in the preceding 576-state matrix. Its two French 320px benefit-layout defects were fixed and confirmed by the final matrix. Live submissions were not invoked during verification.
- Interaction checks passed for Home/card CTAs, theme/language controls, filters/sorting, automatic appending, deep back restoration, fallback loading without IntersectionObserver, no-results state, transfer CTA, localized Contact validation, and unchanged option values.
- Checked image loading after forcing lazy images to load; no missing assets in the expanded matrix.
- Mechanical design scan produced advisory token/ramp observations; retained existing scales, media radius, and alpha-mask values are documented in `DESIGN.md`.
- Verification artifacts: [.impeccable/refinement/pages-confirmation.json](/Users/hanafawy/Herd/vtravel-design/.impeccable/refinement/pages-confirmation.json), [confirmation.json](/Users/hanafawy/Herd/vtravel-design/.impeccable/refinement/confirmation.json), and [final-browser-verification.json](/Users/hanafawy/Herd/vtravel-design/.impeccable/refinement/final-browser-verification.json). Browser verification used Chrome; other browser engines were not tested.

## Global typography continuation

- Definitions: `--font-display: 'Cormorant Garamond', Georgia, serif`; `--font-body: 'Manrope', Arial, sans-serif`; `--font-ui: var(--font-body)`.
- Loading: five existing self-hosted `@font-face` declarations at the start of [src/styles.css](/Users/hanafawy/Herd/vtravel-design/src/styles.css), with `font-display: swap`. No page-specific imports or new font family were added.
- Roles: [src/typography.css](/Users/hanafawy/Herd/vtravel-design/src/typography.css) establishes global editorial versus interface usage. Request/dialog headings, cards, prices, forms, footer, and navigation use Manrope; hero and major editorial headings use Cormorant Garamond.
- Removed the blanket serif assignment to every Details heading, the Details price serif declaration, and the booking dialog's page-specific serif assignment. Corrected Contact/path/About interface headings and the payment note to the shared body token; retained responsive sizes.
- Font cmap inspection confirmed the checked Cyrillic glyphs and French/German accents exist in all five bundled font files. Browser computed-font checks confirmed the same family pair across all languages, widths, and themes; long-label layout checks passed. No language-specific font switch was necessary.

## Mobile review continuation — 3 October 2026

- **Primary CTAs:** standardized the approved `#fd5501` background and white text on Explore journeys, mobile-menu CTA, and other primary orange buttons. View all journeys remains secondary/outline. Secondary controls retain their styles.
- **Mobile listing:** removed Grid/List controls from the rendered mobile UI below 768px. The effective card layout is always the shared grid variant with one full-width card per row, regardless of saved desktop preference. Desktop/tablet view controls remain available; resizing back restores that preference. Image ratio remains 16:10.
- **Navigation:** plain links have no chevrons; the desktop Journeys chevron was also removed because no submenu exists. Mobile rows share alignment and minimum 48px height, a restrained text active state, and no individual card borders or shadows. Explore journeys follows the six links, followed by the existing theme control. The menu expands in document flow so it does not overlap page content. Header logo/language/menu controls remain aligned; language is not duplicated in the menu. Escape returns focus to the trigger.
- **Floating actions:** retained their approved position and appearance. Mobile catalog footers reserve horizontal clearance so fixed actions do not cover journey CTAs.
- **Generation retry:** the built-in generator again returned HTTP 429 `usage_limit_reached`. **Image replacement remains pending. Exact assets replaced: none.** Existing Home, catalog, and transfer imagery was retained. The image replacement priorities in sections 10–11 still apply.
- **Verification:** checked 320, 360, 390, and 430px in English, Russian, French, and German, light/dark (32 combinations). Verified no mobile view toggle, one shared grid card per row even with a saved list preference, no horizontal overflow, 16:10 media, card-action clearance, usable filter/sort controls, no navigation-link icons, no duplicate language selector, menu/content separation, aligned touch targets, approved CTA colors, theme switching, and Escape focus restoration. Desktop-to-mobile-to-desktop resizing preserves the desktop list preference. Headless Chrome reported no page errors. Production build passed.
- **Changed files for this continuation:** `src/refinements.css`, `src/views/JourneysPage.vue`, `src/components/SiteHeader.vue`, `DESIGN.md`, this report, and regenerated `dist/`.
- **Evidence:** [mobile-continuation-verification.json](/Users/hanafawy/Herd/vtravel-design/.impeccable/refinement/mobile-continuation-verification.json), with mobile menu captures in the same directory.

## Latest global refinement continuation — 3 October 2026

This section supersedes the earlier Manrope-first font definition and native language select. It extends the existing implementation and preserves request steps, submission adapters, pricing/payment rules, and map behavior.

- **Global fonts:** `--font-display: 'Cormorant Garamond', Georgia, serif`; `--font-body: 'DM Sans', 'Manrope', Arial, sans-serif`; `--font-ui: var(--font-body)`. DM Sans is loaded once in `src/styles.css` from the self-hosted official variable font `public/assets/fonts/dm-sans-variable.ttf`, with `font-display: swap` and its OFL license alongside it. Existing self-hosted display and fallback faces remain global. There are no separate page imports.
- **Multilingual limitation:** the official DM Sans font contains Latin/French/German accents but no Cyrillic glyphs. The same shared font stack therefore falls back to bundled Manrope for Cyrillic. This is glyph fallback, with no font rules per language, theme, route, or breakpoint. Cormorant Garamond retains Cyrillic support. The requested DM Sans family cannot itself render Russian; the fallback is explicitly retained for readability.
- **Removed old assignments:** earlier blanket Details serif headings, price serif, and request-dialog serif declarations remain removed. Shared card shorthand now uses the body token; review avatars also use the UI token. Existing component token references continue to resolve through the global system. Obsolete native-select styling was removed from the refinement stylesheet.
- **Typography:** desktop navigation uses 13px/500 with active 600 and the existing orange underline. Card titles use 22px/600; labels use 500; primary actions use 600; descriptions retain regular weight. Major editorial headings retain Cormorant Garamond. Both themes and all breakpoints retain the same font stack.
- **Sticky header:** shared header uses `position: sticky; top: 0; z-index: 40`. Page roots clip overflow without creating an intervening scroll container. A ResizeObserver measures header height for anchor offsets. Existing native dialog overlays remain above the header.
- **Language control:** compact EN/RU/FR/DE button; dropdown shows English, Русский, Français, Deutsch with code and selected check. Surface, text, borders, hover, and active colors use existing theme tokens. Keyboard arrows/Home/End move focus, Enter selects, Escape restores trigger focus, and outside click/focus dismisses. Language stays exclusively in the mobile header.
- **Mobile navigation and listing:** preserved the six clean links, Explore journeys, and theme control. Ordinary links have no chevrons. Below 768px, view controls are omitted and cards remain one per row; the saved desktop preference survives resizing. Primary `#fd5501` actions use white text; secondary styles remain unchanged.
- **Journey navigation:** all 37 catalog records have distinct `/journeys/{slug}` routes. Image, title, and CTA are coordinated sibling links with no nested controls. Existing populated Luxor Details content is retained; other records show their own supplied catalog information and open the existing request flow. Missing itinerary, inclusions, language, and review data are not invented. Listing state restoration was confirmed after opening Luxor Highlights: 18 cards and the exact 1,800px position returned.
- **Raster audit:** exact assets replaced: **none**. The generation retry returned HTTP 429 `usage_limit_reached`. No programmatic upscale was performed. [Raster asset inventory](./raster-asset-inventory.md) records exact paths, resolutions, page/component locations, and replacement subjects for the entire raster collection and all 37 journey records. Small heroes/thumbnails, team portrait, and off-subject reused gallery/catalog assets remain pending. Current layout continues using aspect ratios, cover sizing, and focal positioning.

- **Latest verification:** production build passed; all seven existing map/location tests passed. Headless Chrome checked 512 page states across 320/360/390/430/768/1024/1280/1440, EN/RU/FR/DE, light/dark, and eight routes (including existing Luxor and new White Desert Details). No horizontal overflow or page errors; sticky header stayed at top 0, computed body font stack stayed consistent, primary `#fd5501` actions had white text, mobile view controls stayed absent, and card links stayed coordinated. Keyboard End/Escape and focus restoration passed in all 64 combinations.
- **Additional verification:** 192 Journey Request/Transfer Request/map-picker dialog states passed font and overflow checks. All 37 distinct Details routes rendered their exact expected English title. Outside dismissal, compact code selection, mobile menu structure, and exact deep listing restoration passed. Font cmap inspection confirms Cyrillic fallback and accented-glyph coverage. Desktop dark German and mobile menu screenshots were visually reviewed. Browser checks used Chrome; other engines were not tested.
- **Evidence:** `.impeccable/refinement/latest-verification.json`, `latest-dialogs.json`, `latest-routes.json`, `latest-links.json`, and `latest-font-coverage.json`; corresponding verification scripts and screenshots are in the same directory.

## USD, geocoding, legal pages, and status badges — final continuation

- **USD-only presentation:** all Journey prices now use [src/utils/currency.js](/Users/hanafawy/Herd/vtravel-design/src/utils/currency.js), shared by Home/catalog/related cards, Details hero, and both Details mobile bars. Compact output is `$120`; explicit output is `USD 120`. Missing/invalid prices return no amount and render the existing translated “Price on request.” All old frontend currency labels and translated demo entries were removed. Demo record currency is explicitly USD; supplied numerical amounts were preserved, with no fabricated exchange rate or repricing. Transfer requests still show no fixed price, and request review/submission logic is unchanged.
- **Geocoding language:** `en` → English, `ru` → Russian, `fr` → French, `de` → German. Map Picker passes the current locale in the optional callback `language` setting for search and reverse lookup. The proxy adapter sends standard `Accept-Language`, preserving existing search/coordinate query parameters and response shapes. A locale change clears stale suggestions and re-resolves the same selected coordinates when a reverse provider exists. Provider-returned readable addresses remain visible; coordinates remain internal. Marker accessibility labels and all existing Map Picker messages use the translation system.
- **Provider limitation:** the geocoding proxy/callback must honor or forward the language preference for localized addresses. The existing unconfigured provider remains unavailable; no production lookup results were fabricated. Leaflet continues using `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Raster tile labels are baked into those images and cannot be translated through CSS or DOM changes. Tile provider and Contact ServiceAreaMap behavior are unchanged.
- **Footer icons:** inspected the existing Lucide registry and custom brand paths. Added the established Font Awesome Free Brands package for Facebook, Instagram, and WhatsApp through `src/components/BrandIcon.vue`; Email retains Lucide Mail. All icons are 20px, centered in consistent 44px areas, use theme text colors, and have accessible names. Configured links get hover/focus states; no social-account URLs were supplied, so existing non-interactive brand placeholders remain. The footer accepts optional `socialLinks` for real URLs. The TheVTravel logo is unchanged. [Font Awesome package documentation](https://docs.fontawesome.com/web/setup/packages)
- **Legal routes:** `/privacy-policy` and `/terms-and-conditions` both use `src/views/LegalPage.vue` and the shared `src/components/LegalContentPage.vue`. Titles, breadcrumb, content-pending message, and update label support all four languages. Records in `src/data/legalPages.js` are ready for localized Admin/API HTML, optional intro, and optional update date. Approved policy copy was not supplied, so no actual privacy or contractual promises were invented.
- **Legal renderer:** `src/services/legalContent.js` sanitizes rich-editor HTML with DOMPurify and a text/table-only allowlist before rendering. Scripts, event handlers, forms, frames, unsafe link URLs, and inline theme overrides are excluded. Headings, paragraphs, strong/emphasis, lists, links, blockquotes, and tables are supported. Table wrappers scroll locally and have keyboard focus plus accessible labels. `src/legal.css` defines a centered 72ch reading measure, comfortable line height, compact hero, existing surface/text/border/link tokens, and responsive typography. H1/H2 use the global editorial serif; long body text uses the shared DM Sans stack. [DOMPurify documentation](https://github.com/cure53/DOMPurify)
- **Legal navigation:** footer legal links now target both real routes in every footer variant; the Contact consent text links to Privacy Policy. New legal reading pages omit the floating action rail to keep it from covering narrow-screen text. The existing transfer dialog remains mounted and accessible from the header; floating positions and behavior on existing pages are preserved.
- **Payment panel:** chose the requested text-led option and removed the oversized HandCoins icon and its unused registry entry. Existing wording is retained, with a restrained orange heading, regular readable body, and existing card/border tokens. No payment or request rules changed.
- **Catalog status tags:** Popular and Best seller remain informational `<span>` elements over the image. Shared styling uses compact 4px/8px padding, approximately 22px height, 3px corners, brand orange, white text, and DM Sans 600. No shadow, transition, transform, click handler, button role, or tab stop. The label keeps a default cursor and intercepts the image link beneath it, so clicking the label itself does not navigate. Card structure, image ratio, links, and business logic are unchanged.
- **Image retry:** image generation again returned HTTP 429 `usage_limit_reached`. Exact raster replacements: **none**. No programmatic upscaling was performed. The [existing exact asset inventory](./raster-asset-inventory.md) remains the source of remaining resolutions, page locations, and required replacement subjects.
- **Verification:** 320 Headless Chrome page states passed: both legal routes, booking guide/payment notice, catalog, and Luxor Details at 320/360/390/430/768/1024/1280/1440, all four languages, light/dark. Checks covered long headings/paragraphs, lists, links, horizontally contained tables, legal footer links, brand icons, non-interactive badges, USD display, sticky header, and no page overflow/errors. Long rich-editor fixtures were test-only and were not published as legal content. Sanitizer checks rejected malicious markup while retaining required formatting. All 11 unit tests passed, including existing map behavior, USD absent-price handling, callback locales, unchanged proxy query contracts, and explicit search after language changes. Evidence: `.impeccable/refinement/legal-currency-verification.json`, with desktop/mobile legal screenshots in the same directory. Chrome was tested; other browser engines were not.
- **Component/integration confirmation:** 16 additional mounted legal-renderer states verified localized content, optional intro/update data, formatting, and script rejection. A mocked-provider browser integration checked both search and reverse calls for EN/RU/FR/DE, readable localized selected addresses, and unchanged confirmed coordinates. This verifies adapter behavior; it does not claim an unavailable production provider works. Header transfer requests also opened correctly on the real legal route. Evidence: `.impeccable/refinement/legal-geocoding-integration.json`.
- **Final visual confirmation:** eight German light/dark states at 320/390/768/1440 verified that legal text has no floating-rail overlap, mobile header transfer access still works, the existing rail returns on Journeys, and badge styles remain unchanged on card hover. Badges have no button role/tab stop, white text, `#fd5501` fill, and no shadow. Desktop/mobile screenshots were reviewed. Evidence: `.impeccable/refinement/legal-badge-confirmation.json`. Final production build passed.
- **Badge click semantics:** final confirmation explicitly clicked each tested status tag and confirmed the route stayed unchanged. Tags retain the default cursor rather than passing clicks through to the underlying image link. This final behavior supersedes the initial matrix's pointer-events observation.

## Journey Details typography-only continuation

- **Scope:** CSS typography only. No component, content, icon, tab, layout-grid, spacing, card-structure, request-flow, or business-logic changes. Hero H1 keeps its existing sizes, Cormorant Garamond, and 600 weight; hero price and main CTA remain strong.
- **Shared rules:** `src/typography.css` defines Journey Details role tokens for section titles, related heading, item titles, body/review body, metadata, helpers, and eyebrows. The same rule applies to Overview, Itinerary, Included, Gallery, Reviews, Good to know, and catalog-only overview content.
- **Section headings:** one `.jd-main .jd-content h2` rule uses Cormorant Garamond 500, 36px desktop/tablet and 28px mobile, line-height 1.2. This replaces the inconsistent 42px tab and 50px Overview presentation. Related heading uses the same display weight at 28px desktop and 24px mobile, remaining secondary to tab content.
- **Excessive weight removed:** removed the blanket 600 assignment from all Details H1/H2/H3/H4 headings and retained 600 explicitly for the hero H1. Included, practical-information, Overview feature, and itinerary item titles now share DM Sans 500 at 18px desktop / 16px mobile with line-height 1.35. Descriptions are regular 400, 15px desktop / 14px mobile, line-height 1.6. Existing tiny mobile descriptive sizes are therefore more readable rather than being reduced further.
- **Other hierarchy:** itinerary times use 500 at 13px. Review names are 14px/500; review text uses regular 400 with 1.65 line-height. Verified/trip metadata is 12px/400; review trust labels, row ratings, and traveler names use 500. Main rating summary remains strong. Eyebrows are 11px desktop / 10px mobile, weight 500, uppercase with restrained .06em tracking. Inactive desktop/mobile/gallery navigation uses 500, active uses 600. Breadcrumb/hero facts use 400. Related Journey titles remain the shared catalog 22px/600; descriptions and metadata are regular, prices and CTAs 600, and rating metadata 500.
- **Verification:** production build passed. Headless Chrome checked all six tabs at 320/360/390/430/768/1024/1280/1440 in EN/RU/FR/DE and light/dark: 384 states, no horizontal overflow or page errors. Computed styles confirmed shared section/item sizes and weights, regular body text, readable mobile descriptions, unchanged hero display weight, shared catalog card titles, and 500/600 navigation states. Traveler-moments name weight was also checked. Desktop Included and mobile Good to know captures were visually reviewed. Evidence: `.impeccable/refinement/details-typography-verification.json` and corresponding `details-type-*` screenshots. Chrome was tested; other browser engines were not.
