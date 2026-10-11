# Change round 10: status

Requested 11 October 2026, after a review of round 9 on the local build: fix the sections that read as poor design (two routers back to back on the home page, two adjacent bands on the same gray on Apparels, the About and Trade Notes pages opening on the same paper twice), give the Recognition page placeholders for photographs still to come, keep every animation's idea but make each one far smoother and more physically convincing, and carry more through elements than words. One hard rule for the round: **no copy changed**. Every marketing string is as it was; links were removed, data-driven elements were added, and the only new words are placeholder chrome ("Photo coming soon").

- **Done**: implemented and verified locally (evidence column).
- **Flagged**: a judgement call for you or the client.

**Published 11 October 2026**: committed as `8eb7ec3` (with round 9's `f36b7fc` ahead of it), pushed to `main`, Vercel deploy green, then `npm run seed` (201 documents upserted, 96 images linked; the dry-run diffed against the live dataset first showed exactly round 9's 17 documents plus the one new photo-slot document and no Studio drift), then the signed revalidate (`200 {"revalidated":true}`). Verified on arihant-brand.vercel.app: the home prints "Stock our brands" and the new lead, Apparels its new lead and mission paragraph, Recognition its placeholders and caption; a post-seed diff against the dataset shows 0 documents differing.

## Sections and rhythm

| Item | Status | Evidence |
|---|---|---|
| Home: one router. The round-9 audience rail in the hero is gone; the two funnel cards under the fold route the page, as they did before round 9 (your pick) | Done | `hero.audienceLinks` removed end to end (type, Sanity `page` field, GROQ, seed, seed script, `.hero-asks` CSS on both layers); the hero's old "The three businesses" fallback link does not come back. Asks on the page: 13 → 10. The hero still fits one screen at 1280×650, 1366×657 and 1440×900 (headless measure). |
| Home: the funnel cards carry a mark | Done | Between each card's body and its ask, the logo of every business whose own `audienceCtas` carry that card's destination (retailer card: Marketing + Apparels; investor card: Retail). Data, not a hand-written map; marks, not links. |
| Apparels: the team band is charcoal (your pick: keep two bands, retone one) | Done | "The people who run it" on `.on-dark` with dark hairlines and on-charcoal text; the mission keeps its accent wash. Measured grounds: paper → wash → charcoal → paper → shade → paper → drench, no adjacent pair alike. |
| About: the story stands on the shade, its photograph on a paper keyline; the three-house ledger sits beside a drawn elevation of Arihant Tower | Done | `bg-paper-shade` + `.photo-keyline`; `about/_components/TowerLedger` draws one storey per business from the contact settings' floors (Retail ground, Apparels 1st, Marketing 2nd) and prints each floor beside the founding year. Grounds: paper → shade → charcoal → paper → shade → drench. |
| Trade Notes index on the shade (same defect, unflagged) | Done | `.notes-index` on `bg-paper-shade`, thumbnails on paper; the dead `sm:grid-cols-2` went. Grounds: paper → shade → drench. |
| "Why us?" and /brands headings animated twice | Done | The `Reveal fade` wrappers round two `SplitHeading`s are gone. |

## Recognition placeholders

