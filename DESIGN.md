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
--text-display: clamp(2.7rem, 1.2rem + 6.2vw, 5.6rem);   /* Besley 800, lh 1.04, ls -0.015em */
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

There are no kickers, eyebrows, or thread labels anywhere — the thread-label system was retired. Heroes carry their weight through oversized Besley display type, imagery, and the accent rule alone; headings are written to stand without a tag above them. Inner sections get plain scaled headings — no eyebrows, no numbered markers (numbers allowed only inside true sequences like the 4-step partner process).

## Layout grammar

- Container `max-width: 72rem`; logo walls and full-bleed bands may use `80rem`/full. Gutters `clamp(1.25rem, 4vw, 2.5rem)`.
- Section padding `clamp(4.5rem, 9vw, 8.5rem)` between major sections; tight internal groupings (0.75–1.5rem). Vary rhythm deliberately.
- Asymmetric splits (7/5, 8/4) over centered stacks; break the grid for the hero chevron and stat band.
- Page cadence template (vary per page): light hero → proof band (charcoal) → content splits (paper) → drenched vermillion CTA band → footer charcoal. Adjacent sections never share the same background twice.
- The chevron motif (from their logo): oversized, cropped off-canvas, low-alpha vermillion on charcoal bands; the red wave motif appears ONCE sitewide (homepage hero) as signature texture.
- Cards only where genuinely list-like (brand tiles, store cards); never nested cards, never identical icon-heading-text grids, no side-stripe borders, radius ≤ 12px (buttons/inputs 2px — sharp trade feel).

## Imagery

Real assets first (from the brand profile): 3 store photos (`public/images/photos/`), 77 partner logos (`public/images/partners/`), 3 unit logos, chevron + wave motifs. **The 3 real store photos always outrank stock in placement.**

Stock policy: curated local royalty-free photography (Unsplash/Pexels licenses; commercial use, no attribution required) is downloaded once and committed under `public/images/stock/{hero,trade,retail,blog}/`, ≤450KB each, ~2000–2400px long edge. Pages reference stock ONLY via the typed manifest `src/content/images.ts` (`{src, alt, width, height, credit, sourceUrl}`) — never by ad-hoc path. Authenticity filter: Indian garment-trade context (fabric bolts, garment racks, warehouse shelving, cartons, Indian storefronts/markets, tailoring hands); reject Western-office clichés, visible third-party logos, and AI-looking imagery. Stock is generic trade context and never masquerades as Arihant's own facilities.

Logo tiles: white tile, 1px `--line` border, logo `object-contain` with ~20% padding, uniform 3:2, full color. Photos: full color, slight contrast, 6px radius, 1px border; alt text in brand voice ("Urban Closet, Guwahati — Arihant Retail multi-brand store at night"). Blog cards and post headers use 3:2 thumbnails (`next/image`, explicit dimensions, accurate `sizes`).

## Motion — GSAP

- Stack: `gsap` + `@gsap/react` (`useGSAP`). ScrollTrigger and SplitText are registered exactly once in `src/lib/gsap.ts` (`"use client"`); every animated component imports GSAP only from there. Motion primitives live in `src/components/motion/`.
- All animation is created inside `gsap.matchMedia()` with three contexts: reduced-motion → no-op (content fully visible); mobile ≤767px → short whole-block fades only (no parallax, no SplitText); desktop → full choreography.
- Initial hidden states are set only from JS (`gsap.from`/`gsap.set`), never CSS — content is never stranded if JS fails to run.
- Hero: one orchestrated load; SplitText headline timelines gate on `document.fonts.ready` and revert on cleanup. Stat band counts up on view (rAF, no CLS).
- Scroll: each section gets a reveal fitted to its content (logo wall = batch stagger; splits = directional slide; charcoal bands = none — they land static for weight). Never one uniform fade for everything.
- Marquee (brand logos): CSS transform loop, pauses on hover/focus, duplicated track for seamlessness, `prefers-reduced-motion` → static wrapped grid.
- CSS-side transition tokens stay: `--dur-fast: 180ms; --dur: 320ms; --dur-slow: 560ms; --ease: cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quint family). Exits ~65% of enter.

## Components (src/components/)

`Button` (primary/secondary/on-dark, 2px radius, 44px min, chevron-nudge hover) · `SectionHeading` (h2 + optional lead, balance) · `StatBand` (Archivo condensed tabular count-up) · `LogoTile`/`LogoWall` (filterable; tiles are buttons that open the partner `Modal`) + `LogoMarquee` · `UnitShowcase` (asymmetric split row per business, unit-accent themed; opens a business quick-view `Modal`) · `Modal` (native `<dialog>`/`showModal()`: top-layer, Escape, focus containment; body scroll-lock + focus return; GSAP entrance, reduced-motion aware; token-styled paper panel) · `Timeline` (about) · `ProcessSteps` (numbered — true sequence) · `FaqAccordion` (native details/summary styled, JSON-LD paired) · `TestimonialRail` (renders only with published entries) · `StoreCard` · `ContactChannels` (tel/WhatsApp/email per unit) · `InquiryForm` (intent-first multi-step, labeled fields, blur validation, server action) · `StickyActionBar` (mobile: call + WhatsApp + inquiry, appears past hero, safe-area padded) · `SiteHeader` (paper, hairline border, CTA button; mobile sheet menu) · `SiteFooter` (charcoal, full NAP ×3 units, nav, legal) · `JsonLd` · `Reveal` (in-view wrapper honoring reduced motion; GSAP internals).

## Accessibility & performance bar

Body contrast ≥ 4.5:1 (verify every pairing; muted text included), focus-visible 2px `--focus` ring + 2px offset on ALL interactive elements, skip link, sequential headings, form labels + `aria-live` errors + focus-to-first-error, touch targets ≥ 44px, `tap-highlight` handled. Static generation for every route; `next/image` for all raster; fonts via `next/font` (swap, subset latin); zero third-party scripts; marquee/count-ups cause no CLS (reserve space).
