# SETUP — Arihant Group Website

The site is a Next.js 16 app with an embedded Sanity CMS. **It runs fully without any accounts or env vars** — every page renders from the bundled seed content in `src/content/`. Connecting Sanity (10 minutes, free) is what lets non-technical editors change text, images, brands, stores, FAQs, testimonials, blog posts and contact info, and see form leads.

## 1. Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## 2. Deploy to Vercel

1. Push this repo to GitHub (already at `j-jain/ArihantBrand`).
2. In [vercel.com](https://vercel.com) → Add New Project → import the repo. Framework is auto-detected; no settings needed.
3. Set the env var `NEXT_PUBLIC_SITE_URL` to the final domain (e.g. `https://arihantgroup.in`) so canonical URLs, sitemap and OG tags are correct.
4. Add the Sanity vars from step 3 whenever the CMS is activated (works fine without them until then).

## 3. Activate the CMS (one-time, ~10 minutes)

1. Create a free account at [sanity.io](https://www.sanity.io) (Google login works).
2. Create a new project (name it "Arihant Group"; dataset `production`, private is fine for the dataset visibility since the site reads via API).
3. Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` — from sanity.io → project settings
   - `NEXT_PUBLIC_SANITY_DATASET` — `production`
   - `SANITY_API_TOKEN` — project settings → API → Tokens → create one with **Editor** permissions (used for seeding and for saving form leads)
4. In sanity.io project settings → API → CORS origins: add `http://localhost:3000` and your production domain (with credentials allowed).
5. Import all current content + images:
   ```bash
   npm run seed
   ```
   This upserts everything — site settings, businesses, partners, stores, the 10 composite testimonials, FAQs, blog posts, page copy, and the Awards, System Features and Shop-in-Shop Scope entries. Re-running is safe — it updates rather than duplicates.
6. Add the same three env vars in Vercel → project → Settings → Environment Variables, and redeploy.

## 4. Editing content (for the Arihant team)

Open **`/studio`** on the deployed site (e.g. `arihantgroup.in/studio`) and log in with the Sanity account (invite teammates in sanity.io → project → Members; the free plan includes 3 users).

- **Site Settings** — address, phone numbers, emails, WhatsApp, tagline.
- **Businesses** — the three units' copy, points, stats, CTAs.
- **Brand Partners** — add/remove logos (upload the logo image; keep names exact).
- **Stores** — add new stores with photos as the retail chain grows; set status Open/Fit-out.
- **Testimonials** — the seed ships **10 published composite trade voices** attributed by role + town + tenure (e.g. "Menswear MBO owner — Dibrugarh · Retail partner since 2016"), shown with monogram avatars. They are honest placeholders, not named people. As you collect **named, consented** quotes, add them and tick **Published**, then unpublish the composites; the site shows the section only while published entries exist.
- **FAQs** — per-page questions (partner page, marketing page).
- **Trade Notes** — blog posts (title, excerpt, typed body blocks).
- **Awards & Recognition** — the `/recognition` trophy-case entries (CMAI 2015 Best Distributor of India, NEGTA founder membership, exhibition footfall): year/marker, title, issuer, detail.
- **System Features** — the home infrastructure/systems cards (the qualitative "AI-driven, data-backed retail backend" claim — keep it qualitative, no invented metrics).
- **Shop-in-Shop Scope** — the SIS scope points listed on the marketing page.
- **Pages** — headings, hero copy and meta titles/descriptions per page.
- **Leads** — every inquiry-form submission appears here (New/All views). Update the status as you follow up.

Publishing in the Studio is instant on the CMS side; the live site picks changes up on the next revalidation/deploy. For instant updates, add a Sanity webhook (sanity.io → API → Webhooks) pointing to a Vercel deploy hook URL (Vercel → Settings → Git → Deploy Hooks).

## 5. Where do form leads go?

- With Sanity configured: saved as **Lead** documents, visible in the Studio.
- Without Sanity: appended to `.leads/leads.ndjson` on the server (dev/demo fallback).
- Optional next step: hook an email notification (e.g. Resend) inside `src/lib/leads.ts` where the lead is created.

## 6. Local SEO checklist (recommended, free)

1. Create/claim a **Google Business Profile** for each business at Arihant Tower (they can share the address with different names + floors): Arihant Marketing, Arihant Apparels, Arihant Retail. Use the exact phone numbers and the site URL per business page.
2. Keep the NAP (name/address/phone) on the site's footer identical to the Business Profiles.
3. Submit `https://<domain>/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).
4. Ask brand partners and NEGTA to link to the site where natural.

## Troubleshooting

- **/studio says "not configured"** — the env vars aren't set in that environment (see step 3/6).
- **Images from Sanity don't load** — `next.config.ts` already allows `cdn.sanity.io`; check the browser console for CORS origin issues (step 3.4).
- **`npm run seed` says not configured** — `.env.local` is missing the project ID or token.
