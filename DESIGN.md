---
name: TheVTravel
description: Warm editorial travel design for calm, personal journeys across Egypt.
colors:
  navy: "#002040"
  navy-deep: "#00182f"
  orange: "#fd6803"
  action-orange: "#ed8500"
  orange-hover: "#9a4e00"
  turquoise: "#009fc0"
  warm-ivory: "#faf6f2"
  card: "#ffffff"
  muted-blue: "#435d77"
  border: "#ded8d2"
  border-soft: "#ede7e1"
  cta-warm: "#f8eee5"
  night: "#001122"
  night-text: "#f6eee9"
  journey-details-navy: "#011947"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "66px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.018em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "38px"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "27px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.013em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.13em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "5px"
  lg: "10px"
  pill: "999px"
  circle: "50%"
spacing:
  page-gutter: "clamp(28px, 4.72vw, 68px)"
  grid-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.action-orange}"
    textColor: "{colors.card}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 19px"
    height: "43px"
  button-primary-hover:
    backgroundColor: "{colors.orange-hover}"
    textColor: "{colors.card}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 19px"
    height: "43px"
  eyebrow:
    backgroundColor: "transparent"
    textColor: "{colors.turquoise}"
    typography: "{typography.label}"
  text-field:
    backgroundColor: "{colors.card}"
    textColor: "{colors.navy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 15px"
    height: "52px"
  journey-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.navy}"
    rounded: "{rounded.xs}"
    padding: "18px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 13px"
  accordion:
    backgroundColor: "{colors.card}"
    textColor: "{colors.navy}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "52px"
  process-step:
    backgroundColor: "color-mix(in srgb, #ffffff 34%, transparent)"
    textColor: "{colors.navy}"
    rounded: "{rounded.lg}"
    padding: "18px 11px 17px"
  journey-details-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "9px 17px"
    height: "46px"
  reassurance-panel:
    backgroundColor: "color-mix(in srgb, #fd6803 6%, #faf6f2)"
    textColor: "{colors.navy}"
    rounded: "{rounded.lg}"
    padding: "18px 28px"
---

# Design System: TheVTravel

## Overview

**Creative North Star: "The Nile Travel Journal"**

TheVTravel feels like a well-kept travel journal opened beside the Nile: warm, spacious, personal, and quietly assured. Editorial serif typography gives destinations and promises a sense of place, while compact sans-serif interface copy keeps planning direct and dependable.

The system is light and image-led, with warm paper surfaces flowing into Egyptian travel photography through soft masks rather than hard frames. Deep navy provides structure, turquoise marks orientation, and orange is reserved for actions, active states, fine rules, route lines, and small moments of guidance.

**Key Characteristics:**

- Warm ivory editorial canvases with pale, precise separators.
- Deep navy Cormorant Garamond headings paired with Manrope interface copy.
- Turquoise uppercase eyebrows and restrained orange interaction accents.
- Felucca, Nile, monument, and journey photography softened into the page.
- Generous desktop compositions that stack into direct single-column mobile flows.
- Shared, logo-led navigation and a calm information-rich footer.

## Colors

The palette combines Nile-depth navy and sun-warmed orange with turquoise wayfinding and paper-like neutrals.

### Primary

- **Nile Navy:** The structural color for headings, body emphasis, navigation, icons, and dark feature bands.
- **Journey Orange:** The scarce accent for route drawings, active markers, selection, and the most important interactions.

### Secondary

- **Horizon Turquoise:** Uppercase eyebrows, secondary wayfinding, and occasional geographic or progress detail.
- **Action Amber:** Filled primary actions; its warmer, slightly softer tone separates utility from the brighter route accent.

### Neutral

- **Warm Ivory:** The principal page canvas; never a clinical white background.
- **Card White:** A restrained lift for cards, menus, accordions, and fields.
- **River Slate:** Secondary copy and supporting metadata.
- **Papyrus Line:** Standard borders and dividers.
- **Soft Papyrus Line:** Quiet section boundaries and internal separators.
- **Sand Wash:** Warm callout and editorial feature surfaces.
- **Night Nile / Moonlit Ivory:** The dark-mode canvas and inverse text pairing.

### Named Rules

**The Orange Thread Rule.** Orange should read as a continuous journey cue: actions, short rules, route lines, active states, and icon outlines—not as a large-area background.

**The Paper, Not White Rule.** Large light surfaces use warm ivory; pure white is reserved for contained elements that need subtle separation.

## Typography

**Display Font:** Cormorant Garamond (with Georgia and serif fallbacks)  
**Body Font:** Manrope (with Arial and sans-serif fallbacks)