| Item | Status | Evidence |
|---|---|---|
| Hero photograph beside the copy | Done | A 7/5 split on `.hero-pad` (it ran on `section-pad`, against DESIGN.md); the `recognitionHero` slot (`src/content/images.ts`, the Studio's "Recognition: hero", the seed script) stands on a drawn `PhotoPlaceholder` until a file lands, and opens out of the hero's mask like a photograph would. |
| One photograph per award row | Done | `Award.image` / `imageAlt` on the award document (schema, type, query, mapper, seed script), rendered in a 4:5 plate at the row's end that never crops a trophy or a certificate; the drawn placeholder stands in until the client uploads one. The home band's compact list is untouched. |
| `PhotoPlaceholder` (`src/components/PhotoPlaceholder.tsx`, `src/app/placeholder.css`) | Done | Ink line work (a cup and a framed certificate on a shelf) on a flat ground, a chip, the slot's wanted line as its caption; paper and charcoal grounds; no `<img>`, no motion of its own; four render without JS. |
| The seed script keeps client uploads | Done | `photoSlot` and `award` documents are patched field by field instead of replaced, so a photograph uploaded in the Studio survives `npm run seed`. Seed dry-run vs HEAD: exactly one new document (`photoslot-recognitionHero`) and the home hero without its rail. |

## Motion

| Item | Status | Evidence |
|---|---|---|
| Springs as a material: `src/lib/spring.ts` samples a damped oscillator into a CustomEase; `SPRING` (lands, ~0.93s), `SPRING_SOFT` (follows, ~0.64s), `SPRING_HANG` (a hung tag, three swings); CSS twins `--ease-spring` / `--ease-spring-soft` as `linear()` with a fallback | Done | Every `back.out`, `elastic.out` and springy cubic-bezier replaced (`grep` finds none under `src`). |
| Lenis continuous: a lerp (0.085) instead of a duration restarted per wheel tick; held while a dialog or the menu sheet is open; the counter rail's buttons scroll through it; its missing stylesheet rules shipped | Done | `src/lib/lenis.ts`, `SmoothScroll`, `Modal`, `SiteHeader`, `CounterRailBehaviour`, globals.css. |
| Once-only reveals land finished after a flick (`fastScrollEnd`); `SplitHeading` caps its font wait; `CountUp` writes the text node instead of re-rendering React per frame; `ScrollTrigger.config({ limitCallbacks })`; `withWillChange` promotes layers only while a tween runs | Done | |
| Hero: the copy pulls into focus from a soft blur as it rises; the photograph settles longer | Done | Headless frames at 450/800/1200ms: blur 6px → 0.05px → none, filter cleared on landing. |
| Swing tags: turn on the spring (one overshoot, no rubber), the cord winds a beat after the face has begun to turn, sway damping 3.4 → 4.2 (three swings), the drop lands on the spring and is skipped for a section already on screen | Done | Frame burst of a turn: 121° → 194° → 179.8° → 180°; sway at rest within a second; the cord visibly wound on the turned tag. |
| Deck: a landing shadow that grows in the air and dies as the card lands; `power3.out` landing; layers only while pinned | Done | `--stack-lift` per frame. |
| Counter rail: tags and the credit slip fly on quadratic arcs with a ±8° tilt; cartons land with a settle that compresses the shelf; the ring overshoots 6° and settles; follower 0.22 → 0.26s | Done | Frame burst of step 1 shows tags tilted mid-arc landing in their slots. |
| Storefront street: slips flutter, cartons roll their route as one movement, awning stripes light from the centre, the inset zoom anticipates; scrub 0.5 → 0.35 | Done | |
| Store atlas: pins seat on the spring, tags hang like pendulums (`SPRING_HANG`), a needle leads each route's stitches, rivers on `power2.inOut`, the hover card and pin head on `--ease-spring` | Done | Frame burst: needles 3 → 2 → 1 → 0 as the routes finish, pin y −6.3 → 0, tag rotation settling. |
| Cabinet (`CardFan`): deals on the spring, moves on the soft spring, a lift shadow by `--fan-lift` | Done | |
| Timeline: standalone triggers on desktop too; the dot pops on the spring | Done | |
| Values panels grow on the soft spring; the dock and the WhatsApp button settle in on it; buttons press | Done | CSS. |
| Footer map: a spark leads each arc | Done | SSR-safe circles at opacity 0, `MotionPath` on desktop only. |
| Header: hides only on a fast downward scroll (> 400px/s past 240px), shows on any upward movement; the Businesses panel clears its clip | Done | |
| Marquee and testimonial columns: GSAP loops that decelerate to a pause and accelerate back (CSS keyframes remain the no-JS fallback), skew clamp 3° | Done | |
| On-screen guards on the tags' drop, the model board's figures and the marquee skew; `ModelBoard` fit variant guarded as a whole | Done | |
| Reduced motion | Done | Still a no-op everywhere: every new tween lives inside the existing motion branches; the placeholders, the tower and the marks are plain markup. |

## Checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 problems |
| `next build` (Sanity reads off) | every route static (`/proto/businesses` is the untracked local prototype, never committed) |
| `scratchpad/check_mobile_containment.py --diff HEAD` | PASS: 29 phone-only blocks, nothing else; `placeholder.css` carries no phone query |
| Desktop CSS identity (two builds, `mobile.css` as is vs emptied, every `max-width ≤ 767px` block stripped, hashed) | identical, 148,636 chars each: nothing in the phone layer reaches desktop |
| Ground walk, every route at 1440×900, five routes at 768×1024, six at 390×844 (touch), seven under reduced motion (headless Chrome, computed `background-color` of each section, adjacent pairs compared) | no two adjacent sections share a ground anywhere (the live site today fails on Apparels) |
| Stranded content after a full step-scroll (every `data-sr`, hero, drench, deck, tag and logo target checked for hidden/transparent/clipped) | none on any route, motion on, phones, or reduced motion; the only hidden elements are the Retail atlas's closed hover cards |
| Cumulative layout shift through a full scroll | 0 on every route and size (the placeholders reserve their frames) |
| Long tasks during a scripted scroll (production build) | home 50/104ms, Marketing 92ms, Apparels 148ms, Retail 59ms, the rest none; the live site today measures home 63/54/117/57ms, Apparels 51/120ms, Marketing 172/64ms, so no regression |
| Console errors | none on any route, size or motion setting |
| Home hero one-screen fit | holds at 1280×650, 1366×657, 1440×900 and 768×1024; 10 asks on the page (13 before); the two cards carry 3 marks |
| `/recognition` without JS (`curl`) | four `data-placeholder` figures, no `<img>` inside the award frames, the chip and the caption present |
| Seed dry-run vs HEAD | exactly one document added (`photoslot-recognitionHero`), one changed (`page-home`: the hero without its rail); no other field moves |
| Motion proof (headless frame bursts, production build) | tag turn 121° → 194° → 179.8° → 180° with the sway still inside a second and the cord wound on the back; hero lead blur 6px → 0.05px → none; deck card lift 0.03 → 0.27 → 0 with its shadow growing and dying; counter-rail tags tilted mid-arc; atlas needles 3 → 2 → 1 → 0 as the routes finish, pins and tags settling; cabinet first card y 32 → −27 → −20 (the spring's overshoot) with `--fan-lift` 1 on the active card; marquee pause button and pointer entry decelerate the loop 163 → 49 → 7 → 0 px/s |
| Phone overflow | `scrollWidth` equals the viewport on every audited route at 390px |

Method: headless Chrome over the DevTools protocol (`audit.mjs`, `motionproof.mjs`, `shoot.mjs`, `cssident.py` in the session scratchpad) against this round's production build on port 3100; the other chat's dev server on 3000 served a stale stylesheet for one late edit, so nothing above was read from it.

## Publish steps (done, in this order)

1. `git add -A -- . ':!src/app/(site)/proto'`, commit, `git push` (main deploys on Vercel; watched through the commit status until green).
2. `node scripts/seed.mjs --dry-run --out=<file outside the repo>`, diffed field by field against the live dataset over raw GROQ (key order and asset references normalised), then `npm run seed` (the seed now patches photo positions and awards rather than replacing them).
3. Signed POST to `/api/revalidate` (`_type: "sanity"`). Note for next time: `@sanity/webhook` 4.x's `encodeSignatureHeader` is async; an un-awaited call sends a Promise as the header and the route answers "Invalid signature".
4. Studio housekeeping for the client, still open: the orphans the seed never deletes (`groupstat-warehouse`, `photoslot-marketingCorridor`, `photoslot-marketingWarehouse`, `store-4`, `store-5`, plus the `marketingReason` and `groupStat` documents the code no longer reads).

## Flagged for you and the client

- The home hero's audience rail from round 9 is gone (your choice); the brand audience now reaches `/contact?intent=brand` through the header's "Talk to us" chooser and the swing-tag backs.
- The Apparels mission band's button, which repeated the hero's "Shop fast moving brands for your store" one screen later, was removed on your word after the publish (a code-only follow-up commit, no seed needed): the hero's button and the closing band carry the ask.
- The CMAI row ships with a drawn placeholder, not the existing "Distributor of the Year" trophy file: that file's own caption names a different award, so it would claim more in the row than it does in the cabinet. One line (`awards[0].image`) when the client confirms which trophy it is.
- When the photographs arrive: drop each file under `public/images/photos/awards/` and point the slot or the award at it, or upload in the Studio (the upload wins at once and now survives a re-seed).
- The seed script's new patch semantics for `photoSlot` and `award` documents (it still never deletes).
