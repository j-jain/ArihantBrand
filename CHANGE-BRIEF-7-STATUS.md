# Change round 7: status

Requested 4 October 2026. Code only: nothing in this round needs a seed.

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on something outside the code.

## /recognition

| Item | Status | Evidence |
|---|---|---|
| Remove "When each of these happened" | Done | The Timeline section is gone from the page (`/about` still renders the same years). "What the trade says" moved to paper-shade so the cabinet (paper) and the voices no longer share a ground. Sections now: hero, trophy case, cabinet, voices, closing band. |

## Footer: the office on a live map

| Item | Status | Evidence |
|---|---|---|
| A Google Map to click, not only a link | Done | On every page, above the bottom line: a live Google Map of Arihant Tower (pan, ctrl+scroll zoom, Google's own Open in Maps and Directions), 16rem tall, a little grey at rest and in colour on hover or focus, with a paper card on the right (Arihant Tower, the landmarks, Jyotikuchi, Guwahati 781040, "Open in Google Maps ↗") that opens the same link as the address. `mapsEmbedUrl()` in `src/lib/seo.ts`; it resolves to the "Arihant tower" listing on Lokhra Rd by Shankar Hotel. `loading="lazy"`, so it loads only as the footer comes near. Phones: a 13rem map with the card as a strip under it, no sideways scroll at 390px. |
| Note on privacy | For the client | This is the site's first third-party frame. Google may set its own cookies when the map loads; until now the site needed no consent banner because Plausible is cookieless. If that matters, the map can be made click-to-load (a still placeholder until tapped). |

## /arihant-marketing

| Item | Status | Evidence |
|---|---|---|
| Trophy as the hero's small photograph | Done | The trophy photo (`photoSlots.marketingAward`) replaces the stock inset on the hero's wide photograph, in a narrower portrait frame (`FeatureHeroMedia insetRatio`, cropped high so the trophy stays whole). The proof line "Best Distributor of India · CMAI 2015" under the figures stays and names it. The round 6 `marketingHeroInset` slot, never published, is removed. |
| Remove the award band | Done | The charcoal "Best Distributor of India" band and its CSS are gone. The film after it stays (confirmed with the client). |
| Remove "300+ shop-in-shop counters handled across the region's modern trade" | Done | The pull-quote and its godown photograph are gone, with their CSS. |
| Remove "Why the Northeast needs a specialist" | Done | Gone. "Distribute your brand" is still asked in the hero and the closing band. |
| Page order and grounds | Done | hero (paper), film (paper-shade, on the page's band rhythm), what a brand gets (paper), how we work with retailers (paper-shade), the labels (paper), FAQ (paper-shade), closing band. No two neighbours share a ground. |
| "How we work with retailers": placement | Done | The heading runs across the top; beneath it the four steps and the drawing start on one line. Pinned, every size answers to the screen's height and the drawing is sized from the room under the heading, so it is never taller than the screen. |
| ... lock the screen | Done | Root cause: on a laptop window around 1280×650 or 1366×657 the left column was 70px too tall for the pin's budget, so the section silently did not pin at all and the whole drawing played in about one screen of scroll. It now pins at 1280×650, 1366×657 and 1536×864 (measured: the stage is `position: fixed` through the pin, plate bottom 637 of 657). Only windows under about 560px tall fall back to scrolling. |
| ... slower, longer | Done | Scroll length 1.6 → 2.2 screens per unit: the pin is now about 8.5 screens, each step about 2.5. On desktop the drawing also has a speed limit: measured in Chrome, an instant 5.5-screen jump played step 1, then 2, then into 3 at about 1.2 s a step instead of jumping. |
| Phones unchanged | Done | Rail measured before and after at 375×812 (sticky drawing) and 375×560 (plain column): identical positions and heights. |
| Reduced motion | Done | No pin, the finished drawing and all four steps' text, heading across the top. |

## Checks

- `tsc --noEmit` and `eslint src scripts`: clean. `next build`: all routes static.
- Screenshots (headless Chrome, real scale): Marketing hero at 1280×650 and 1536×864, the rail at each step at 1366×657, the footer map at 1536×864, phone hero and footer at 390×844.

## Pending in the Studio (client)

- Dead copy that no page renders now: Marketing page `specialist` section and Recognition page `milestones` section. Harmless; remove whenever convenient, or leave.
- Photo slot documents for `marketingWarehouse` and `marketingCorridor` (no longer shown, and no longer in the Studio's position list): delete them.

## Publishing

Not done: needs a go-ahead. Round 6 (two sessions' work) is still uncommitted in the same tree, so rounds 6 and 7 go out together: commit, push, then the round 6 seed steps in `CHANGE-BRIEF-6-STATUS.md` (this round adds nothing to seed).
