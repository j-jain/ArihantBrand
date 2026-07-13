# Arihant Group — Website

Unified web presence for the Arihant group, Guwahati: **Arihant Marketing**, **Arihant Apparels** and **Arihant Retail** — Northeast India's leading readymade garments distribution and retail house.

Premium, conversion-focused marketing site: intent-routed homepage, a dedicated page per business, a franchise landing page (`/partner`), a 77-label brand portfolio, trade-focused blog, and an inquiry form that captures intent-tagged leads.

## Stack

- **Next.js 16** (App Router, fully static routes) + TypeScript + **Tailwind v4**
- **Sanity CMS** embedded at `/studio` — every piece of copy, imagery and data is client-editable; leads land in the same Studio
- **Seed fallback** — the site builds and renders 100% from `src/content/` with zero env vars; Sanity activates via env (see [SETUP.md](SETUP.md))
- Typography: **Besley + Archivo** (Google Fonts, via `next/font`); OKLCH design tokens; JSON-LD (Organization, WholesaleStore/ClothingStore, FAQ, Article), sitemap, robots, OG

## Quick start

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (all routes static)
npm run seed    # import seed content into a configured Sanity project
```

## Handover

Everything a non-technical editor needs is in **[SETUP.md](SETUP.md)**: Vercel deploy, 10-minute Sanity activation, the editing guide per document type, where form leads appear, and the local-SEO checklist.

Design and content rules for future development are binding in **[PRODUCT.md](PRODUCT.md)** and **[DESIGN.md](DESIGN.md)**.

## Structure

```
src/app/(site)/     public routes (home, 3 business pages, partner, brands, about, blog, contact)
src/app/studio/     embedded Sanity Studio
src/components/     design-system components (see DESIGN.md)
src/content/        typed seed content — the fallback data source
src/lib/            content data layer, Sanity client, leads, SEO helpers
src/sanity/         schemas + desk structure
public/images/      unit logos, 77 partner logos, store photos, brand motifs
```
