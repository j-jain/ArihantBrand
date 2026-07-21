# DESIGN.md — Arihant Group

Aesthetic lane (named): **trade-house signage meets modern Indian retail.** References: the brand's own collateral (white pages, vermillion chevron bullets, charcoal contact panel), stitched fabric labels, painted wholesale-market signage. Explicitly NOT: editorial-magazine (italic display serif + mono labels), SaaS-minimal, luxury-whisper.

Inverse test: a competitor distributor's site is "blue corporate template, stock warehouse photo carousel, WordPress theme." Nothing here may resemble that.

## Color — OKLCH, "Committed" strategy

The brand already committed: vermillion chevron + charcoal + white (identity preservation wins). Vermillion carries CTAs, index marks, and one drenched band per page; charcoal carries full-bleed sections (like their contact page); paper stays neutral (never cream).

```css
:root {
  color-scheme: light;
  --paper:            oklch(0.985 0.002 30);  /* body bg — near-neutral, NOT cream */
  --paper-shade:      oklch(0.955 0.004 30);  /* alternating quiet band */
  --ink:              oklch(0.215 0.010 30);  /* headings, body on paper */
  --ink-soft:         oklch(0.44 0.012 30);   /* secondary text on paper (≥7:1) */
  --charcoal:         oklch(0.245 0.010 30);  /* full-bleed dark bands (their collateral) */
  --charcoal-raise:   oklch(0.30 0.012 30);   /* raised surface on charcoal */
  --on-charcoal:      oklch(0.975 0.003 30);
  --on-charcoal-soft: oklch(0.81 0.008 30);   /* ≥4.5:1 on charcoal */
  --vermillion:       oklch(0.58 0.19 29);    /* brand red #D04030 — large type, marks, drench */
  --vermillion-deep:  oklch(0.485 0.185 29);  /* buttons + red text on paper (≥4.5:1 white-on-it) */
  --vermillion-drench:var(--vermillion-deep); /* red canon: equals --vermillion-deep — one drench/interactive red */
  --line:             oklch(0.885 0.006 35);  /* hairlines on paper */
  --line-dark:        oklch(0.38 0.012 30);   /* hairlines on charcoal */
  --focus:            var(--vermillion-deep);
  /* unit accents (decorative identity only — CTAs stay vermillion sitewide) */
  --unit-marketing:   oklch(0.40 0.15 28);    /* maroon from their logo (#900000) */
  --unit-apparels:    oklch(0.28 0.012 30);   /* ink — crown-black identity */
  --unit-retail:      oklch(0.46 0.17 310);   /* purple from their logo (#7030A0) */
}
```

Rules: buttons/CTAs are always `--vermillion-deep` (one primary action color sitewide). Red canon: `--vermillion-drench` is set equal to `--vermillion-deep` — a single interactive/drench red sitewide (the token name survives for compatibility); `--vermillion` is reserved for large display type and low-alpha motifs. `--unit-*` may color the unit plate, index marks, underlines, and motif tints on that unit's page only. Never gray text on colored grounds — use deeper same-hue or alpha of the text color. No gradients anywhere (flat trade palette); no gradient text; no glassmorphism.

## Typography — Google Fonts, via `next/font`

- **Besley** (variable; weights 500–900 + italic) — display and headings. Clarendon-slab trade-poster DNA: sturdy, warm, established. Set dark and tight; italic only for one-word emphasis inside headings, never whole headlines.
- **Archivo** (variable; width + weight axes) — body, UI, labels, numbers. Signage heritage. Condensed-width caps for big stat figures (`font-stretch` ~85%); `font-variant-numeric: tabular-nums` on all stats.

Both chosen by the register's font procedure (voice words: steadfast / industrious / warm-handshake; reflex picks Fraunces·Inter·Playfair rejected per skill ban list).

Scale (fluid, ratio ≥1.25):