**Character:** The pairing is literary without becoming ornate. Cormorant Garamond carries destination emotion and editorial hierarchy; Manrope makes navigation, forms, metadata, and booking guidance feel contemporary and exact.

### Hierarchy

- **Display** (600, 66px, 1): Hero statements, usually held to a compact two-line block; mobile versions step down with a fluid or breakpoint-specific size.
- **Headline** (600, 38px, 1.08): Section introductions and major calls to action.
- **Title** (600, 27px, 1.1): Journey cards and prominent content titles.
- **Body** (400, 15px, 1.65): Explanatory copy, with narrower measures around 360–520px in editorial layouts.
- **Label** (600, 12px, 0.13em letter spacing): Uppercase eyebrows and compact UI labels; dense utility variants may step down to 10–11px without changing family.

### Named Rules

**The Two-Voice Rule.** Serif type expresses place and promise; sans-serif type handles every action, label, instruction, and piece of operational detail.

**The Compact Hero Rule.** Large headings are tightly led and slightly tracked in, with line breaks chosen for a composed editorial silhouette rather than a wide banner.

## Layout

The core page container is capped at 1304px and uses a fluid side gutter. Desktop layouts favor clear two- or three-part grids with 28px as the recurring inter-column gap, while important hero copy sits on the container's left edge and photography occupies or bleeds through the right side.

At tablet widths, primary navigation collapses into a menu, dense grids reduce their column count, and split compositions rebalance before stacking. On narrow screens, the gutter becomes 20px, content moves into a single column, photography shifts below hero copy, horizontal route decoration simplifies or disappears, and primary actions expand when the task benefits from a full-width control.

Sections use generous vertical breathing room, but controls and metadata remain compact. Image masks and gradients create continuity between copy and photography; they must not reduce text contrast or place critical content over busy images.

Sequential explanations use a legible card grid rather than checkout chrome: six columns on wide screens, three at tablet widths, two on mobile, and one on the narrowest phones. Numbering, circular orange icon fields, and short internal rules carry the sequence; the DOM reading order remains unchanged at every breakpoint.

**The Editorial Split Rule.** On wide screens, pair a composed text block with an immersive visual field; on mobile, preserve the reading order by stacking copy before imagery.

## Elevation & Depth

The system is flat by default. Depth comes from tonal layering, pale borders, masked photography, and overlapping route illustrations rather than persistent card shadows. Shadows appear sparingly on primary actions and temporary navigation surfaces, where they communicate affordance or overlay state.

### Shadow Vocabulary

- **Action Lift** (`0 4px 12px rgba(142,75,0,.16)`): A subtle warm shadow beneath filled primary actions.
- **Menu Float** (`0 18px 36px rgba(0,20,40,.16)`): Structural elevation for the open mobile navigation only.
- **Field Focus** (`0 0 0 3px rgba(221,121,8,.13)`): A low-opacity orange halo paired with an orange border on focused fields.

### Named Rules

**The Flat-by-Default Rule.** If a surface can be separated with spacing, tone, or a one-pixel border, do not add a shadow.

## Shapes

TheVTravel uses restrained geometry. Cards, fields, buttons, and accordion containers sit between 2px and 10px radii; they should feel gently finished, never bubbly. Circular forms are reserved for icon medallions, journey steps, route nodes, and map markers, while chips alone use a full pill shape.

Borders are thin and pale. Large photography is generally unrounded and integrated into the composition with gradients or masks. Fine curved route lines and small circular nodes form the recurring signature silhouette.

**The Circles Mean Guidance Rule.** Use circles for landmarks, steps, people, reassurance, and wayfinding—not as a generic container for every control.

## Components

Components are refined and restrained: compact controls, quiet borders, clear states, and a single decisive accent.

### Buttons

- **Shape:** Gently squared corners (3px) with a minimum height of 43px and compact horizontal padding.
- **Primary:** Warm action-orange fill, white text, semibold Manrope, and a low warm shadow.
- **Hover / Focus:** Hover deepens the orange; keyboard focus uses a visible three-pixel translucent orange outline with offset.
- **Secondary / Outline:** Transparent background, navy text, and a cool muted border; no resting shadow.

### Chips

- **Style:** Transparent fill, thin pale border, muted navy text, and a full pill silhouette.
- **State:** Chips remain visually secondary; selected or actionable states should use an established accent rather than introduce a new color.

### Cards / Containers

