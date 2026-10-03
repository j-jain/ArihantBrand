# Change round 6: status

Round 6 was built by two sessions at once. This file starts with the
footer map link, the Marketing and Apparels heroes and the /brands index;
the Marketing counter rail and the Apparels storefront street (the other
session's work) belong in their own section below.

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on something outside the code.

## Footer map link

| Item | Status | Evidence |
|---|---|---|
| Address as a proper Google Maps link | Done | The footer address itself is the link (pin icon, underline, ↗, new tab, a full aria-label), and /contact's "Get directions" and the JSON-LD `hasMap` use the same `mapsUrl()`. It is Google's documented cross-platform format (`maps/search/?api=1`, opens the Maps app on a phone), searching "Arihant Tower, Jyotikuchi, Guwahati, Assam 781040"; the landmark phrases stay in the printed address but out of the query. 44px tap height on a phone. |
| The exact pin | Pending (client) | New Studio field, Site settings > "Google Maps link". Paste the share link of the Arihant Tower pin (Google Maps > Share > Copy link) and the footer, /contact and the JSON-LD use it at once; no code change. Seed value is empty until then. |

## Marketing and Apparels heroes

| Item | Status | Evidence |
|---|---|---|
| Full revamp | Done | New `UnitHero feature` variant: one screen from 768px up, the copy in seven columns (lockup, balanced headline, lead, primary button plus the second ask as a quiet link, the figures counting up), a wide photograph run to the screen's edge at the hero's full height, and a smaller one laid over its corner on a paper keyline. Marketing adds a proof line, "Best Distributor of India · CMAI 2015". Measured: 832px at 1440×900, copy ends at 755px of 768 at 1366×768, no sideways scroll on a phone. |
| Positioning and copy | Done in the seed | Marketing: "The Northeast's pioneer garment distributor" / "Since the 1990s we have carried national brands to 300+ retailers in all seven states of the Northeast, visiting every counter on a 20-day cycle." Apparels: "We turn labels into the Northeast's category leaders" / "Founded in 2013 by Ajay Sancheti, Arihant Apparels carries 29 labels, led by the region's leading ladies' ethnic wear, and buys on sell-through data so retailers stock what sells." Figures from facts.ts. The client's old Apparels tagline stays as its positioning line (home, menu). |
| Placeholder pictures | Done (photos pending) | Four new Studio photo slots: Marketing hero and inset (stock warehouse racking and a stock distribution aisle, honest alt, `real: false`), Apparels hero and inset (the team on the warehouse floor and the 2024 Spring Summer Garment Fair, both real). Uploading a file in Studio > Site Photograph replaces each; the fair caption shows only on the shipped file. |
| Motion | Done | Both photographs open from the bottom inside the hero's one load timeline; on desktop the wide picture pans slowly in its frame and the inset drifts the other way as the page scrolls; the inset tilts toward the pointer. Reduced motion gets them as served. |

## /brands: the index

| Item | Status | Evidence |
|---|---|---|
| A new way to show every brand | Done | `BrandIndex`: all 77 labels as an A to Z in large Besley, each on its business's accent square, a sticky letter per group, groups rising in on scroll. Hovering a name floats its logo card beside the cursor on a spring with a slight tilt while the other names step back; keyboard focus anchors the card; a click opens the brand's sheet. A Logos view shows the same set as the tile-less wall. Server-rendered: with JS off all 77 names are readable. |
| Search bar | Done | Ignores case, accents and punctuation; matched letters highlighted; the names re-flow (GSAP Flip); `/` focuses it, Esc clears. Verified: "biba", "la scoot", "re pink", "7l", "believe in" each find their one label; "jeans" finds 5; "xyz" shows "“xyz” isn't on our list yet." with "Ask if we can source it" (WhatsApp, "do you distribute xyz?") and "Send an enquiry". |
| Filter, jump, count | Done | All / Arihant Marketing / Arihant Apparels (29 of 77 for Apparels); live count; A to Z bar with scroll-spy, and a jump lands the letter 15px under the sticky toolbar whether scrolling down (header hidden) or up (header shown). |
| Phones | Done | Toolbar scrolls with the page (stuck, it held half the screen), filters and letters scroll sideways, names at 1.3rem, a tap opens the sheet. No sideways scroll. |

## Checks

- `tsc` and `eslint src scripts`: clean. `next build`: all routes static.
- Screenshots at 1440×900, 1366×768, 390×844 (2x), reduced motion (card shows without the follow; filtering instant) and JS off (names readable, toolbar not shown).

## Publishing

Done 4 October 2026 with round 7 (commit e416fe7, seeded, revalidated, checked live); see CHANGE-BRIEF-7-STATUS.md. The original plan, kept for reference: both sessions' work sat uncommitted in the same tree. Then: commit, push, dry-run the seed against live Sanity (photo slot documents are re-created without an image, so check none holds a Studio upload first), seed (copy, the four photo slots, the new settings field), signed revalidate, check live.