```css
--text-display: clamp(2.6rem, 1.1rem + 5.2vw, 4.75rem); /* Besley 800, lh 1.06, ls -0.015em */
--text-h2:      clamp(2.0rem, 1.1rem + 3.4vw, 3.4rem);   /* Besley 700, lh 1.12 */
--text-h3:      clamp(1.45rem, 1.1rem + 1.4vw, 2.05rem); /* Besley 700, lh 1.2 */
--text-h4:      1.3rem;                                   /* Archivo 650, lh 1.3 */
--text-lead:    clamp(1.13rem, 1rem + 0.5vw, 1.3rem);     /* Archivo 400, lh 1.55 */
--text-body:    1.0625rem;                                /* Archivo 400, lh 1.65 */
--text-small:   0.9375rem;
--text-label:   0.8125rem;                                /* Archivo 650, caps, ls 0.07em */
--text-stat:    clamp(2.6rem, 2rem + 3vw, 4.4rem);        /* Archivo 800 condensed, tabular */
```

`text-wrap: balance` on h1–h3; `text-wrap: pretty` on prose; body measure ≤ 68ch. On charcoal, add +0.07 to line-heights. Display letter-spacing never tighter than −0.04em.

## Hero grammar (kickers retired)

There are no kickers, eyebrows, or thread labels anywhere — the thread-label system was retired. Heroes carry their weight through oversized Besley display type, imagery, and the accent rule alone; headings are written to stand without a tag above them. Hero headlines run short — ≤6 words — with the lead beneath carrying the numbers (the shorter `--text-display` ceiling assumes this). Inner sections get plain scaled headings — no eyebrows, no numbered markers (numbers allowed only inside true sequences like the 4-step partner process).

## Layout grammar

- Container `max-width: 72rem` (`.container-site`); logo walls and full-bleed bands may use `80rem`/full. The header bar and its Businesses disclosure panel are the exception — they run on `.container-header` (80rem). Gutters `clamp(1.25rem, 4vw, 2.5rem)`.
- Section padding `clamp(4.5rem, 9vw, 8.5rem)` between major sections; tight internal groupings (0.75–1.5rem). Vary rhythm deliberately.
- Asymmetric splits (7/5, 8/4) over centered stacks; break the grid for the hero chevron and stat band.
- Page cadence template (vary per page): light hero → proof band (charcoal) → content splits (paper) → drenched vermillion CTA band → footer charcoal. Adjacent sections never share the same background twice.
- Home cadence (as built): hero (paper) → proof (charcoal, `CurtainReveal`) → why-Arihant pillars as a `CardsStack` (paper) → businesses (paper-shade) → infrastructure/systems (charcoal, `InfrastructureSection` — heading across the full measure, then a 2×2 hairline systems ledger beside a full-height godown photo, the whole band sized to read in one screen) → brands marquee (paper) → Trade Notes teaser (paper-shade) → featured-quote strip (paper — 7/5 composite-voice quote beside the real Urban Closet store photo) → drench.
- Heroes run on `.hero-pad`, never `.section-pad`: the sticky header already supplies air above the headline, and the shorter bottom closes the hero near the fold instead of trailing a wide band of unexplained paper. Inner pages and the home page use it alike; `/blog` and `/contact` keep their own compact hero padding.
- `/recognition` (new): hero (paper) → trophy case (charcoal, `CurtainReveal` — CMAI 2015 centrepiece, flanking award cards) → milestones strip (paper-shade, timeline as a 6-up grid) → "What the trade says" `TestimonialColumns` (paper) → "References available on a phone call" drench.
- The chevron motif (from their logo): oversized, cropped off-canvas, low-alpha vermillion — used on the About page only (it is the sole decorative motif; no motif is applied sitewide).
- Cards only where genuinely list-like (brand tiles, store cards); never nested cards, never identical icon-heading-text grids, no side-stripe borders, radius ≤ 12px (buttons/inputs 2px — sharp trade feel).

