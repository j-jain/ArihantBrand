# Change round 8: status

Requested 4 October 2026, home page.

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on a decision or a publish.

## "Why us?"

| Item | Status | Evidence |
|---|---|---|
| Cards stacked, covering each other | Done | `CardsStack` lands each card a sliver below the last (`PEEK_REM`: 0.9rem desktop, 0.65rem phone) instead of a full heading strip, so it covers the card beneath all but its top edge; cards behind settle back a little further (`SCALE_STEP` 0.035), so the edges narrow going back. Deck cards stand at least 14rem (10rem phone) with the heading at the top and the line at the foot, and the phone's pinned deck is centred on screen. Same pin, slide-up, dwell and release as before. Verified at 1536x864 and 390x844 (gathered deck: a card with three edges above it). Reduced motion and no-JS keep the plain readable column. |
| Shorter, catchier copy | Done in the seed | Lead "Four reasons retailers stay." (heading "Why us?" kept). Cards: "Every category, one partner" / "Men, women, kids, denim, ethnic, footwear. 77 labels, one set of terms, one indent, one visit." · "A seasoned team that decides" / "Years on these routes. They know your counter, your customer and last season's sellers." · "Only category leaders" / "No fillers. Every label leads its category, or is being built to." · "In your store every 20 days" / "Orders, claims and feedback, face to face. The cycle never slips." Figures from facts.ts. These are Sanity documents (`pillar-0..3`, `page-home`), so they go live with a seed after the deploy. |

## "Three businesses, one standard": swing tags

| Item | Status | Evidence |
|---|---|---|
| Four prototypes, one pick | Done | Built Arihant Tower, Swing tags, Title sequence and Shirt drawers as working prototypes; the client picked the swing tags. |
| Swing tags replace the section | Done | `BusinessTags` (`_components/BusinessTags.tsx`, `src/app/tags.css`, mobile.css section 24) is the home `#businesses` section: three tags on a clothes rail, logo, name, line on a band, three figures as spec lines, barcode; the asks on the back. `UnitShowcase` and its phone rules deleted. Checked at 1536x864, 1366x657, 768x1024 and 390x844: no sideways scroll, the three tags hang level. |
| Tap again turns it back | Done | Both faces carry a stretched turn button: a tap anywhere turns a tag over, a tap anywhere on the back but a link turns it back (hit-tested: the back's text hits "Turn back", an ask hits its link). Keyboard: focus follows to the face now showing. |
| The cord twists as the tag turns | Done | The string is a two-ply cord redrawn every frame from the same GSAP proxy that turns the tag (`back.out`, so it overshoots and settles): a loose 1.5-turn twist at rest, wound to 4 turns while the back shows, unwound on the way back. A paper hairline keeps it visible over a dark back. Close-ups captured at rest, mid-turn and turned. |
| Motion settings | Done | Tags drop onto the rail as the section arrives and sway as a fine pointer passes; a turn kicks the sway. Reduced motion: an instant turn (cord still winds), no drop, no sway. No JS: each back shows under its front. |
| The prototype page | Done (local only) | `http://localhost:3000/proto/businesses` now holds only the swing tags and renders the same `BusinessTags`, so it cannot drift from the home page. The other three prototypes are deleted. 404 in a production build (verified); `src/app/(site)/proto/` is never committed. |

## Follow-up: spacing pass (after publishing)

Live 4 October 2026: commit e179b5a, code only (no seed), Vercel deploy succeeded, checked on arihant-brand.vercel.app (deck heading-to-line gap 11px at 1536x864, brands heading on the left axis, tags tightened).

| Item | Status | Evidence |
|---|---|---|
| Gap between a "Why us?" heading and its line | Done | The deck cards had been given a 14rem minimum with the line pushed to the foot, which opened a gap under each heading. Cards are sized by their content again, set a size up instead (more padding, 1.85rem heading, the line in a 1.15rem lead size 0.7rem under it). |
| Swing tags: dead space inside | Done | The longest back (Marketing's positioning line) set every tag's height and left a gap above "Turn over". The backs' type is a touch smaller, spare height now opens above the barcode, and both faces end on their turn button. The three tags fit one 1536x864 screen. |
| One left axis | Done | "The brands we carry" was the only centred heading on the home page; its heading and "See all" link now sit on the same left edge as every other section. |
| Rest of the page | Checked | Section padding (about 140px top and bottom at 1536x864) and heading-to-content gaps (about 40px) are consistent across hero, awards, "Why us?", businesses, brands, Trade Notes and the closing band; nothing else changed. |

## Follow-up 2: "Why us?" fuller

| Item | Status | Evidence |
|---|---|---|
| Cards back to their earlier size, all identical | Done | Every deck card is the tallest card's height (228px each at 1536x864, 217 at 1366x657), set a size up with more air inside rather than stretched, so the heading and its line stay one block. Phone cards set a size up too (205px each at 390x844; still fits a 360x640 screen). |
| The screen was too empty | Done | The rail under "Why us?" now holds an index of the four reasons, marking the card on top as the deck builds (desktop and tablet). |
| Copy back up a little | Done in the seed | Each card got back the clause the first cut took, meaning as before: "...77 labels on one set of terms, one indent, one visit, one partner." / "Years on these routes. They know your counter and what sold there, and can say yes on the spot." / "...or is being built to, so the space on your racks goes to stock that sells." / "...The cycle never slips, because service is what we compete on." Needs a seed after the deploy (`pillar-0..3`). |

## Checks

- `tsc --noEmit`, `eslint src scripts`: clean. `next build`: passes, all routes static.

## Publishing

Done 4 October 2026:

- Commit 3fa39a8 pushed to `main` (without `src/app/(site)/proto/`, which stays local); Vercel production deploy succeeded.
- Three-way check before seeding: no Studio edits to port, no conflicts, no photo slot holding an upload. The seed changed exactly five documents: `page-home` (the "Why us?" lead) and `pillar-0..3` (the four cards).
- `npm run seed` (200 documents) and a signed revalidate (`revalidated: true`).
- Checked live on arihant-brand.vercel.app: the stacked deck with the new lead and cards, the swing tags with a tag turned over, the old business rows gone, `/proto/businesses` answering 404.

Still in the Studio for the client to delete (unchanged from round 7): `photoslot-marketingCorridor`, `photoslot-marketingWarehouse`, `groupstat-warehouse`, `store-4`, `store-5`, and the old draft `drafts.page-apparels`.