- **Corner Style:** Nearly square journey cards (2px); utility containers and accordions may use a softer 5–10px radius.
- **Background:** Card white or a translucent white wash over warm ivory.
- **Shadow Strategy:** Flat at rest; rely on a one-pixel border and tonal contrast.
- **Border:** Papyrus line for the perimeter and soft papyrus for internal dividers.
- **Internal Padding:** Typically 18px for content cards, with larger editorial features using 20–29px.

### Inputs / Fields

- **Style:** Warm translucent-white field, one-pixel neutral stroke, 5px radius, 15px horizontal inset, and a 52px standard height.
- **Focus:** Orange border plus a restrained three-pixel warm focus halo.
- **Error / Disabled:** Errors use a dark brick-red border and message; disabled actions remain legible, preserve context, and use a not-allowed cursor.

### Navigation

The shared header is logo-led and uses compact Manrope links. The active page receives a thin orange underline rather than a filled tab. At 1023px and below, links move into a bordered elevated menu; the brand and menu trigger remain visible, and the header call to action is removed on the narrowest screens.

### Journey Card

Photography occupies the card's upper field at a fixed crop, followed by a serif title, compact metadata, descriptive copy, outlined feature chips, and a footer divided by a soft line. The card is information-rich but visually flat, with hierarchy created by type and spacing rather than decoration.

### Process Step

Numbered process steps use tall, softly rounded paper cards with a centered circular orange icon field, a Manrope title, a short orange rule, and concise explanatory copy. The system communicates sequence through order and repeated landmarks, without borrowing the visual language of carts, payment forms, or account setup.

### Reassurance Panel

Important booking conditions sit directly after the relevant process as a full-width, softly rounded panel. Use a faint orange-tinted paper surface, a thin orange-mixed border, and one orange line icon; keep the statement direct and the supporting sentence short.

### Editorial Image Panel

Hero and call-to-action photography is edge-to-edge and typically blended into a warm paper or navy surface with a directional mask. Feluccas, the Nile, monuments, and candid travel moments are the preferred visual vocabulary; crop for atmosphere while keeping the subject legible.

### Journey Details — scoped surface

The approved Journey Details references govern `/journeys/luxor-west-bank-at-dawn`. This is one reusable page with query-backed section content. These scoped choices do not replace the shared site rules.

- **Shared shell:** Reuse the exact `SiteHeader` and `SiteFooter` with its booking variant from `/journeys`, without route-specific header styling or duplicate markup. Inherit the global language and theme controls, logo, mobile menu, responsive behavior, and theme-dependent header. The shared Journeys active-link behavior also recognizes the Journey Details route. The body inherits the existing root theme state and tokens in every section, on desktop and mobile, including the booking bar, bottom navigation, and More menu. Theme selection persists when arriving from `/journeys`; no independent theme state or forced light color scheme is introduced.
- **Color roles:** The scoped foreground alias uses Journey Details Navy in light mode and inherits shared text in dark mode. Page and card surfaces, supporting text, borders, hover/active washes, menu surfaces, and button hover states use the existing theme variables. Use the existing brand-orange variable for actions, section selection, icons, stars, timeline rules, and distribution bars. The immersive viewer uses shared deep navy and inverse-text tokens. Preserve the shared theme contract rather than introducing independent Journey Details colors.
- **Typography and hero:** Inherit Cormorant Garamond for editorial headings and Manrope for interface copy. The desktop title scales from 42–54px and steps down to 32px on mobile; section headings step from 42px to 33px. Use the 1304px container, 40px desktop gutters, and a two-column hero with a slightly narrower summary column. Preserve the same hero across all sections. Keep its main photograph clean, without a photo-count overlay. At 767px and below, show the full-width photograph above the summary, use 18px content gutters, and reserve space below the footer for fixed controls and device safe areas.
- **Desktop navigation:** Six text-only section buttons, in order: Overview, Itinerary, Included, Gallery, Reviews, Good to know. Selection uses orange text and a thin underline. The `section` query parameter supports direct links and browser history.
- **Mobile navigation:** Exactly five bottom controls: Overview, Itinerary, Gallery, Reviews, More. More opens Included and Good to know above the fixed price/request bar. Preserve its active state when either option is selected, the highlighted active option, current/expanded semantics, Escape dismissal, and focus return. Selecting a section scrolls and focuses its content.
- **Section patterns:** Overview pairs an editorial introduction and decorative line art with feature cards; Itinerary combines a compact numbered orange timeline with explicit video media; Included uses one bordered desktop container with two columns and subtle dividers; Gallery offers Official photos and Traveler moments as internal states; Reviews pairs ratings with traveler copy and photos; Good to know uses compact icon-led practical information rows.
- **Related journeys:** Every section ends with You might also like, followed by the shared footer. Use a horizontal scroll-snap carousel with side arrows and uniform cards: three visible on desktop, two at 768–999px, one on mobile. Images use the same 2:1 landscape ratio at every viewport, with cover sizing and intentional subject crops, followed by a serif title and short description. Circular orange outline arrows stay vertically centered on the card row and use shared themed card surfaces. Respect reduced motion for carousel scrolling.
- **Media model:** Images and videos use explicit types. Render optional video only when its type is video and its source is a nonempty usable HTTP, HTTPS, blob, or relative web source. An absent or invalid source omits the entire component: no poster, play control, caption, status, placeholder, or reserved column. Without video, the itinerary becomes a full-width single-column grid with descriptive copy capped at 75ch. A valid video restores the two-column desktop layout automatically and enables native playback with controls, inline playback, optional poster/captions, and a 1.6:1 card. Runtime media errors remove the component and restore the timeline layout.
- **Gallery viewer:** Gallery and review thumbnails open a fullscreen dark viewer built on native dialog semantics. Preserve the active image's aspect ratio with contain sizing, a top-right close control, previous/next arrows, caption/source, and live image counter. Desktop includes a horizontally scrolling thumbnail strip with an orange active border; mobile uses an immersive image stage with horizontal touch swipe and minimal controls. Support arrow keys and Escape, scroll locking, visible keyboard focus, and returning focus to the trigger. Gallery mode remains query-backed with `gallery=traveler-moments`; official photos are the default and traveler photo groups stay distinct.
- **Booking:** The primary request action and secondary question action pass the journey name and request subject to the existing contact form. Mobile retains the request action and theme-aware per-person price in a sticky bar above the bottom navigation. Preserve the no-online-payment reassurance.
- **Shape and depth:** Hero photography and video use 8px radii, outlined cards mostly use 5–9px radii, and action buttons use 5px. Cards remain flat; the mobile More overlay uses a restrained navy shadow. State color transitions run for 150ms only when reduced motion is not requested. Focus remains visible on interactive controls.
- **Verification evidence:** The latest refinement was reviewed across 28 desktop/mobile, light/dark, and section/gallery-state combinations; captures are stored in `.impeccable/review/themes`. Browser checks also verified desktop/mobile carousel next, fullscreen gallery next/close, and persistent dark theme from `/journeys`.

