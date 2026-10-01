# PRODUCT.md — Arihant Group Website

## What this is

The unified web presence of the Arihant group, Guwahati — three businesses under one family umbrella:

1. **Arihant Marketing** (est. ~1990s, registered 1999) — pioneer readymade-garments (RMG) distributor across Northeast India. 30+ years, 15,000 sq ft warehouse, 300+ retailers, 300+ shop-in-shop counters. Awarded **"Best Distributor of India" 2015 by the Clothing Manufacturers Association of India (CMAI)**. Led by Sagar and Anand Sancheti; Sagar Jain is a founder member of NEGTA (North Eastern Garment Traders Association).
2. **Arihant Apparels** (2013, Ajay Sancheti) — the group's second distribution house, building several labels into Northeast category leaders. 9,000 sq ft warehouse. Highest footfall in exhibitions. Mission: foster retailer growth across the region.
3. **Arihant Retail** (2023, Shreyansh Sancheti) — multi-brand modern retail stores (incl. "Urban Closet"). Four trading: 2 company-owned and company-run, 2 franchisee-owned and company-run (K.A.K in Kohima and the Itanagar store). No fit-out pipeline and no store target are stated; both came out at the client's request. Offers a fully-managed franchise/ownership model: hiring, targets, merchandising, marketing, CRM, influencer campaigns all handled by Arihant; zero deadstock; asset-light.

**Brand count, and why two fields exist.** The client's stated figure is **80+ brand partners**. The logo wall renders **77**, because the remaining logo files have not been supplied. `facts.group.brandPartners` (80, stated) and `facts.group.labels` (77, derived from `partners.ts`) are therefore separate fields, and the site says "80+ brand partners" while showing 77 logos. This is a known, deliberate divergence with an end state: when the missing logos land, delete `brandPartners` and point `phrase.groupBrandPartners` back at `labels`. It is the one place the number discipline below is knowingly relaxed.

Group values: **integrity, discipline, trust**. Operating proof: every retailer visited at least once every 20 days; plug-and-play shop-in-shop (SIS) counters needing no fixture investment from the brand, with staff optional (change brief, AM6/AM7/AM9 — the "dedicated SIS team" and NEGTA claims came out of the Marketing FAQ); AI-driven, data-backed retail backend; time-bound work ethos.

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
- Build immediate trust: 35-year legacy, CMAI national award, 300+ retailers, 80+ brand partners, NEGTA founder membership, real people with real phone numbers.
- Convert: WhatsApp first, because that is where this trade already is. A green FAB on desktop and the sticky bar on phones both route by page (Marketing/Apparels to Sagar, Retail/Partner to Shreyansh) and both stand down over a page's own CTA band. Retailer-facing prefills open in Hindi. The inquiry form captures intent-tagged leads and answers "we will call you within one working day"; the brand list is gated on a name and a number.
- Rank: own the empty SERP for "garment distributor Northeast India / Guwahati" and franchise queries (see SEO notes in DESIGN.md and page metadata).

## Voice

Steadfast, industrious, warm-handshake. Short declarative sentences. Numbers over adjectives. First-person plural ("we visit every retailer every 20 days"). Never corporate filler ("solutions", "synergy"), never luxury-brand whisper. English with Indian trade vocabulary used naturally (MBO, SIS). "EBO" is retired from all Arihant-facing copy at the client's request (change brief, AR2); it survives only in the Trade Notes article that explains the format to landlords, where it is industry vocabulary rather than a claim about us.

No dashes in copy: never use em (—) or en (–) dashes in any user-visible text. Restructure with a comma, a colon, or a second sentence instead. Compound-word hyphens (warm-handshake, plug-and-play, zero-deadstock) are fine.

### Repetition discipline

Each flagship fact has one canonical home plus at most one varied echo — say it well once, don't drum it:

- **CMAI 2015 award** → canonical on `/recognition` + the marketing-page award band (echo: the home awards band and the about timeline).
- **20-day visit cycle** → **two statements of the number: the marketing FAQ, and the fourth home "Why us?" card ("In your store every 20 days"), which the client asked for by name in change round 2.** The client's earlier note was that it was repeated too much, and it was: the marketing hero, the "how we work" lead, a marketing strength, the page's own pull-quote, a home pillar and a home funnel card all said it on one scroll. Everything else above the FAQ still says "a fixed cycle" without the numeral, and the home funnel card and the Marketing showcase row no longer carry it. The Trade Notes keep theirs, because they are dated articles arguing the point rather than marketing surface.
- **300+ SIS counters** → the marketing pull-quote + the marketing stat rail, echoed once in the home businesses highlight.
- **Values trio (integrity, discipline, trust)** → about-page values + the footer only.
- **Zero-deadstock** → canonical in the `ModelBoard` pillars, which render on both `/arihant-retail` and `/partner` from one source, so the two pages cannot drift.
- **Retail store split (2 company-owned, 2 franchisee-owned, all company-run)** → the retail page.

