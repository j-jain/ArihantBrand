# Change round 2: status

The client's second round of home-page changes (1 October 2026), plus the
sitewide asks: one composition that scales across every laptop and tablet, and
a visual refinement pass that leaves the copy alone.

- **Done**: implemented and verified locally. The evidence column says how.
- **Pending**: waiting on something outside the code (a deploy, a seed, an
  asset, a login).

Everything below was verified against the local build rendering from code
(`SANITY_READS=off`). **The live site will not show any of it until the code is
deployed AND Sanity is re-seeded**, in that order (see "Publishing", below).

## Home page

| Item | Status | Evidence |
|---|---|---|
| Lead reads "Let's understand the house of North East India" | Done | The client's own Studio text, now in `pages.ts` so a re-seed keeps it. |
| "300+ retailers served" under it | Done | `hero.points`, figure from `facts.group.retailers`. |
| "Catering to 80+ brand partners" under that | Done | `hero.points`, figure from `facts.group.brandPartners`. |
| Heading, figures and photo fit one screen | Done | Hero bottom measured ≤ viewport height at 768×1024, 1024×768, 1280×720, 1366×768, 1440×900, 1536×864 and 1920×1080, and on phones at 360×640 and 390×844. |
| Hero photo replaced with a new photo | **Pending** | No new photos were found on the laptop. The current photo stays as a stand-in. Swap it in `photoSlots.homeHero` (`src/content/images.ts`) or upload it to the "homeHero" photo slot in the Studio. |
| Left card title "Shop fast moving brands for your store" | Done | `funnels[0].title`. |
| Right card title "Own a retail store" | Done | `funnels[1].title`. |
| Left link "Partner with us" | Done | `funnels[0].cta`, still routes to the retailer inquiry. |
| Right link "Tap the North East with us" | Done | `funnels[1].cta`, still routes to `/partner`. |
| Old "What a retail partner says" band removed | Done | Replaced in the same slot. |
| New "Awards and testimonials" band between the funnels and "Why us?" | Done | Charcoal band: the three awards as a ruled list beside two slowly scrolling columns of trade voices, link to /recognition. Nothing else sits between the funnels and "Why us?". |
| "Why us?" cards overlap like cards placed on top of each other | Done | Rebuilt `CardsStack`: each card pins lower than the last by exactly its own heading's height (measured), so every heading stays readable; cards beneath settle back slightly; the gathered deck holds, then gathers into a pile and leaves. Checked on desktop and phone, and with reduced motion (plain column). |
| Card 1: "All categories, all genders, one group, one point of truth" | Done | |
| Card 2: "The best and most experienced team with full authority and one single point of clearance" | Done | |
| Card 3: "Best brands in the respective categories" | Done | Body copy is new, because the card is new. Review it. |
| Card 4: "In your store every 20 days" | Done | "Accounts you can audit" is dropped. |

## Businesses section

| Item | Status | Evidence |
|---|---|---|
| Marketing: 300+ "Retailers", no visit wording | Done | Also on the Marketing page hero. |
| Marketing: bullets on the right removed (no duplicated figures) | Done | Figures now 30+ / 300+ / 15,000 sq ft, three across. |
| Apparels: new tagline | Done | "The most modern & systematic distribution house, the best relations with retailers & brands alike." The client's wording, with "retailer" pluralised. Also the Apparels page headline, where the client had already set it in the Studio. |
| Apparels: the three bullets removed | Done | |
| Retail: "4 stores trading, 2 in fit-out, 10 by FY 26-27" gone | Done in code | Zero occurrences of "FY 26", "in fit-out" or "250+" in the built site. **Sanity still holds it until the re-seed** (and the two fit-out store documents must be deleted; see below). |
| Retail: "Two company-owned, company-run stores and two franchisee-owned, company-run stores" | Done | Numbers spelled from `facts.retail.*`. |

## Trade Notes

| Item | Status | Evidence |
|---|---|---|
| Posts made from Shreyansh Sancheti's LinkedIn | **Pending** | The Claude in Chrome extension was not connected during this session, so his posts could not be read. Everything else is ready: posts carry an optional `author` (name, role, LinkedIn URL), shown as a byline with an "Originally posted on LinkedIn" link and emitted as a schema.org `Person` author. Once the posts are read, they go into `posts` in `src/content/seed.ts` in his wording. |

## Sitewide

| Item | Status | Evidence |
|---|---|---|
| Every laptop and tablet size resizes instead of realigning | Done | One composition from 768px up, scaled through the root font size. Every route's grid-track signature is identical at 768, 1024 and 1440. The home page is identical at all seven sizes. No horizontal scroll anywhere. The one exception: the header keeps its menu button below 1024px, because the full nav does not fit a 768px bar. |
| Visual refinement, copy unchanged | Done | Business figures three across, not wrapping 2+1. Footer emails break at the "@", not mid-word. The black strip trimmed off the store-interior photo (original kept in the session backup). Sentence-length headlines step down a size. The calculator's side-stripe note became a ruled box. A sideways scroll that entrance animations caused at 768px was fixed. |
| Phone menu button was invisible | Done | **This was live on the deployed site too**: on 360–390px phones the menu button was squeezed to zero width, so visitors could not open the menu. The wordmark now steps down on phones and every target stays 44px. |
| Lint, types, build | Done | `eslint src scripts`: 0 problems. `tsc`: clean. `next build`: all 24 routes static, both without Sanity and against the live dataset (the new code tolerates the old documents, so deploying before seeding is safe). Mobile containment check: pass. |
| Docs | Done | PRODUCT.md, DESIGN.md and CLAUDE.md updated (scaling rule, Sanity workflow, home cadence, card deck, awards band). |

## Publishing (in this order)

1. **Deploy the code.** It renders the old Sanity text until step 2, without errors.
2. **Re-seed Sanity:** `npm run seed`. A dry-run diff against the live dataset was done first. The client's Studio edits (the home lead, "Why us?", the Apparels headline, and the Retail store wording) are carried into the seed, so the re-seed keeps them.
3. **Clean up in the Studio** (the seed script never deletes). These still say "fit-out", or no longer exist in the code:
   - Stores: **Tura** (`store-4`) and **Next door** (`store-5`), both "Fit-out". Delete both.
   - Group stat **warehouse** (`groupstat-warehouse`). Delete it.
   - The unpublished draft of the **Apparels page**. Discard it, so publishing it later cannot roll the page back.
4. Re-check the live site.

## Also worth knowing

- The home headline reads "The **leading** garment house of Northeast India". That word came from the earlier draft of this brief. The live site still says "The garment house of Northeast India". If "leading" is not wanted, it is one word in `src/content/pages.ts`.
- `/careers` returns 404. It was removed in an earlier commit and nothing links to it; PRODUCT.md now says so.
