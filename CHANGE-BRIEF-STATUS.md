# Change Brief v1 — status

Every numbered item from the 16-page developer change brief (23 July 2026),
marked **Done**, **Query** or **Blocked**.

- **Done** — implemented and verified. The evidence column says how.
- **Query** — the item as written does not reproduce, or it needs a decision.
  The real underlying issue is fixed either way; the query is what we need
  from you.
- **Blocked** — cannot close without something from your side.

Delivered in seven commits on `main`, one per workstream:

| | Commit | Scope |
|---|---|---|
| 1 | `1078564` | Select page content by id, not copy substring |
| 2 | `9082e95` | Single source of truth for every published number |
| 3 | `43e422f` | WhatsApp-first lead capture, split funnels, form acknowledgement |
| 4 | `1a40a6b` | Rewrite site copy in plain trade English; de-duplicate across pages |
| 5 | `19775c5` | Per-page structural changes from the brief |
| 6 | `27b5c03` | Image slots, WebP partner logos, image size budget |
| 7 | `ff00960` | Analytics, local SEO schema, careers page, Hindi WhatsApp CTAs |

212 files changed. `npm run build` succeeds with no Sanity credentials, every
route static. `npm run lint` reports zero errors.

---

## Read this first: four items do not reproduce

We checked each against the deployed code at `0133fe6`, which is what you
reviewed. In each case we fixed the real underlying problem.

| Item | Your note | What is actually there |
|---|---|---|
| **HP11** | Logo wall renders twice (static grid + marquee) | One component. `LogoMarquee.tsx` renders a second copy of the track with `aria-hidden` so the CSS loop is seamless; the "static grid" is the *reduced-motion state of the same markup*, where that copy is `display:none`. The two are never both visible. The real complaint underneath was that the wall opened on unrecognisable names, which is **HP10** and is now fixed. |
| **AA8** | `apparels-promo.mp4` renders as a raw file link | It is a real `<video>` with a poster, `playsInline`, controls after play and a play-button overlay. Verified in the live DOM: poster 200, mp4 200, zero `.mp4` anchors on the page. What was wrong is that it was **11 MB**, so on a phone connection the tap produced a long silence. Now 5.3 MB with a visible loading state. |
| **AM5** | Cut the "01–06" steps short | There are only **four** steps, rendered 01–04. Nothing to cut. |
| **G5** | "Sanchetti" appears in places | **Zero** occurrences repo-wide; all 21 are correctly "Sancheti". The real defect was a *different* inconsistency: "Sagar (Jain) Sancheti" beside "Sagar Sancheti". Only the consistent form now remains. |

And one that was close but not exact:

| **AM13** | Marketing says "65+ brand partners" | That string does not exist. The figure was **45+**, while the Marketing logo wall rendered **48**. Reconciled to 48 everywhere, and the count is now derived from the logo list so it can never drift again. |

---

## G — Global

