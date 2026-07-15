# PRODUCT.md — Arihant Group Website

## What this is

The unified web presence of the Arihant group, Guwahati — three businesses under one family umbrella:

1. **Arihant Marketing** (est. ~1990s, registered 1999) — pioneer readymade-garments (RMG) distributor across Northeast India. 30+ years, 15,000 sq ft warehouse, 250+ retailers, 45+ brand partners. Awarded **"Best Distributor of India" 2015 by the Clothing Manufacturers Association of India (CMAI)**. Led by Sagar and Anand Sancheti; Sagar Jain is a founder member of NEGTA (North Eastern Garment Traders Association).
2. **Arihant Apparels** (2013, Ajay Sancheti) — among the 5 largest RMG distributors in NE India. 9,000 sq ft warehouse. Highest footfall in the last 4 regional exhibitions. Mission: foster retailer growth across the region.
3. **Arihant Retail** (2023, Shreyansh Sancheti) — multi-brand modern retail stores (incl. "Urban Closet") and EBOs for brand partners. 4 stores + 2 in fit-out; 10 stores targeted by end FY26-27. Offers a fully-managed franchise/ownership model: hiring, targets, merchandising, marketing, CRM, influencer campaigns all handled by Arihant; zero deadstock; asset-light.

Group values: **integrity, discipline, trust**. Operating proof: every retailer visited at least once every 20 days; dedicated plug-and-play SIS (shop-in-shop) team; AI-driven, data-backed retail backend; time-bound work ethos.

## Register

`brand` — marketing surface; design IS the product. Aesthetic lane (named): **trade-house signage meets modern Indian retail** — the brand's own collateral (white pages, vermillion chevron, charcoal panels), fabric-label typography, warehouse-scale confidence. NOT editorial-magazine, NOT SaaS-minimal.

## Platform

`web` — Next.js 16 App Router, static-first, Vercel target.

## Audiences (in priority order)

1. **NE retailers** who want reliable supply of national brands → "Become a retail partner."
2. **National/regional apparel brands** seeking NE India distribution → "Distribute your brand in NE India."
3. **Franchise investors / landlords** considering a managed retail store → "Request franchise details" (`/partner`, the money page).
4. Shoppers looking up the stores (secondary; store info + directions).

## Jobs of the site

- Educate all three audiences about the right business unit fast (intent routing from the homepage).
- Build immediate trust: 35-year legacy, CMAI national award, 250+ retailers, 45+ brands, NEGTA founder membership, real people with real phone numbers.
- Convert: every page drives to one primary CTA; inquiry form captures intent-tagged leads; WhatsApp + click-to-call everywhere (Indian B2B norm).
- Rank: own the empty SERP for "garment distributor Northeast India / Guwahati" and franchise queries (see SEO notes in DESIGN.md and page metadata).

## Voice

Steadfast, industrious, warm-handshake. Short declarative sentences. Numbers over adjectives. First-person plural ("we visit every retailer every 20 days"). Never corporate filler ("solutions", "synergy"), never luxury-brand whisper. English with Indian trade vocabulary used naturally (MBO, EBO, SIS).

## Honesty rails (do not violate)

- No invented numbers, clients, or testimonials. Testimonial section renders only when real entries are published in the CMS.
- Franchise economics stay qualitative ("high-ROI, minimal-risk, proven ROIC record" — the PDF's own claims); no fabricated investment figures or return percentages.
- Every stat used comes from the brand profile PDF or public records (CMAI 2015 award, NEGTA founding membership, 1999 registration).
- Imagery stays honest: the 3 real store photos are the only images presented as Arihant's own operations. Curated royalty-free stock (committed under `public/images/stock/`, referenced only via the `src/content/images.ts` manifest) is generic trade context and never masquerades as Arihant facilities, staff, or stores. Real photos always outrank stock.

## CMS

Sanity, embedded Studio at `/studio`. All copy, images, brand partners, stores, testimonials, FAQs, posts, and contact info are editable documents. Code falls back to `src/content/seed.ts` when Sanity env vars are absent — the site must always build and render fully without external services. The blog ("Trade Notes") ships with 8 seeded posts; posts carry an optional thumbnail (`image`) rendered as 3:2 cards, and partners carry an optional verified `category` tag shown in the partner modal.
