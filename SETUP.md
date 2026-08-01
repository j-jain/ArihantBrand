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
4. Add the Sanity vars from section 3 whenever the CMS is activated (works fine without them until then).

## 3. Activate the CMS (one-time, ~10 minutes)

1. Create a free account at [sanity.io](https://www.sanity.io) (Google login works).
2. Create a new project (name it "Arihant Group"; dataset `production`, private is fine for the dataset visibility since the site reads via API).
3. Open `.env.local` in the project root (already created, gitignored; if missing, copy `.env.example`) and fill:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` — from sanity.io → project settings
   - `NEXT_PUBLIC_SANITY_DATASET` — `production`
   - `SANITY_API_TOKEN` — project settings → API → Tokens → create one with **Editor** permissions (used for seeding and for saving form leads)
4. In sanity.io project settings → API → CORS origins: add `http://localhost:3000` and your production domain (with credentials allowed).
5. Import all current content + images:
   ```bash
   npm run seed
   ```
   This upserts everything: site settings, businesses, partners, stores, the 10 composite testimonials, FAQs, blog posts, page copy, the Awards entries, the team roster, the recognition photographs and the list of site photographs.

   > **Run this ONCE, before anyone starts editing.** It overwrites Studio content with the version shipped in the code. Once the team has begun editing in `/studio`, running it again wipes their work.

6. Add the same env vars in Vercel → project → Settings → Environment Variables, and redeploy. Include `SANITY_REVALIDATE_SECRET` (any long random string) alongside the three Sanity vars.
7. Create the webhook that makes edits appear on the live site. In sanity.io → project → **API → Webhooks → Create webhook**:

   | Field | Value |
   |---|---|
   | Name | `Live site revalidate` |
   | URL | `https://<your-domain>/api/revalidate` |
   | Dataset | `production` |
   | Trigger on | Create, Update **and** Delete |
   | Filter | `_type != "lead"` |
   | Projection | leave blank |
   | HTTP method | `POST` |
   | API version | `v2025-06-01` |
   | Secret | the same string you put in `SANITY_REVALIDATE_SECRET` |
   | Drafts | leave off, so unpublished drafts never reach the live site |

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
- **Home Funnel Cards** — the two audience cards on the home page (stock our brands / own a managed store). The **Selector id** must stay `retailer` or `franchise`, because it is what routes the card to the matching inquiry-form intent. Change the title, text and CTA freely; do not rename the id.
- **Group Stats**, **Why-Arihant Pillars**, **Value Panels**, **Timeline**, **Partner Process Steps** — the numbered/listed blocks on the home, about and partner pages.
- **Marketing Strengths / Steps / Reasons** — the three list blocks on the Arihant Marketing page.
- **Pages** — headings, hero copy and meta titles/descriptions per page.
- **Site Photographs** — every photograph on the site, one entry per position ("Home: hero", "Marketing: godown", and so on). Upload a file to replace what the site ships with, and write alt text describing what is actually in the picture. Leave the image empty and the position keeps its current photograph, so nothing can end up blank.
- **Recognition Photos** — the certificates and trophies on `/recognition`. Upload the photograph, write the alt text and the caption.
- **Team Members** — the roster shown on the unit pages. Real people only.
- **Leadership Portraits** — see below.
- **Brand Partners** also carry a **Wall rank**. Rank 1 shows first on the brand wall, so the labels a retailer recognises lead. Leave it blank and the brand simply follows in alphabetical order.
- **Leads** — every inquiry-form submission appears here (New/All views). Update the status as you follow up.

### Leadership portraits (`/about`, "The people on the door")

Each card shows a monogram plate sized to a portrait until a real photograph is
supplied. To add one, in the Studio:

1. Open **Leadership Portraits** and create a new entry.
2. Type the **leader name exactly** as it appears under Businesses → Leaders (for example `Ajay Sancheti`). A name that does not match keeps the monogram.
3. Upload a portrait crop, roughly 4:5 and at least 800x1000.
4. Write alt text, e.g. "Ajay Sancheti, founder of Arihant Apparels, at the Guwahati office".

The card swaps the monogram for the photograph on its own. Names with no entry
keep the monogram, so the section is never half-finished.

### How long until an edit shows on the live site?

**About five seconds.** Press Publish, count to five, then refresh the page. That
first refresh takes a moment longer than usual while the page rebuilds; every
visit after it is instant.

Worth knowing:

- A page only rebuilds when someone visits it. Nothing walks the whole site.
- If the webhook is misconfigured or the host is down, the change still appears within an hour on its own.
- Deleting **every** entry in a list (all the FAQs, say) brings back the versions shipped in the code. This is deliberate, so a half-configured CMS can never blank a section. To hide a section, empty its text rather than deleting every row.

### What you cannot change from the Studio

A few things are set in the code and need a developer:

- The site menu: which pages appear and in what order.
- Four numbers written directly into the design: the 2015 award year on the Arihant Marketing page, "24,000 sq ft" and "4 exhibitions" on the home page, and the label count in the header menu.
- The stock-photo credits list, which exists to record photo licensing.

One thing to watch: a number written **inside** a sentence (for example "48
brands") is just text once you can edit it. If you add a brand, the logo wall
updates by itself, but any sentence that names a count has to be edited by hand.

## 5. Where do form leads go?

- With Sanity configured: saved as **Lead** documents, visible in the Studio under Leads → New.
- **`SANITY_API_TOKEN` must be set on the live site, not just locally.** Without it the site falls back to writing a file on the server, and on Vercel that filesystem is wiped between requests, so real enquiries are lost with no warning. Send a test enquiry through the live site after deploying and confirm it appears in Leads.
- **Nobody is emailed when an enquiry arrives.** Someone has to check `/studio` → Leads. Wiring an email or WhatsApp notification is a small piece of work in `src/lib/leads.ts` (the seam is already there, `setLeadNotifier`); it is the recommended next step.

### "I published but the site hasn't changed"

1. Refresh once more. The first refresh after an edit is what triggers the rebuild.
2. Check sanity.io → API → Webhooks → your webhook → the delivery log. A red entry means it never reached the site.
3. A **401** there means the secret in Sanity and `SANITY_REVALIDATE_SECRET` in Vercel do not match.

## 6. Local SEO checklist (recommended, free)

1. Create/claim a **Google Business Profile** for each business at Arihant Tower (they can share the address with different names + floors): Arihant Marketing, Arihant Apparels, Arihant Retail. Use the exact phone numbers and the site URL per business page.
2. Keep the NAP (name/address/phone) on the site's footer identical to the Business Profiles.
3. Submit `https://<domain>/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).
4. Ask brand partners and NEGTA to link to the site where natural.

## Troubleshooting

- **/studio says "not configured"** — the env vars aren't set in that environment (see step 3/6).
- **Images from Sanity don't load** — `next.config.ts` already allows `cdn.sanity.io`; check the browser console for CORS origin issues (step 3.4).
- **`npm run seed` says not configured** — `.env.local` is missing the project ID or token.