| # | Item | Status | Evidence |
|---|---|---|---|
| G1 | Copy reads as AI-generated | **Done** | Full voice pass. Named constructions removed: "Recognition, earned the slow way", "Old-school handshakes, new-school systems", "the word of the trade itself", "The systems stay invisible. The shelves stay full.", "A short list. Heavy items.", "Rhythm first. Scale later." |
| G2 | Same claims repeat across pages | **Done** | Cross-page duplicate sentences across the eight main routes went from many to **one** (a store caption shared by `/arihant-retail` and `/partner`, which is the same store). Measured by extracting visible text from the built HTML and intersecting page pairs. |
| G3 | Long paragraphs, no scanning | **Done** | Bullets wherever an answer makes three or more claims (FAQ answers gained a `bullets` field, folded into the FAQ JSON-LD too). |
| G4 | Jargon unexplained | **Done** | "shop-in-shop (SIS)" spelled out on first use, then SIS. "EBO" retired entirely from Arihant-facing copy (AR2). |
| G5 | "Sanchetti" misspelling | **Query** | Does not reproduce (see above). The real inconsistency is fixed. |
| G6 | Serif hero headlines overflow on mobile | **Done** | Not horizontal overflow: `document.scrollWidth === 360` at 360×640, before and after. The real fault was that **the entire mobile CSS layer had never applied.** `@import "./mobile.css"` sat at the top of `globals.css`, so every mobile rule landed *before* that file's own rules; a media query adds no specificity, so `:root`, `.section-pad`, `.t-display` and every shared selector resolved to the DESKTOP value at 360px. The phone type scale, phone rhythm and phone action bar were all inert. Import moved to the foot. Hero height at 360×640: **1103px → 889px**. |
| G7 | No persistent WhatsApp | **Done** | Desktop: a green FAB, real WhatsApp brand glyph (the old icon was a generic chat bubble). Mobile: the sticky bar, plus a call+WhatsApp pair in the header bar itself (H3). Both route by page and both stand down over a page's own CTA band. |
| G8 | No confirmation after submit | **Done** | "We will call you within one working day" replaces "two working days" in all five places it appeared, plus a line about WhatsApp for anything urgent. Verified by submitting the form. |
| G9 | No local SEO signals | **Done** | `LocalBusiness` markup (premises, hours, seven states served, `knowsAbout`) plus per-store `ClothingStore` in an `ItemList`. Verified in the rendered DOM. |
| G10 | No analytics | **Done** | Plausible via `next/script`. Verified with the domain set: script loads, `data-domain` correct, `window.plausible` defined, six tagged CTAs. Verified without: **zero** external scripts. |
| G11 | Images served at 3840px | **Done** | `w=3840` appears **0** times (was 154 on `/brands`). `deviceSizes` capped at 2048, `imageSizes` gained 180, AVIF/WebP negotiation on. Measured: all 77 tiles fetch at `w=256`, 195 KB for the whole wall. Per tile: AVIF 1901 B / WebP 2056 B / JPEG 3305 B. |

## H — Header

| # | Item | Status | Evidence |
|---|---|---|---|
| H1 | Header lacks presence | **Done** | 3px vermillion rule along the top edge; shadow appears past 24px of scroll. |
| H2 | No logo mark | **Done (interim)** | Chevron device beside the wordmark, drawn as SVG so it takes the header's colour. **A real group lockup is still wanted** — see Blocked. |
| H3 | No persistent call/WhatsApp on mobile | **Done** | Both now sit in the header bar, not two taps inside the sheet. Phone-only (`md:hidden`), 44px targets. |
| H4 | Businesses menu does not open on touch | **Query** | Already satisfied, and was before this work: the trigger is a `<button>` with `onClick`, and hover-open is gated behind `(hover:hover) and (pointer:fine)`. Touch has always opened it on tap. No change made. If it misbehaved on a specific handset, tell us which and we will chase it there. |
| H5 | Bar height on scroll | **Done** | 4rem → 3.5rem past 24px, desktop only (a phone header is already short and the fold budget is tight). Verified: 64px → 56px. |

## HP — Home page

| # | Item | Status | Evidence |
|---|---|---|---|
| HP1 | Numbers above the fold | **Done** | Three group figures (77 labels, 250+ retailers, 35+ years). Measured at 360×640: figures bottom **608px**, both CTAs 432px and 487px, all inside a 640px viewport. |
| HP2 | Logo on the home page | **Done (interim)** | The chevron lockup in the header. Same caveat as H2. |
| HP3 | Hero photo slot | **Done (slot)** | `photoSlots.homeHero` reserves a 4:5 frame with the shot described. Standing on stock until the shoot lands. |
| HP4 | Kill the FlipWords word-swap | **Done** | Gone, with the duplicate "stocked" it carried. FlipWords now appears once site-wide (the partner hero); noted in DESIGN.md. |
| HP5 | Low-friction second CTA | **Done** | "Brand list on WhatsApp", beside the primary ask, with the WhatsApp mark. |
| HP6 | One CTA serving two funnels | **Done** | Two cards, one CTA each: "Stock our brands" and "Own a managed store", directly below the fold. The three-business ticket nav they replace duplicated section 4. |
| HP7 | Rewrite the four pillars | **Done** | Now lead with your four: every category on one order, the best team in the trade, accounts you can audit, in your store every 20 days. |
| HP8 | "Highest footfall garnered, 4 exhibitions running" | **Done** | Stated once, in the home proof band. It is why the Apparels page no longer carries a whole band restating it. |
| HP9 | "Visit our stores" consumer section | **Done** | Open stores with towns and directions links, plus a link through to Arihant Retail. |
| HP10 | Reorder the marquee | **Done** | Now opens Deal Jeans, Indian Terrain, Little Kangaroos, Octave, Peppermint, Spykar, Tiny Girl, Twills. Driven by data (labels with a verified national category lead) rather than a hand-kept list, so adding a brand keeps it correct. |
| HP11 | Logo wall renders twice | **Query** | Does not reproduce (see above). HP10 is the real fix. |
| HP12 | Rotate the home testimonial | **Done** | Home reserves one voice; `/recognition` renders the rest. Both used to lead with the same quote. |

