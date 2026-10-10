# Change round 9: status

Requested 10 October 2026: look at the whole site and refine it, positioning, copy, build and animation, on every page. This round is the connective tissue between the set pieces the earlier rounds built: who the site is for, one verb per audience, real photographs where stock stood, the health defects an audit turned up, and one motion grammar for how a band arrives.

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on a decision or a publish.

Built and verified locally. **Not pushed, not seeded**: publishing waits for your word (push first, seed after the deploy is live, then the signed revalidate).

## Positioning

| Item | Status | Evidence |
|---|---|---|
| One verb per audience, used the same way everywhere: **Stock our brands** (retailer, `/contact?intent=retailer`), **Distribute your brand** (brand), **Own a store** (`/partner`), **Talk to us** (`/contact`) | Done | "Partner with us" used to mean three destinations (header to `/partner`, home card to the retailer form, home drench to `/contact`). Header and sheet buttons, the home card, the hero CTAs of Marketing and Apparels, the swing-tag asks and the Trade Notes end-matter all carry the new labels; `grep "Partner with us\|Become a retail partner\|Partner as a brand" src` returns nothing. |
| Header button "Talk to us" to `/contact`; Contact dropped from the primary nav | Done | The intent chooser routes all three audiences; the old `/partner` button sent nine readers in ten to the franchise page. Contact left the nav so the header never carries two links to one page (the same rule that removed Partner With Us earlier). |
| Home hero audience rail: "I run a store", "I have a brand", "I want to own a store" | Done | New `hero.audienceLinks` (type, Sanity `page` hero field, GROQ, mapper, seed script); the seed's links stand in until the Studio document carries its own (`getPageCopy`). One row at 1280x650, 1366x657 and 1440x900; two rows at 768; three 44px rows on a phone. Replaces the lone "The three businesses" jump link. |
| Marketing and Apparels drench bands print the hero's own CTAs | Done | The labels were typed into the page files; a Studio edit to the hero would have left the foot of the page saying something else. |
| Home drench: routed WhatsApp link instead of a printed number | Done | The band printed the Marketing line the change brief (F1) took off public display. |
| Real photographs where stock stood | Done | Home hero: the Apparels denim racks (`apparels-warehouse-2`). Awards ground: the dispatch floor (`-1`, a file that was never placed). Apparels mission: `-1`. Partner model band: the Urban Closet front (capped at 15.5rem, no overscan; the stock "GOODS" night shopfront is gone), proof strip: the real store floor. About story: the team (3:2); values panels: the fair, the team on the floor, the dispatch floor. Stock survives only on the Marketing feature hero and the Trade Notes thumbnails. A Studio upload on any slot still wins over the code photograph; no slot carries one today. |
| Apparels page WhatsApp reaches Ajay's line (`919954010361`) | Done, **sign off** | It reached Sagar's Marketing line. The number is the one the page prints beside Ajay's name. |
| Phone dock "Call" dials the page's desk | Done | Retail and Partner pages ring Shreyansh, Apparels rings Ajay; Marketing keeps the site default (it prints no line of its own). |
| Footer map arc to Gangtok removed | Done, **sign off** | Every sentence says "seven states"; Sikkim is not one of them. The seven arcs remain. |

## Copy

