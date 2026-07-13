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
  --vermillion-drench:oklch(0.52 0.19 29);    /* drenched band bg; white text ≥4.5:1 */
  --line:             oklch(0.885 0.006 35);  /* hairlines on paper */
  --line-dark:        oklch(0.38 0.012 30);   /* hairlines on charcoal */
  --focus:            var(--vermillion-deep);
  /* unit accents (decorative identity only — CTAs stay vermillion sitewide) */
  --unit-marketing:   oklch(0.40 0.15 28);    /* maroon from their logo (#900000) */
  --unit-apparels:    oklch(0.28 0.012 30);   /* ink — crown-black identity */
  --unit-retail:      oklch(0.46 0.17 310);   /* purple from their logo (#7030A0) */
}
```

Rules: buttons/CTAs are always `--vermillion-deep` (one primary action color sitewide). `--unit-*` may color the unit plate, index marks, underlines, and motif tints on that unit's page only. Never gray text on colored grounds — use deeper same-hue or alpha of the text color. No gradients anywhere (flat trade palette); no gradient text; no glassmorphism.

## Typography — Google Fonts, via `next/font`

- **Besley** (variable; weights 500–900 + italic) — display and headings. Clarendon-slab trade-poster DNA: sturdy, warm, established. Set dark and tight; italic only for one-word emphasis inside headings, never whole headlines.
- **Archivo** (variable; width + weight axes) — body, UI, labels, numbers. Signage heritage. Condensed-width caps for the thread-label system and big stat figures (`font-stretch` ~85%); `font-variant-numeric: tabular-nums` on all stats.

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

## The thread-label system (the ONE kicker — named brand system)

A small bordered tag styled like a stitched fabric label: Archivo condensed caps, 1px `--line` border, tiny chevron glyph, e.g. `▸ ARIHANT MARKETING · SINCE THE 1990s`. **Used exactly once per page, in the hero.** Inner sections get plain scaled headings — no eyebrows, no numbered markers (numbers allowed only inside true sequences like the 4-step partner process).

## Layout grammar

- Container `max-width: 72rem`; logo walls and full-bleed bands may use `80rem`/full. Gutters `clamp(1.25rem, 4vw, 2.5rem)`.
- Section padding `clamp(4.5rem, 9vw, 8.5rem)` between major sections; tight internal groupings (0.75–1.5rem). Vary rhythm deliberately.
- Asymmetric splits (7/5, 8/4) over centered stacks; break the grid for the hero chevron and stat band.
- Page cadence template (vary per page): light hero → proof band (charcoal) → content splits (paper) → drenched vermillion CTA band → footer charcoal. Adjacent sections never share the same background twice.
- The chevron motif (from their logo): oversized, cropped off-canvas, low-alpha vermillion on charcoal bands; the red wave motif appears ONCE sitewide (homepage hero) as signature texture.
- Cards only where genuinely list-like (brand tiles, store cards); never nested cards, never identical icon-heading-text grids, no side-stripe borders, radius ≤ 12px (buttons/inputs 2px — sharp trade feel).

## Imagery

Real assets only (from the brand profile): 3 store photos (`public/images/photos/`), 77 partner logos (`public/images/partners/`), 3 unit logos, chevron + wave motifs. Logo tiles: white tile, 1px `--line` border, logo `object-contain` with ~20% padding, uniform 3:2, full color. Photos: full color, slight contrast, 6px radius, 1px border; alt text in brand voice ("Urban Closet, Guwahati — Arihant Retail multi-brand store at night"). No stock photography unless a fold is truly empty — and then only verified-URL Unsplash, searched for the physical object.

## Motion — `motion` library + CSS

- Tokens: `--dur-fast: 180ms; --dur: 320ms; --dur-slow: 560ms; --ease: cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quint family). Exits ~65% of enter.
- Hero: one orchestrated load — headline lines rise with clip reveal (stagger 70ms), thread label fades, stat band counts up on view. Content visible by default; animation enhances (no opacity-0 initial states that can strand content).
- Scroll: each section gets a reveal fitted to its content (logo wall = row stagger; splits = directional slide 16px; charcoal bands = none — they land static for weight). Never one uniform fade for everything.
- Marquee (brand logos): CSS transform loop, pauses on hover/focus, duplicated track for seamlessness, `prefers-reduced-motion` → static wrapped grid.
- All motion inside `@media (prefers-reduced-motion: no-preference)`.

## Components (src/components/)

`Button` (primary/secondary/on-dark, 2px radius, 44px min, chevron-nudge hover) · `ThreadLabel` · `SectionHeading` (h2 + optional lead, balance) · `StatBand` (Archivo condensed tabular count-up) · `LogoTile`/`LogoWall` (filterable) + `LogoMarquee` · `UnitShowcase` (asymmetric split row per business, unit-accent themed) · `Timeline` (about) · `ProcessSteps` (numbered — true sequence) · `FaqAccordion` (native details/summary styled, JSON-LD paired) · `TestimonialRail` (renders only with published entries) · `StoreCard` · `ContactChannels` (tel/WhatsApp/email per unit) · `InquiryForm` (intent-first multi-step, labeled fields, blur validation, server action) · `StickyActionBar` (mobile: call + WhatsApp + inquiry, appears past hero, safe-area padded) · `SiteHeader` (paper, hairline border, CTA button; mobile sheet menu) · `SiteFooter` (charcoal, full NAP ×3 units, nav, legal) · `JsonLd` · `Reveal` (in-view wrapper honoring reduced motion).

## Accessibility & performance bar

Body contrast ≥ 4.5:1 (verify every pairing; muted text included), focus-visible 2px `--focus` ring + 2px offset on ALL interactive elements, skip link, sequential headings, form labels + `aria-live` errors + focus-to-first-error, touch targets ≥ 44px, `tap-highlight` handled. Static generation for every route; `next/image` for all raster; fonts via `next/font` (swap, subset latin); zero third-party scripts; marquee/count-ups cause no CLS (reserve space).