## AM — Arihant Marketing

| # | Item | Status | Evidence |
|---|---|---|---|
| AM1 | Shrink and integrate the logo | **Done** | Small mark in a lockup above the headline, not a plate in a side rail. |
| AM2 | Entity name above the headline | **Done** | In that lockup. |
| AM3 | Numbers as the visual anchor | **Done** | Stats moved from a 2.5rem side rail to the full measure at display size. |
| AM4 | Warehouse photography | **Done (slot)** | `photoSlots.marketingWarehouse`. Awaiting the shoot. |
| AM5 | Cut the "01–06" steps | **Query** | Only four steps exist. Nothing to cut. |
| AM6 | Drop the "Fixtures and launch" row | **Done** | Removed. |
| AM7 | Reframe SIS | **Done** | "No fixture investment", "Staff optional", in both the SIS ledger and the FAQ. |
| AM8 | CTA pair at the top | **Done** | Off the hero; the retailer ask now sits after the visit cycle has been explained, and both funnels close the page. |
| AM9 | NEGTA + "dedicated SIS team" out of the FAQ | **Done** | Both removed; remaining answers bulleted. NEGTA stays on `/recognition` as award #2, per your scoping. |
| AM10 | The four strengths on Marketing | **Done** | Same four, argued to a brand manager in different words, from a separate content type so neither page reprints the other. |
| AM11 | SIS brackets | **Done** | "shop-in-shop (SIS)" on first use. |
| AM12 | Drop "Or call Sagar · 94350 45528" | **Done** | Replaced with an intent-tagged "Distribute your brand" link, so a brand enquiry is routed rather than hand-sorted. |
| AM13 | "65+ brand partners" | **Query → Done** | That string never existed; the figure was 45+ against a wall of 48. Now 48, derived from the logo list. |

## AA — Arihant Apparels

| # | Item | Status | Evidence |
|---|---|---|---|
| AA1 | Entity name | **Done** | In the hero lockup. |
| AA2 | Smaller logo | **Done** | Same lockup. |
| AA3 | "built brand by brand" | **Done** | Now "We have built several brands into category leaders across the Northeast." |
| AA4 | CTA pair at the top | **Done** | Off the hero; the retailer ask sits inline after the mission. |
| AA5 | "Highest footfall garnered" once | **Done** | The "busiest stand at every fair" band is deleted; the claim survives once, as the hero stat. |
| AA6 | Warehouse/team photography | **Done** | Both slots are already **real** photographs. |
| AA7 | Voice pass | **Done** | Covered by G1. |
| AA8 | Video renders as a raw file link | **Query → Done** | Does not reproduce; it is a real player. The 11 MB weight is the likely complaint: now **5.3 MB**, with a spinner between tap and first frame and a written message if it fails. |
| AA9 | Confirm the six team names | **Blocked** | Names and designations are published as supplied. Confirm before go-live. |
| — | Dead "Straight answers" section | **Done** | No FAQ carried `page: "apparels"`, so the section had never rendered. It now has four. |

## AR — Arihant Retail

