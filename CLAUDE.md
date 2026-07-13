# Arihant Group Website

Premium, conversion-focused marketing site for the Arihant group (Guwahati): Arihant Marketing, Arihant Apparels, Arihant Retail. Next.js 16 App Router + TypeScript + Tailwind v4 + Sanity (embedded Studio at `/studio`).

**Read before designing or writing UI:** [PRODUCT.md](PRODUCT.md) (who/what/voice/honesty rails) and [DESIGN.md](DESIGN.md) (tokens, type, layout grammar, motion, component specs). They are binding.

> **Next.js 16 warning:** this Next version has breaking changes vs training data (async request APIs, params as Promises, config changes). When unsure about an API, read the bundled docs in `node_modules/next/dist/docs/01-app/` before writing code.

## Hard rules

- All copy/data comes from `src/content/` (seed) or Sanity — never hardcode contact info, stats, or partner names in components.
- No invented facts, numbers, or testimonials. Franchise economics stay qualitative.
- Fonts: Besley (headings) + Archivo (body/UI) via `next/font/google` only.
- Colors: OKLCH tokens from DESIGN.md; CTAs are always `--vermillion-deep`; unit accents are decorative only.
- The thread-label kicker appears once per page (hero only). No eyebrows/numbered markers on inner sections (numbered steps allowed only for true sequences).
- Contrast ≥ 4.5:1 body text everywhere; visible focus rings; `prefers-reduced-motion` alternatives for all animation; content never hidden behind un-triggered animations.
- Every route must build statically and render fully without Sanity env vars (seed fallback via `src/lib/content.ts`).

## Commands

- `npm run dev` / `npm run build` / `npm run lint`
- `npm run seed` — import seed content into a configured Sanity project (see SETUP.md)

## Structure

- `src/app/(site)/` — public routes · `src/app/studio/` — Sanity Studio
- `src/components/` — shared components (see DESIGN.md component list)
- `src/content/` — types + seed content (fallback data source)
- `src/lib/` — content data layer, sanity client, seo helpers
- `src/sanity/` — schemas + studio config
- `public/images/` — logos/, partners/ (77 brand logos), photos/, motifs/
