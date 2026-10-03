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

## Checks

- `tsc --noEmit`, `eslint src scripts`: clean. `next build`: passes, all routes static.

## Publishing

Not done. When asked: commit (without `src/app/(site)/proto/`), push, dry-run three-way seed check, seed (the "Why us?" copy), signed revalidate, check live.