| # | Item | Status | Evidence |
|---|---|---|---|
| AR1 | Remove the tagline | **Done** | "Retail, run the way a distributor runs it" is gone; the hero is now "We run stores of our own". |
| AR2 | Remove all EBO references | **Done** | All six you listed, plus the `"EBO"` format value in the type and the Studio schema, plus **three you did not list**: a testimonial and two blog sentences claiming Arihant sets up EBOs. `grep EBO` on the retail page returns 0. The MBO-vs-EBO Trade Notes article keeps the term as industry vocabulary. |
| AR3 | Restructure the fit-out cards | **Done** | Two byte-identical `{name:"New store", city:"Northeast India"}` placeholders rendered as two identical dark tiles. Store cards now key their state off `status`, not off whether a photo exists, so a trading store without a photo no longer looks shut. |
| AR4 | Store photography | **Blocked** | Awaiting the pack from Manasvi. Slots reserved. |
| AR5 | Delete "The map fills in" | **Done** | Removed; its three numbers are already the hero band. |
| AR6 | Retail brochure | **Blocked** | Awaiting the file. |
| AR7 | Store cards: name, town, format, photo, directions | **Done** | All five. Directions render only where the address is confirmed, so no card links to a guess. |
| AR8 | Franchise CTA in-page | **Done** | After the model band, where the model has just been explained. |

## R — Recognition

| # | Item | Status | Evidence |
|---|---|---|---|
| R1 | Restructure the trophy case | **Done** | One ruled row per award instead of a centrepiece plus flanking cards. |
| R2 | "2015" small under the title | **Done** | A 7rem "2015" used to be the largest thing on the page. The award title is now the headline; the year is a small label under the issuer. |
| R3 | Delete the "industry body" detail | **Done** | Replaced with one plain line. |
| R4/R5 | Remove the two Tadpole items | **Done** | `award-tadpole-15yr-thailand` and `award-tadpole-launch-2018` gone from the gallery. |
| R6 | Strip supporting text under the footfall award | **Done** | Detail emptied; the card renders without it. |
| R7 | Rename to "Timeline" and reuse `Timeline.tsx` | **Done** | The 6-cell year grid is replaced by the same Timeline the About page uses, so each year carries its account. |
| R8 | Real testimonials with consent | **Blocked** | Need 3–5 with name, shop name, town and **written consent**. Until then the composite trade voices stand, attributed by role and town, as the honesty policy requires. |
| R9 | Lengthen the quote pool | **Done** | 10 → 16 quotes, so the columns travel further before repeating. |
| R10 | Recognition photography | **Blocked** | Part of the shoot. |
| — | 3× DOM copies of the quote columns | **Query** | Correct technique, not a bug: one copy is visible per breakpoint, the others are `display:none`. Leaving as is. |

## AB — About

| # | Item | Status | Evidence |
|---|---|---|---|
| AB1 | Correct the Retail founding year and milestone order | **Blocked** | Code says 2023. Tell us the correct year and sequence. |
| AB2 | Use the Timeline | **Done** | Already did; unchanged. |
| AB3 | De-duplicate against other pages | **Done** | Values split from the home pillars (the two pages were printing the same three cards under different headings); the house ledger shows who runs each business instead of reprinting the positioning line the home page carries. |

## F — Footer

| # | Item | Status | Evidence |
|---|---|---|---|
| F1 | Remove Sagar's number | **Done (needs sign-off)** | Off public display. **His line survives as the Marketing WhatsApp target and as the site default**, so distribution enquiries still reach him; it is simply not printed. |
| F2 | Three footnote links by intent | **Done** | "Stock our brands", "Distribute your brand", "Own a managed store", each deep-linking to the form with step 1 already answered. Verified: `?intent=franchise` opens on step 2 with the chip set and routes to the Arihant Retail desk. |
| F3 | Address + map | **Done (partly)** | Full NAP plus a directions link, from one `mapsUrl()` that `/contact` shares. The **static map image is Blocked** on an asset: a map embed would be a third-party script, which the design rules forbid, so it must be a committed image file. Slot reserved as `photoSlots.officeMap`. |
| F4 | Remove Anand's number | **Done (needs sign-off)** | As F1. **This leaves Arihant Marketing showing only Shreyansh, who is Arihant Retail's contact.** Flagged in the code. Confirm who should be shown. |
| F5 | GST/CIN + privacy note | **Done (partly)** | Privacy note live. GSTIN and CIN render only once you supply values, so nothing ships as a placeholder. |