| Where | Was | Now |
|---|---|---|
| Home hero lead (**the client's line; veto if wanted**) | "Let's understand the house of North East India" | "Brand distribution and company-run retail across all seven states, from one Guwahati house." |
| Home closing lead | "Retailer, brand or investor. Tell us which, and the right person calls you back..." | "Retailer, brand or investor: tell us which, and the right desk calls you back within one working day." |
| Home retailer card | "You run a store. We put the national labels that actually move onto your racks, and keep them moving." + "Partner with us" | "You run a counter. We put the national labels that move onto your racks, keep the size sets whole, and settle claims on the date we name." + "Stock our brands" |
| Home franchise card | "You have the capital and the property. We hire the staff, buy the stock, run the marketing and carry the deadstock. You own the asset." | "You bring the capital and the property. We hire, buy, merchandise and market, and the deadstock stays off your books." ("Tap the North East with us" kept) |
| Marketing hero lead | "...visiting every counter on a 20-day cycle." | "...and we stand in every counter on a fixed cycle." (the numeral is said in the FAQ and on the home card only, per the repetition rule) |
| Apparels hero lead | "Founded in 2013 by Ajay Sancheti, Arihant Apparels carries 29 labels, led by..." | "The group's second distribution house, with a portfolio of its own: the Northeast's leading ladies' ethnic labels, with westernwear, kidswear and footwear beside them, bought on sell-through data so your racks hold what moved." (the figures sit in the stat band under it) |
| Apparels mission body | the business summary, which repeated the hero lead | its own paragraph (`mission.body`): "Ajay Sancheti founded the house in 2013 as the group's second distribution arm. Buying runs on sell-through, counter by counter: the sizes and colours that moved in your town last season are what we indent, so a growing store gets its next bestselling label before the competition does." (the summary stays for the JSON-LD description) |
| Partner proof lead | "...backed by a proven ROIC record..." | "...under both ownership structures, backed by a proven return on capital..." |
| Partner how lead | "FOCO, done properly." | "Franchise-owned, company-operated, done properly." |
| About leadership lead | "...each run an arm of the house." | "...each run an arm of the house, from the floor its name is on." |
| Recognition hero | "Awards" set plain | the emphasis the Studio field already named, in the accent colour |
| Contact hero | its CTA field rendered nowhere | "Send an inquiry" as a quiet jump to the form |

No dash entered any copy; every figure still interpolates from `facts.ts`.

## Build and health

| Item | Status | Evidence |
|---|---|---|
| Home testimonial wall prints the first eight voices (Studio order); `/recognition` prints all sixteen | Done | The wall printed all sixteen, so every one of them repeated on `/recognition`. |
| Footer email no longer breaks across three lines | Done | The top row is 8/4 (was 7/5), the address breaks only before the "@". Two lines at 1440, one above. |
| About leaders as a ruled ledger (name, business, floor) | Done | Four empty 4:5 monogram plates are gone; a portrait, when one lands in the Studio, takes the plate beside the name. The phone layer already styled these hooks as a ledger, so both layers now agree. |
| Skip link works under Lenis | Done | The smooth-scroll anchor handler now moves focus to the target as a native jump would; `main` takes focus; the 404 page has an `id="main"`. |
| Desktop WhatsApp button stands down after a client-side navigation | Done | It watched the previous page's CTA bands (the note left in the mobile revamp status). |
| Testimonial columns can be paused by keyboard or touch (WCAG 2.2.2) | Done | The marquee's pause control, under the wall; hidden on phones and under reduced motion. |
| Reload at a page's foot no longer hides and replays the drench band | Done | The same on-screen guard every other reveal has. |
| Marquee skew settles to flat when scrolling stops | Done | A settle call re-armed on every update. |
| Businesses trigger is a disclosure, not a menu | Done | `aria-haspopup` dropped; `aria-controls` only while the panel exists. |
| ESLint ignores the vendored skill scripts and the scratchpad | Done | 135 warnings and two minutes to zero and seconds. |
| Article pages: Open Graph type `article` with the header image; Article JSON-LD carries `image` | Done | |
| Brand index header ticker gated to 768px up; FlipWords measures after fonts settle; thumbnail `will-change` dropped | Done | |
| Dead code: `VapourText`, `TestimonialRail`, `ProcessSteps`, `getGroupStats`, `getMarketingReasons`, `.action-bar-yield`, three unrendered photo slots, two dead page sections, five create-next-app SVGs and the unused chevron motif | Done | `tsc` and `eslint` clean after removal. The `marketingReason` and `groupStat` Studio documents stay (orphans the Studio can delete; the seed never deletes). |

## Motion

| Item | Status | Evidence |
|---|---|---|
| One vocabulary in `src/lib/gsap.ts`: `EASE` is now a CustomEase of the CSS `--ease` (JS used a softer cubic), one trigger line for content (`top 85%`) and one for bands (`top 80%`), one rise, one stagger, one on-screen guard | Done | Reveal, StaggerGroup, SplitHeading, CurtainReveal and DrenchBand all read the tokens; five different trigger lines are one. |
| `SectionReveal`: one entrance per band from one standalone trigger (heading words, lead, photo mask, rows, items), phones shorter without the word split, reduced motion a no-op | Done | Marketing (film, strengths, brand wall, FAQ), Apparels (mission, team, brand wall, FAQ), Partner (proof, how it works, FAQ, inquiry), About (story, leaders), Recognition (cabinet, voices), Home (brands, notes), Contact. The set pieces (deck, rail, street, atlas, model band, tags, heroes) are untouched. Dead zones closed: the Marketing film, Apparels mission and About story headings now split like every other; the Partner FAQ has an entrance. |
| Home hero figures count up as their row rises | Done | `HeroFigure`, started by the intro's `heroIntroPlay` event, with an invisible twin reserving the width (no CLS). `CountUp` is shared with the stat bands. |

## Checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 problems |
| `next build` (Sanity reads off) | every route static |
| `scratchpad/check_mobile_containment.py` | PASS (29 phone-only blocks, nothing else) |
| Headless walk of all 11 routes at 1440x900 with motion, scrolled through | every section visible after its entrance; nothing stranded |
| Headless walk at 390x844 (home, Marketing, Partner, About) | hero rail as three rows, leaders ledger, dock and footer unchanged |
| Headless walk with reduced motion (home, Marketing, Partner, About) | every section visible with no motion; the deck's plain column and the unpinned rail as designed |
| Home hero one-screen fit | holds at 1280x650, 1366x657 and 1440x900 with the rail on one row |
| Seed dry-run diffed against the live dataset (raw GROQ) | exactly 17 documents differ, all this round's: `page-home`, `page-marketing`, `page-apparels`, `page-partner`, `page-about`, `page-recognition` (dead section dropped), `funnel-retailer`, `funnel-franchise`, `business-marketing`, `business-apparels`, and the `alt` of 7 `photoslot-*` docs. No Studio drift to port. |

Method: headless Chrome over the DevTools protocol (`walk.mjs` in the session scratchpad, which steps every route so the scroll triggers fire in order; the in-app preview pane pauses animation frames while hidden).

## Publish steps (after your word)

1. `git push` (main deploys on Vercel). Until the seed runs, the live site keeps the Studio's old copy except where a document lacked a field (the audience rail renders from the seed at once).
2. When the deploy is live: `node scripts/seed.mjs --dry-run --out=<file>`, re-diff against the dataset, then `npm run seed`.
3. Signed POST to `/api/revalidate` (`_type: "sanity"`).
4. Studio housekeeping for the client: the `marketingReason` and `groupStat` documents and the earlier orphans (`photoslot-marketingCorridor`, `photoslot-marketingWarehouse`, `groupstat-warehouse`, `store-4`, `store-5`, `drafts.page-apparels`).

## Flagged for you and the client

- The home hero lead replaces the client's "Let's understand the house of North East India".
- "Partner with us" is gone: the header button is "Talk to us" and goes to the intent chooser; the retailer card says "Stock our brands".
- The Apparels page's WhatsApp now reaches Ajay Sancheti's line.
- The footer map no longer draws a reach arc to Gangtok.
- The home testimonial wall shows eight voices, by Studio order.
- The partner page's storefront photograph is the real Urban Closet front, a small file, so it renders at the small-file cap.
