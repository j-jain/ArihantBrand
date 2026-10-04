# Mobile revamp: status

Requested 4 October 2026: the phone site (≤767px) had cut-off and overlapping elements and looked plain; recompose every page for phones with a premium finish. Desktop (≥768px) must not change at all.

Decisions with the client: phones may reorder within a section and condense (rails, accordions, merged rows); copy stays word for word and every piece of content stays reachable; "premium" means premium within the brand (trade-house signage, Besley, vermillion and charcoal), not a magazine look. The shell and home were built first and approved locally (5 October), then the other pages followed.

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on a decision or a publish.

No copy changed, so there is nothing to seed.

## What was wrong

| Problem | Where | Fix |
|---|---|---|
| "Awards and testimonials" and the CMAI line ran off the screen at 360px | Home | The awards grid had one implicit column that the testimonial rail widened past the screen; it is now `minmax(0, 1fr)` on a phone. |
| The second funnel card sat half off screen in a rail, grey showing between the cards | Home | The two cards stack in one plate, a hairline between them. |
| The brand pause button sat on top of the last logo | Home | It is a round 44px button on the row under the track, beside "See all 77 labels". |
| The swing tags' drop and swing were clipped | Home | The tag row gains room above it and gives it back with a negative margin. |
| A screen-high gap under "Why us?" | Home | The phone deck stage is the deck plus room for the cards to rise through, pinned by its top under the header (see Motion). |
| The bar stayed up over the next page's CTA band after a client-side navigation | Every page | `useRivalCtaOnScreen(routeKey)` looks the bands up again on every route. |
| Sticky drawings and letters left a header-sized gap when the header slid away | Marketing, Apparels, Brands | The header publishes `--m-header-offset`; sticky elements sit at `--m-sticky-top`. |
| Two sticky drawings bled by an undefined `--gutter` (1rem instead of the real gutter) | Marketing, Apparels | The phone `:root` defines `--gutter` as `--m-gutter`. |
| The Kohima chip ran off the right edge | Retail | Chips are anchored in proportion to the pin's place across the map. |
| Text under 13px (GROUP at 9.6px, labels at 12px, the map card's "Store photo coming soon" at 8px, unit figure suffixes at 10.8px) | Many | A 13px floor (`--text-label` 0.8125rem). Two exceptions: GROUP is 11px and tracked, as part of the wordmark, and "Store photo coming soon" rose from 8px to 11px (it sits inside a 9rem drawing, where 13px does not fit). |
| Tap targets under 44px (wordmark, swing-tag buttons and asks, "See all" links, counter-rail step titles, A to Z letters, brand filters, short brand names) | Many | Each is at least 44px. |
| A 1692px footer on every page | Every page | About 900px (see Shell). |
| Found during verification: a client-side navigation from a scrolled page could leave About blank | About (phone, motion) | The Timeline built one `once` scroll trigger per entry through its timeline, which measures itself a tick late; the drench band created next re-measured it inside its own refresh, an entry already past its start fired and removed itself mid-loop, and the refresh threw. The new, shorter About layout exposed it. The phone branch now plays a paused timeline from a standalone `ScrollTrigger.create` (measured at once). A navigation fuzz (72 menu navigations from every page, scrolled to the foot and back, motion on and off) passes; the same flows on desktop were already clean, and the desktop branch is untouched. |

## Shell

| Item | Status | Evidence |
|---|---|---|
| Header | Done | 3.5rem bar under the 3px rule; ARIHANT over a tracked GROUP; Call and WhatsApp as 44px targets, a hairline, then the menu button. |
| Menu sheet | Done | The brand rule across its top; the businesses as ruled 56px rows with their logos and an arrow; the pages large in Besley; Partner with us, Call and WhatsApp under the thumb. CSS only (the sheet is shared with 768 to 1023px tablets, which are unchanged). |
| Action dock | Done | A floating charcoal dock inset from the screen edges above the safe area: Call, WhatsApp (its mark in WhatsApp green), the vermillion Inquire. Rises past the hero; stands down over the page's CTA band (on every route now) and over the footer. |
| Footer | Done | The reach line over the dotted map (texture at this size; its 4px hub label hidden, the svg keeps its description); the three units fold into a native exclusive accordion (`ContactAccordion`, `md:hidden`; the desktop columns are hidden on a phone); the office map edge to edge at 9.5rem. 1692px down to 864 to 914px. |

## Pages

| Page | Status | Evidence |
|---|---|---|
| Home | Done | Hero headline sized from its column so it always sets in three lines; the two figures side by side; funnels stacked; awards ledger; deck under its heading; swing tags on an edge-to-edge rail; brands row; closing asks as two full-width buttons. |
| Retail | Done | The long hero line (71 characters) steps down to four lines; chips on screen at 13px; the map card's "Store photo coming soon" tag at 11px (was 8px). |
| Marketing, Apparels | Done | Long feature headlines step down; step titles are 44px rows; sticky drawings follow the header and bleed by the real gutter; figure suffixes 13px. |
| Brands | Done | 44px filters, view switches, A to Z letters and names; the brand-list gate a plate with full-width buttons. |
| Trade Notes | Done | The newest note as a lead card with its photograph edge to edge, the rest as compact ruled rows with square thumbnails (about 2,300px shorter). |
| Article | Done | The closing ask as a plate; "More notes" rows at least 44px. |
| About | Done | Leaders as a ruled ledger with a small square plate beside each name (four mostly empty 4:5 plates cost two screens); house rows 56px; values panels a little shorter. |
| Partner | Done | How it works on a numbered spine (a true sequence); the dark FAQ plus mark in the large-mark red. The 409px measurement was the invisible FlipLead measuring element, which is hidden and clipped: nothing was cut off. |
| Contact | Done | Each unit a ruled block with full-width rows; the office address a plate. |
| Recognition | Done | Cabinet certificates wider (64%) with 15px captions; trophy rows tighter. |
| Everywhere | Done | The new type scale and rhythm, 48/52px buttons with pressed states, 52px form fields with a focus ring, the vermillion rule over every section heading (approved by the client). |

## Checks

| Check | Result |
|---|---|
| Containment (`scratchpad/check_mobile_containment.py`, v2) | PASS: 29 phone-only media blocks, nothing else in mobile.css; no phone-only query in any other stylesheet. |
| Desktop CSS (every route, phone blocks stripped, against the pre-revamp build) | PASS: identical on every route. |
| Desktop screenshots and layout signature (12 routes plus the open menu sheet at tablet widths, the Businesses panel and the scrolled header at 1366; 768x1024, 1023x768, 1024x768, 1366x657, 1536x864, 1920x1080) | PASS: the layout signature (every rendered element's box and computed style) is identical on all 76 captures. Pixels match except inside images: Next re-encodes optimised images on a fresh cache, so a few photos and logos (and the swing tags' shadows, which follow the logos) differ by some pixels; the compare masks image boxes for that reason. |
| Phone audit (11 routes at 360x780, 390x844, 430x932 and 361x640, with motion) | PASS on every route at every size: no sideways scroll, no text cut off, no tap target under 44px, no text under 13px (the two marked 11px exceptions aside), no sticky gap under the header, no console errors; the deck engages at all four sizes, including a 640px-tall screen; the footer is 864 to 914px. |
| Phone audit with reduced motion (390x844) | PASS on every route (the deck keeps its plain readable column, as designed). |
| Dock after a client-side navigation (home, then About through the menu) | PASS: hidden over the home CTA band, shown mid-page, hidden again over the CTA band on About after a client-side navigation (before the fix it stayed up). |
| Client-side navigation fuzz (phone, every page to every menu destination, scrolled to the foot and back first; motion on, then reduced) | PASS: 72 of 72 navigations with motion, 72 of 72 with reduced motion. |
| `tsc --noEmit`, `eslint src scripts`, `next build` | Clean; every route static. |

Method: headless Chrome over the DevTools protocol (the in-app preview pane pauses animation frames while hidden). The pixel compare blanks the footer's Google Map frame and needs a fresh `.next/cache/images`: a re-encoded photo differs by a few thousand pixels on its own (seen once on /partner at 1366; with a fresh cache the slice matched the baseline exactly).

## Notes

- The desktop WhatsApp button shares the CTA-yield hook and has the same after-navigation behaviour; fixing it would change desktop, so it was left as it is.
- The "Why us?" deck mechanics are unchanged on desktop; on a phone only the stage size and pin anchor changed (`CardsStack`, phone branch).