## X — Additions

| # | Item | Status | Evidence |
|---|---|---|---|
| X1 | Gate the brand-list PDF | **Done** | Name + phone, through the same server action and validation as the full form, tagged `retailer` and sourced to `/brands`. Verified end to end: the lead is stored. The **PDF itself is Blocked**; until it lands the confirmation says the list will come on WhatsApp, and a `fileHref` prop is ready for the file. |
| X2 | Lead notifications | **Done (pluggable)** | `LeadNotifier` behind a provider interface, defaulting to a no-op. Storage and notification are separate so an alerting outage can never lose a lead or tell a visitor their enquiry failed. Wire Resend or Interakt with one `setLeadNotifier()` call when credentials arrive. |
| X3 | "Why the Northeast needs a specialist" | **Done** | On the Marketing page, four reasons written for a national brand manager, with its own brand-intent CTA. |
| X4 | NAP + map + directions | **Done (partly)** | As F3. |
| X5 | Hindi / Assamese | **Done (as scoped)** | Retailer-facing WhatsApp prefills are bilingual; brand- and investor-facing ones stay English. This is your own stated fallback. A real second language means maintaining a duplicate of every string on the site and should be quoted as its own project. |
| X6 | Careers page | **Done** | `/careers`, reusing the inquiry form on a new `careers` intent so an application lands with every other lead, tagged. |
| X7 | Remove "one of the region's five largest" | **Done** | All six places you listed, plus a seventh the brief did not: the claim survived as a hardcoded JSX fallback on the Apparels CTA band, which would have reappeared the moment the CMS returned a page without that section. Every hardcoded copy fallback is gone from the unit pages; content comes from the content layer or the section does not render. Zero occurrences remain. |
| X8 | Sign off every figure | **Blocked** | See the table below. |
| X9 | Broken-link crawl | **Done** | Crawled every internal link from `/`: 19 pages, **zero broken**. External hosts are `wa.me`, `maps.google.com`, `tel:` and `mailto:` only. |
| X10 | Consent banner | **Not needed** | Plausible is cookieless and stores no personal data, so there is nothing to consent to. Recorded in the code so nobody re-adds it. |

## I — Imagery

| # | Item | Status |
|---|---|---|
| I1–I5, I8–I12 | Photography shoot | **Blocked** — slots built and reserved, `pendingPhotoSlots()` lists what each one wants. |
| I6, I7 | Store photo/video pack from Manasvi | **Blocked** |

---

## Awaiting you

### 1. Sign off every figure (X8)

Every number on the site now comes from one file, `src/content/facts.ts`.
Change a value there and every page moves together. Please confirm each:

| Scope | Figure | Value | Note |
|---|---|---|---|
| Group | Years in the trade | **35+** | Counting from the family's first Guwahati counter. |
| Group | Retailers served | **250+** | **See question below.** |
| Group | National labels | **77** | Derived from the logo list. |
| Group | Warehousing | **24,000 sq ft** | Derived: 15,000 + 9,000. |
| Group | States served | **7** | |
| Marketing | Years distributing | **30+** | Deliberately different from the group's 35+. |
| Marketing | Retailers on the visit cycle | **250+** | **See question below.** |
| Marketing | Brand partners | **48** | Derived from the logo list (was 45+). |
| Marketing | Warehouse | **15,000 sq ft** | |
| Marketing | Visit cycle | **20 days** | |
| Marketing | CMAI award | **2015** | |
| Apparels | Established | **2013** | |
| Apparels | Warehouse | **9,000 sq ft** | |
| Apparels | Exhibitions led on footfall | **4** | |
| Apparels | Labels carried | **29** | Derived from the logo list. |
| Retail | Established | **2023** | **AB1 disputes this.** |
| Retail | Stores open | **4** | **See question below.** |
| Retail | Stores in fit-out | **2** | |
| Retail | Stores planned | **10 by FY 26-27** | |

