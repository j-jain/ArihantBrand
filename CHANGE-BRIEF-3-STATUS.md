# Change round 3: status

The client's third round (1 October 2026): the "Why us?" card movement, the
hero stats and the "leading" word, the brand-logo backgrounds, and the Arihant
Retail page with a store map.

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on something outside the code.

## Why us?

| Item | Status | Evidence |
|---|---|---|
| Card movement fixed | Done | Rebuilt as a pinned deck. The section holds while cards 2 to 4 slide up and land one measured heading strip below the last, so every heading stays readable. A card settles back only once the next one overlaps it. The gathered deck holds about 0.5 viewport of scroll, then the deck and heading leave together as one piece. Measured at 1440×900, 390×844 and 360×640: no crossing, no inversion, no early shrink. Phones pin the deck alone, clear of the header and the action bar. Screens too small for the gathered deck (320×568) and reduced motion get a plain column. |

## Hero

| Item | Status | Evidence |
|---|---|---|
| "leading" not italic | Done | Emphasis is upright sitewide ("leading", "pioneer", "systematic", "most modern", the brands hero), colour unchanged. |
| Pixels forming "leading" | Done | A canvas outside the headline builds the word from square pixels as its line rises, then hands over to the real word, which never leaves the page for screen readers. Skipped under reduced motion and forced colours. |
| Number first, capitalised | Done | "300+ Retailers served" / "80+ Brand partners", figures right-aligned in one column. The hero still fits one screen at all seven laptop sizes and on phones. |

## The brands we carry

| Item | Status | Evidence |
|---|---|---|
| Logo backgrounds removed | Done | No tiles or borders in the marquee. 52 logos are transparent cutouts with no halos (checked on paper, paper-shade, white and dark). The 23 logos whose coloured block is the logo keep it as matching rounded badges. The 2 photographic logos (Caroline, Mayur) are left out of the marquee and stay on the full brand wall. Originals are kept in `assets/partner-logos-original/`. |

## Arihant Retail

| Item | Status | Evidence |
|---|---|---|
| Page re-composed | Done | Hero with the store-interior photo beside the lead and no repeated stat band. The store atlas follows. ModelBoard loses its photo and duplicate button, so its empty column is gone. Two asks to /partner, separated by ModelBoard. |
| "On the street today" on a map | Done | A custom map drawn in the site's own style: the Northeast in square pixels, stitched routes from the Guwahati warehouse to each store, solid pins for company-owned and framed pins for franchisee-owned, a swing tag per store linked to its entry in the store list. No API key, no tracking, no third-party script. Keyboard, screen reader, phone (town chips) and no-JS versions all work. Only trading stores appear, so the two old fit-out records still in the Studio do not show. |
| URBAN CLOSET photo | Done | Detached from the Itanagar (Tanzee) store, and shown uncaptioned on /partner. Stores show without photos until real ones arrive. |

## Review

An adversarial review (six reviewers, every finding checked by two skeptics trying to refute it) confirmed 14 issues, all fixed:

- the deck kept a GSAP tween per scroll frame alive (memory growth); it now writes styles directly;
- the pinned deck snapped 8px as it engaged, because the header shrinks after scroll positions are measured; the header now re-measures once its height settles;
- the store map's tags, key and phone map were hidden from the keyboard and screen readers until scrolled into view; they now stay focusable, and focusing the map finishes its build at once;
- the brand marquee could only be paused by mouse hover (WCAG 2.2.2); it now has a pause/play button for keyboard and touch (this predated round 3);
- smaller: the pixel-word line offset, a subgrid fallback gap, re-tapping a store entry not unpinning it, phone chip hit areas 0.2px under 44px, a chip covering a route on 320px phones, a store with no ownership showing the company-owned pin, and doc/Studio-label drift.

Gates: `tsc` and `eslint src scripts` clean; both production builds pass (rendering from code, and against live Sanity, where the stale fit-out stores are already filtered out); the phone-layer containment check passes; grid structure identical at 768, 1024 and 1440 on every changed page.

## Publishing

1. Deploy the code.
2. Re-seed Sanity after a dry-run diff (new hero lines, Tanzee without the photo, the transparent logo files).
3. Revalidate, then check every page on arihantgroup.in.
4. Studio cleanup for the client: delete the stores **Tura** and **Next door** (already hidden on the page).