## Imagery

Real assets first (from the brand profile): 3 store photos (`public/images/photos/`), 77 partner logos (`public/images/partners/`), 3 unit logos, the chevron motif. **The 3 real store photos always outrank stock in placement.**

Stock policy: curated local royalty-free photography (Unsplash/Pexels licenses; commercial use, no attribution required) is downloaded once and committed under `public/images/stock/{hero,trade,retail,blog}/`, ≤450KB each, ~2000–2400px long edge. Pages reference stock ONLY via the typed manifest `src/content/images.ts` (`{src, alt, width, height, credit, sourceUrl}`) — never by ad-hoc path. Authenticity filter: Indian garment-trade context (fabric bolts, garment racks, warehouse shelving, cartons, Indian storefronts/markets, tailoring hands); reject Western-office clichés, visible third-party logos, and AI-looking imagery. Stock is generic trade context and never masquerades as Arihant's own facilities.

Logo tiles: white tile, 1px `--line` border, logo `object-contain` with ~20% padding, uniform 3:2, full color. Photos: full color, slight contrast, 6px radius, 1px border; alt text in brand voice ("Urban Closet, Guwahati — Arihant Retail multi-brand store at night"). Blog cards and post headers use 3:2 thumbnails (`next/image`, explicit dimensions, accurate `sizes`).

## Motion — GSAP