**Question: is 250+ the group total, or Arihant Marketing's alone?** Both
currently show 250+, which is exactly the kind of thing that reads as a
contradiction. If Apparels serves retailers Marketing does not, the group
figure should be higher.

### 2. The store list (AR3 / AR4 / AR7)

You named five stores. You also state 4 open + 2 in fit-out, which is six. We
have used your five names plus one unnamed sixth, and split them to match your
counts:

| Store | Town | Status as published |
|---|---|---|
| Urban Closet | Guwahati | Open (photographed) |
| K.A.K | Kohima | Open |
| Tanzee | Itanagar | Open |
| Urban Closet | Goalpara | Open |
| Urban Closet | Tura | **Fit-out — guessed** |
| (unnamed) | — | Fit-out |

**Which are trading and which are in fit-out?** And what is the sixth store?
The two photographs we could not attribute to a named town now carry the
retail page's section imagery instead of a caption we cannot stand behind.

### 3. Contact numbers on display (F1 / F4)

With Sagar's and Anand's numbers removed, **Arihant Marketing's block shows
only Shreyansh Sancheti, who is Arihant Retail's contact.** Who should a
retailer or a brand see there?

### 4. Still needed

| Item | For |
|---|---|
| 3–5 testimonials with name, shop, town and written consent | R8 |
| Correct Arihant Retail founding year and milestone order | AB1 |
| The retail brochure file | AR6 |
| The brand-list PDF | X1 |
| Store photo and video pack from Manasvi | AR4, I6, I7 |
| The photography shoot | I1–I5, I8–I12, HP3, AM4 |
| A static map image of Arihant Tower (a file, not an embed) | F3, X4 |
| GSTIN and CIN | F5 |
| Resend or WhatsApp Business API credentials | G8, X2 |
| Plausible account and domain | G10 |
| An official Arihant Group logo lockup | H2, HP2 |
| Confirm the six Apparels names and designations | AA9 |

---

## How this was verified

- `npm run build` succeeds with **no Sanity environment variables**; all 24
  routes render statically from seed content. `npm run lint` reports zero
  errors.
- **Copy selectors:** six sections used to pick their content by
  substring-matching the copy, so any rewrite silently blanked them. They now
  select by stable id. `grep '\.includes('` across the site routes returns
  nothing content-related.
- **Numbers:** each retired literal was grepped for; every remaining figure
  resolves through `facts.ts`. `45+`, `five largest` and `5 largest` return zero
  hits.
- **Mobile:** measured in a real browser at 360×640. No horizontal overflow on
  any page. `scratchpad/check_mobile_containment.py` proves every rule in
  `mobile.css` sits inside a `max-width: 767px` block, so desktop is frozen by
  construction.
- **Lead paths:** the form was submitted at an intent deep link and the
  brand-list gate was submitted; both leads were stored, and the WhatsApp
  routing was checked page by page against the intended map.
- **Accessibility:** the new FAB, funnel cards, footer intent links and hero
  WhatsApp ask all take a visible 2px focus ring at 2px offset, none of them
  clipped by a `clipPath` ancestor. The FAB's white glyph on WhatsApp's own
  `#128C7E` measures 4.13:1, over the 3:1 bar for a graphical control.

**One limitation, stated plainly.** The browser pane available during this work
had `requestAnimationFrame` throttled, so scroll-driven behaviour could not be
exercised end to end there. The header's scrolled state and the FAB's
appear-and-yield were verified two ways instead: the FAB was watched changing
state live earlier in the session while rAF was running, and both were then
confirmed against their CSS contract with transitions suppressed (header bar
64px → 56px with shadow; FAB `translateY(78.4px)`/opacity 0 → 0/opacity 1).
**Visual sign-off on a real device is still yours.**
