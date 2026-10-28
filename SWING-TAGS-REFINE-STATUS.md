# Swing tags refine: status (28 October 2026)

The home section "Three businesses, one standard" (`BusinessTags`) refined at the user's request: the same three tags, words, data and tap-to-turn, rebuilt to read as real printed card tags on a store rail and to move like hung objects. Code only: no copy, data or schema change, so no Sanity seed.

## Decisions (user)

| Question | Pick |
| --- | --- |
| Rest pose | Natural: each tag a few degrees turned (yaw −7°, +5°, −4°) at its own drop, squaring up when pointed at, focused or centred on a phone |
| Entrance | Hung one by one |
| Print | Real tag details (same words) |

## What changed

| Area | Now |
| --- | --- |
| Files | `_components/BusinessTags.tsx` rebuilt; new pure `_components/tagModel.ts` (die, cord, light, sway); `src/app/tags.css` rewritten; mobile.css section 24; `src/lib/gsap.ts` exports `HANG` |
| Rail | Steel tube on two round wall flanges with cups, flat tones, a shadow on the wall; phones run it edge to edge |
| Cord | Hitched round the rod, longer, threaded through a flat brass eyelet; slack and bowed while a tag is held up; the wind climbs from the card when it turns |
| Card | Die cut (`tagDie`): chamfered head, rounded foot, notches at a perforated stub; woven label with a running stitch; condensed stat figures; stub with barcode and Turn over / Turn back |
| Sway | Cord and card as two damped modes stepped exactly on the GSAP ticker (same settle time at 30 to 240 Hz); kicked by a brushing pointer, turns, the entrance, a neighbour through the rail, and on phones by sliding the rail |
| Turn | House spring a third slower; directional light on the faces; an edge hairline when the card passes edge-on |
| Focus | A ring that follows the die; after a keyboard turn focus lands on the back's first ask |
| Phones | Layout containment on each tag and an end spacer: the row's scroll width no longer changes while a tag swings |
| Reduced motion | The rest pose; a turn crossfades the faces; no entrance, sway or square-up |

## Verified

| Check | Result |
| --- | --- |
| `tsc --noEmit`, ESLint on the changed files | Clean |
| `npm run build` | Pass, every page static (one earlier attempt failed only on a Google Fonts download) |
| Containment script | PASS (29 phone blocks, nothing else) |
| Built CSS vs live CSS | No new utilities minted; only the new `btag-*` hooks |
| Layout at 1536×864, 1440×900, 1366×657, 1280×720, 1024×768, 768×1024, 390×844, 360×740 | No sideways overflow, cards one height, spec lines on one line at 768 |
| Phone slide | Row scroll width constant across 234 frames; the centred tag squares up; a tap turns |
| Never hidden | Reload below, hash jump, fast flick, focus before the entrance, reduced motion on mid-entrance and mid-turn: tags always end visible |
| Contrast | Back meta text 6.6 / 9.1 / 5.4 to 1; focus ring at least 6.7 to 1 |
| Performance | Nothing writes to the tags at rest; sway costs no layout per frame |

Not verified: Safari and Firefox (Playwright's browser downloads are blocked on this network); checks ran in Chrome only.

## Publishing

Live 28 October 2026: commit 4ed3a58 pushed to `main` (on top of change round 13), Vercel deploy succeeded, checked on www.arihant.marketing (the new markup served, the three tags hang visible in their rest pose, a tap turns a tag, no page errors). The commit carried only this work's files and hunks; another session's later edits in the same tree were left out, and `src/app/(site)/proto/` stays uncommitted. No seed was needed.