## Honesty rails (do not violate)

- No invented numbers, clients, or named individuals. Testimonials are **composite trade voices** attributed by role + town + tenure. The client has been asked for 3-5 real quotes with name, shop, town and written consent (change brief, R8); until those arrive the composites stand, and the policy below governs them (e.g. "Menswear MBO owner — Dibrugarh · Retail partner since 2016"), rendered with monogram avatars — never invented named people, never stock face photos. Each quote reflects only documented service claims. Named, consented quotes replace them via the Studio as they are collected; the `/recognition` page offers "references on a phone call" for serious inquiries rather than parading fake names. The testimonial section renders only when published entries exist.
- Franchise economics stay qualitative ("high-ROI, minimal-risk, proven ROIC record" — the PDF's own claims); no fabricated investment figures or return percentages.
  - This is what shapes the **returns worksheet** in `ModelBoard` (`ReturnsCalculator`). The client asked for a returns calculator; a calculator that outputs a return, a payback period or an ROIC needs an investment amount, and Arihant publishes none. So it is a worksheet on the VISITOR's own numbers: every field opens empty, there are no defaults and no placeholder figures, the arithmetic runs only on what was typed, and a disclosure above the fields says so and is what the dialog's `aria-describedby` points at. The visitor's figures are never put in a URL and never prefilled into the inquiry form, because that would make the "nothing is sent to us" sentence untrue. `src/content/seed.ts`'s `retailModel` holds no number, `facts.ts` holds nothing for it, and the Sanity schema rejects any digit in the ROIC note and the disclosure. If a future edit wants a figure in that module, that is the rail, not an oversight.
- Every stat used comes from the brand profile PDF or public records (CMAI 2015 award, NEGTA founding membership, 1999 registration).
- Number discipline: **every published figure lives in `src/content/facts.ts` and nowhere else.** Copy interpolates from it; nothing types a business number by hand. Figures are explicitly scoped, because group and unit numbers legitimately differ: `facts.group.years` (35+) is the age of the house, `facts.marketing.years` (30+) is how long the distribution arm has traded. The wall counts (`group.labels` 77, `marketing.brandsOnWall` 48, `apparels.brandsOnWall` 29) are DERIVED from `src/content/partners.ts`, so they can never disagree with the logo wall that renders them. The one non-derived exception is `group.brandPartners` (80), documented above. Never restate a number outside `facts.ts`.
- Imagery stays honest: the 3 real store photos are the only images presented as Arihant's own operations. Curated royalty-free stock (committed under `public/images/stock/`, referenced only via the `src/content/images.ts` manifest) is generic trade context and never masquerades as Arihant facilities, staff, or stores. Real photos always outrank stock.

## Site map

- `/` — home (change round 2): the hero fills exactly the first screen at every size: headline, the client's lead ("Let's understand the house of North East India"), the two figure lines ("300+ retailers served", "Catering to 80+ brand partners") and the photograph. Then the two funnel cards ("Shop fast moving brands for your store" → "Partner with us"; "Own a retail store" → "Tap the North East with us"), the charcoal **Awards and testimonials** band (the three awards as a ruled list beside two scrolling columns of trade voices), the "Why us?" card deck, businesses, brands, Trade Notes teaser, CTA. Nothing sits between the funnels and the awards band, or between the awards band and "Why us?".
- `/arihant-marketing`, `/arihant-apparels`, `/arihant-retail` — the three business units.
- `/partner` — the managed-franchise money page (audience 3).
- `/brands` — the full portfolio wall (77 labels).
- `/recognition` — Awards trophy case (CMAI 2015 Best Distributor of India + NEGTA founder membership + highest exhibition footfall) plus a "What the trade says" testimonial-columns section; closes on "references available on a phone call."
- `/careers` was built (change brief, X6) and later removed; nothing links to it and it returns 404. The `careers` inquiry intent remains in the form.
- `/about`, `/blog` (+ `/blog/[slug]`, "Trade Notes"), `/contact`.

The approved **"AI-driven, data-backed retail backend"** claim is no longer marketed anywhere on the site. The home section that carried it qualitatively (data-backed buying, AI-assisted planning, automated stock discipline, teams trained on the tools) was removed. The claim stays on the approved list above, so it can be brought back, but any new placement must stay qualitative and carry no invented metrics.

## CMS

Sanity, embedded Studio at `/studio`. All copy, images, brand partners, stores, testimonials, FAQs, posts, and contact info are editable documents. Code falls back to `src/content/seed.ts` when Sanity env vars are absent — the site must always build and render fully without external services. The blog ("Trade Notes") ships with 8 seeded posts; posts carry an optional thumbnail (`image`) rendered as 3:2 cards and an optional named `author` (name, role, source URL) for notes first published elsewhere, such as Shreyansh Sancheti's LinkedIn posts (change round 2: kept in his own wording, credited to him on the page and as a schema.org `Person` author). Partners carry an optional verified `category` tag shown in the partner modal.