- Stack: `gsap` + `@gsap/react` (`useGSAP`). ScrollTrigger and SplitText are registered exactly once in `src/lib/gsap.ts` (`"use client"`); every animated component imports GSAP only from there. Motion primitives live in `src/components/motion/`. All GSAP plugins are free (Webflow acquisition) — SplitText needs no auth token.
- Smooth scroll: Lenis (`SmoothScroll`, renders nothing) drives page scrolling, synced to the GSAP ticker so ScrollTrigger stays in step (`lenis.on("scroll", ScrollTrigger.update)`, `lagSmoothing(0)`). Strictly opt-in: it bails for reduced-motion, coarse pointers (touch), and viewports < 768px, leaving native scroll untouched so content is never gated behind the smoothing layer. Same-page anchor clicks are delegated to `lenis.scrollTo(hash, { offset: -88 })` to clear the sticky header, and only when the target exists.
- Motion primitives (`src/components/motion/` + a few display components): FlipWords/FlipLead (rotating word in a lead, vermillion underline), VapourText (canvas dissolve on a heading), SplitHeading (line/word split, used inside `SectionHeading`), CurtainReveal (clip wipe on entry), CardsStack (sticky-overlap card stack; every card and the heading rail beside it pin on one shared line, earlier cards tuck back by scale alone, no rotation), TestimonialColumns (vertical marquee columns, hover-paused, edge-masked), NetworkMap (footer dotted map of the Northeast — vermillion reach arcs on a slow staggered GSAP loop, paused offscreen), ParallaxImage `tilt` (pointer-tracked frame tilt via `gsap.quickTo` — rotation ≤2.5°, shift ≤6px, scale ≤1.015; fine pointers ≥1024px only, zero listeners otherwise), and a rebuilt Timeline with a sticky ghost-year rail. Each carries a reduced-motion and mobile fallback.
- All animation is created inside `gsap.matchMedia()` with three contexts: reduced-motion → no-op (content fully visible); mobile ≤767px → short whole-block fades only (no parallax, no SplitText); desktop → full choreography.
- Initial hidden states are set only from JS (`gsap.from`/`gsap.set`), never CSS — content is never stranded if JS fails to run.
- Hero: one orchestrated load; SplitText headline timelines gate on `document.fonts.ready` and revert on cleanup. Stat band counts up on view (rAF, no CLS).
- Scroll: each section gets a reveal fitted to its content (logo wall = batch stagger; splits = directional slide; charcoal bands = at most a single `CurtainReveal` clip wipe on entry, then land still for weight — never a loop, never a per-child fade). Never one uniform fade for everything.
- Marquee (brand logos): CSS transform loop on a duplicated track, pauses on hover/focus, `prefers-reduced-motion` → static wrapped grid. On desktop (non-reduced) a GSAP scroll-velocity skew rides the OUTER `.marquee` wrapper only (clamped ≤4°, eased back to flat), never the track (whose transform the keyframe owns). Edge mask 4%/96% linear-gradient; the home instance renders ~40 logos (every second partner of the 77).
- Header: hides on scroll-down past the hero and re-shows on scroll-up (translate-Y), reverting to visible at the top; the full-width Businesses disclosure panel animates open/closed and is kept out of the SSR DOM while closed.
- Usage discipline (these effects earn their weight by scarcity): FlipWords/FlipLead appears in exactly two places — the home hero lead and the partner hero lead. VapourText appears exactly once — the home infrastructure/systems heading. NetworkMap appears only in the footer. Pointer tilt appears only on photographic images (never logos, cards, or buttons; no magnetic elements anywhere).
- CSS-side transition tokens stay: `--dur-fast: 180ms; --dur: 320ms; --dur-slow: 560ms; --ease: cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quint family). Exits ~65% of enter.

## Components (src/components/)

`Button` (primary/secondary/on-dark, 2px radius, 44px min, chevron-nudge hover) · `SectionHeading` (h2 + optional lead, balance) · `StatBand` (Archivo condensed tabular count-up) · `LogoTile`/`LogoWall` (filterable; tiles are buttons that open the partner `Modal`) + `LogoMarquee` · `UnitShowcase` (page-local in `app/(site)/_components/`; asymmetric 5/7 split row per business, unit-accent themed — the name links to the unit page and a single Explore button, no modal) · `Modal` (native `<dialog>`/`showModal()`: top-layer, Escape, focus containment; body scroll-lock + focus return; GSAP entrance, reduced-motion aware; token-styled paper panel) · `Timeline` (about) · `ProcessSteps` (numbered — true sequence) · `FaqAccordion` (native details/summary styled, JSON-LD paired) · `TestimonialRail` (renders only with published entries; currently unused on any page — kept for CMS-driven reuse) · `StoreCard` · `ContactChannels` (tel/WhatsApp/email per unit) · `InquiryForm` (intent-first multi-step, labeled fields, blur validation, server action) · `StickyActionBar` (mobile: call + WhatsApp + inquiry, appears past hero, safe-area padded) · `SiteHeader` (paper, hairline border, on `.container-header` 80rem; the vermillion CTA button carries `/partner`, and the Partner With Us link is dropped from the primary nav to avoid a duplicate desktop link — it lives only in the footer; mobile sheet menu; a full-width desktop Businesses disclosure panel — each unit's logo + positioning + Explore link, plus an "All 77 labels" footer; hides on scroll-down and re-shows on scroll-up) · `SiteFooter` (charcoal; a top row pairs a Besley reach line and per-unit `ContactChannels` (7) with the `NetworkMap` (5); full NAP, footer nav incl. the Partner link, and legal beneath — no chevron motif) · `JsonLd` · `Reveal` (in-view wrapper honoring reduced motion; GSAP internals).

**Wave-B additions:** `FlipWords`/`FlipLead`, `VapourText`, `SplitHeading` (used inside `SectionHeading`), `CurtainReveal`, `CardsStack` (sticky-overlap stack; cards tuck by scale, no rotation, no cascade — every card pins at `--stack-top`, the same line as the sticky heading rail, whose `min-height` matches a card so the two leave the section level; completes within its own section), `TestimonialColumns` (role-attributed composite voices, monogram avatars), `NetworkMap` (footer map: dotted NE-India silhouette from committed static dot data — no runtime geo/deps — with vermillion reach arcs that pause offscreen and a static fallback under reduced-motion/mobile), `InfrastructureSection` (home systems band: `VapourText` heading and lead across the full measure, then an 8/4 row — the four systems as a 2×2 hairline ledger plus the closing italic line, beside a godown photo whose frame stands the full height of that row via `ParallaxImage fillHeight`; sized so the band reads in one screen on a laptop, stacking below 1024px; the old SVG connector spine is retired), `SmoothScroll` (Lenis, renders nothing). Styles for these live in `src/app/motion.css`. **Removed:** `UnitQuickView` — units no longer open a quick-view modal (the `Modal` primitive stays, now used only by `PartnerModal`).

## Mobile layer (≤767px)

The phone experience is designed, not derived. It keeps the same sections in the same order, the same copy, the same palette and the same two typefaces; what changes is composition, rhythm and interaction.

**Containment rule.** Everything lives in `src/app/mobile.css` (imported last from `globals.css`), and every rule is inside `@media (max-width: 767px)`. Desktop rendering at ≥768px is frozen and provable: strip those media blocks from both builds' compiled CSS and the remainders must be byte-identical. The file is unlayered, so a plain selector beats any Tailwind utility (`gap-12`, `grid-cols-3`, `aspect-[4/5]`) with no `!important`. Inline `style` still wins over CSS, so component-level sizes are written `var(--m-x, <desktop value>)` and retargeted by defining `--m-x` in the mobile token block — on desktop the variable is undefined and the fallback is the original value.

**Type.** The desktop scale bottoms out on its clamp floor at phone widths, collapsing the display-to-h2 step. Mobile redefines the tokens to scale with the handset and widens that step: display `clamp(2.35rem, 9.6vw, 3.05rem)` against h2 `clamp(1.72rem, 6.4vw, 2.05rem)`. Marketing pages read at 16px/1.6; the article body alone runs 17px/1.72.

**Rhythm.** `.section-pad` drops from a 4.5rem floor to `clamp(2.5rem, 8vw, 3.25rem)`. `.m-flow` / `.m-flow-tight` / `.m-flow-loose` replace desktop `gap-8/10/12/14` on section wrappers.

**Idioms.** `.m-bleed` runs photography and dark bands edge to edge (the strongest "made for this screen" cue). `.m-rail` turns a grid into a CSS scroll-snap carousel with a peeking next card — used for business tickets, Trade Notes, stores, the proof strip, testimonials and the recognition cabinet; it works with JS off, and every rail either holds links or carries `tabindex` itself. `.m-cta` stacks calls to action full width. `.press` supplies the tap feedback that hover states cannot.

**Motion.** Mobile is no longer one fade repeated: `HeroIntro` runs the masked line rise at a quicker cadence; `Reveal`'s three variants stay three distinct moves; `StaggerGroup` keeps its direction at half travel and gains `mLedger` (a left-to-right wipe that rules hairline rows in); `ParallaxImage` drifts at half amplitude on `mBleed` frames only; `CardsStack` pins under the header; `Timeline` draws its spine to the thumb; `NetworkMap` draws its arcs once instead of looping. Rails animate with scale and opacity only, never translation, which would grow the scroll area and make the rail twitch.

**Shell.** The menu sheet carries a direct Call/WhatsApp row above the safe-area inset; `StickyActionBar` yields whenever a `.drench-band` or `#inquiry` is on screen, so the page's own ask is never doubled.

## Accessibility & performance bar

Body contrast ≥ 4.5:1 (verify every pairing; muted text included), focus-visible 2px `--focus` ring + 2px offset on ALL interactive elements, skip link, sequential headings, form labels + `aria-live` errors + focus-to-first-error, touch targets ≥ 44px, `tap-highlight` handled. Static generation for every route; `next/image` for all raster; fonts via `next/font` (swap, subset latin); zero third-party scripts (no external `<script>` tags, trackers, or CDN embeds — bundled npm deps like `gsap` and `lenis` are fine); marquee/count-ups cause no CLS (reserve space).