## Do's and Don'ts

### Do:

- **Do** begin new surfaces from the shared warm ivory, navy, turquoise, and orange vocabulary.
- **Do** use Cormorant Garamond for emotional hierarchy and Manrope for every operational layer.
- **Do** preserve generous editorial whitespace while keeping controls compact and scannable.
- **Do** blend Egyptian travel photography into the page with intentional masks or gradients.
- **Do** provide visible focus, hover, active, expanded, current, error, and disabled states where applicable.
- **Do** stack split layouts into a logical single-column reading order on mobile.

### Don't:

- **Don't** flood a screen with orange; its scarcity makes the journey thread and primary action meaningful.
- **Don't** substitute bright white for the warm paper canvas or add cool gray surfaces that flatten the atmosphere.
- **Don't** use heavy shadows, glassmorphism, oversized radii, or floating rounded cards as the default layout language.
- **Don't** place editorial serif type on controls, labels, form help, or navigation.
- **Don't** hard-cut photography into the copy field when a soft mask is part of the composition.

## Global frontend refinement — October 2026

The recent Journey Details, Journey Request, Transfer Request, and Contact surfaces remain the visual authority. This pass preserves their warm surfaces, theme tokens, request steps, maps, and floating actions.

- **Typography:** Load the existing self-hosted Cormorant Garamond (500/600) and Manrope (400/500/600) once from `src/styles.css`. `--font-display` is the editorial serif; `--font-body` is the interface sans; the existing `--font-ui` aliases `--font-body`. `src/typography.css` assigns the same families across all routes, themes, languages, and breakpoints. Hero/H1 and major section/H2 headings use the serif. Cards, metadata, prices, navigation, footer, form/request titles, tabs, and controls use Manrope. UI text uses 14–16px where needed, with 16px mobile form fields. Existing responsive editorial sizes of 42/48px and existing 8px media corners remain intentional. Mask black is an alpha mask, not an interface palette addition.
- **Discovery:** Home retains its hero, followed by three featured catalog cards, four compact benefits, three represented destinations, and the existing transfer banner. Explore journeys uses the required `#fd5501`; white text follows the approved CTA combination. All journeys remains in primary navigation.
- **Cards and media:** `JourneyCard` owns the incumbent listing visual. The compatibility listing wrapper and related carousel reuse it. Card media uses the shared `--journey-image-ratio: 16 / 10`, cover sizing, and optional source focal position. Details can crop the same source differently. The Luxor catalog record derives title, price, image, alt, rating, and slug from the details record.
- **Browsing:** Append nine local records per batch, prefetch with a 240px observer margin, and keep an accessible Load more fallback. Session state saves destination, interest, sort, view, loaded batch count, and scroll position. Filter changes reset batches; loading cannot overlap; the final batch exposes a completion message.
- **Language:** `src/i18n.js` owns English (default), Russian, French, and German. The shared themed language selector appears in desktop and mobile headers. The mobile theme toggle sits in the navigation drawer. Demo translations are local data; callers can supply localized `{ en, ru, fr, de }` content records. Internal form values and user-entered details remain unchanged.
- **Icons:** One semantic UI registry wraps Lucide's official Vue package. Social brand artwork and intentional decorative route linework remain separate.
- **Responsive:** Cards stack on phones; filters use a compact horizontal row; desktop filters wrap long labels; narrow Details benefits reflow to one column; carousel arrows stay inside the content bounds; footer columns use zero-minimum tracks. Existing fixed floating action positioning, alpha, and Details bottom-navigation clearance are preserved.

### Mobile review continuation

Primary orange CTAs use `#fd5501` with white text; outline/secondary controls retain their styling. Below 768px, the catalog always renders the grid card variant in one column and omits view controls, while preserving the desktop view preference. Mobile card footers reserve clearance from the existing fixed action rail. The mobile navigation is a plain vertical list in document flow beneath the header, followed by Explore journeys and the existing theme control, with no submenu chevrons on ordinary links. Language selection remains exclusively in the header. Image generation was retried and remained blocked by the account usage limit; no asset replacement occurred.

### Global type, header, and routing continuation

The latest request supersedes the earlier Manrope body choice: load self-hosted DM Sans variable (100–1000) once in `src/styles.css`. Use `--font-body: 'DM Sans', 'Manrope', Arial, sans-serif`, `--font-ui: var(--font-body)` and the existing Cormorant Garamond display token. DM Sans has no Cyrillic glyphs, so the same shared stack uses bundled Manrope for those glyphs; there is no locale-specific CSS. Major editorial headings retain the serif; interface/card headings use the body token. Desktop navigation is 13px/500 with active 600; card titles and primary actions are 600.

Header is sticky at top 0 with measured height for anchor offsets and page overflow clipping that does not establish an intervening scroll container. The language button displays EN/RU/FR/DE and opens native language names in a token-themed listbox with roving keyboard focus, Escape, and outside dismissal. Plain navigation links have no submenu arrows.

All 37 catalog records have distinct stable demo slugs and coordinated sibling image/title/CTA links. Existing populated Luxor Details content is retained. Other records use supplied catalog content and the existing request flow without invented itinerary/review data. Catalog source images also populate their Details hero; pending subject mismatches and source resolutions are documented in `docs/raster-asset-inventory.md`.

### USD and legal reading continuation

All monetary presentation uses `src/utils/currency.js` and USD, preserving supplied demo numbers. Missing prices remain “Price on request”; no transfer prices or exchange rates are inferred. Legal pages share one compact-title layout and 72ch reading measure, using the current global font stack and theme tokens. Rich-editor HTML is sanitized with a conservative text/table allowlist; table regions scroll independently on narrow screens. Approved policy copy will come from localized Admin/API records. The floating rail is omitted only on these new reading pages, while header transfer requests still use the existing dialog.

Footer social marks use Font Awesome Free Brands; general interface icons continue using Lucide. The payment notice is text-led with no icon. Catalog Popular/Best seller labels are compact white-on-orange informational spans with 3px corners, no shadow/interaction, and the shared body font at 600.

Geocoding uses optional callback language codes and the standard Accept-Language header; providers must honor this preference. Existing raster OpenStreetMap tile labels remain supplied by the map source.

### Journey Details typography hierarchy

Typography-only roles live in `src/typography.css`: tab H2s share editorial 36px/500 on desktop and 28px/500 on mobile; item titles share body 18px/500 and 16px/500. Descriptions are regular 15px/14px with 1.6 line-height, reviews 1.65, metadata 12px regular, and small uppercase eyebrows 500. Related section heading stays below tab-title scale; shared Journey card titles remain 22px/600. Inactive tabs use 500 and active 600. Hero H1, price, CTA, existing spacing, grids, icons, content, and request behavior remain unchanged.
