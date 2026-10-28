# Change round 13: status (home, Marketing, Apparels and Retail edits)

Requested 28 October 2026. These are the client's edits to the home page and the three unit pages. Other sessions did their own round-13 work in the same working tree on the same day (store addresses and Maps links, swing-tag motion, analytics and the tab icon, performance). That work is not covered here.

- **Done**: implemented and verified locally.
- **Flagged**: a judgement call for you or the client.

**Not yet published.** Nothing is committed. Publish order: commit (together with the other sessions' work, once they agree) → push → Vercel green → re-run the seed dry-run diff → `npm run seed` → delete the live `award-2` document (see below) → signed revalidate → verify live.

## Decisions taken with you on 28 October

| Question | Outcome |
|---|---|
| "Brand partners in the tags like a stat": which figure? | One per distribution tag. Marketing's warehouse line becomes **Brand partners 48**; Apparels' "Exhibitions led on footfall 4" becomes **Brand partners 29**. The same figures print under both unit heroes. |
| Apparels hero: the team photo, and the rest of the page | The team photo is the wide hero photo. The fair inset stays. The team band lower down keeps the same photo, so it **appears twice** on the page. |
| Where "multi-brand stores across Northeast India" goes | In the Retail hero headline. |
| How far the NEGTA removal goes | **The awards list only** (shared by the home band and /recognition), plus the /recognition lines that counted it. The About story still tells it. |

## What changed

| Where | Before | Now |
|---|---|---|
| Home hero photo (`homeHero`) | The Itanagar polo wall | The group's building (`group-building-portrait.jpg`, the Marketing hero's file) |
| Home funnel cards, the logos | 6×1.75rem boxes | 4.75×2.75rem (phone 3.9×2.25rem). All three marks share the class, so Retail's grows too. |
| Funnel card, retailer | "…onto your racks, keep the size sets whole, and settle claims on the date we name." | "You run a counter. We keep your racks full of the national labels that move." |
| Funnel card, Own a retail store | "You bring the capital and the property. We hire, buy, merchandise and market…" | "You bring the intent. We run the show, right from the first hire." |
| Awards list (home band + /recognition) | CMAI; NEGTA founder membership; Highest footfall · Regional garment exhibitions · 4 fairs | CMAI; **Highest footfall in exhibitions** (the title alone). Rows print issuer and year only when filled. The `award` schema no longer requires either field. |
| /recognition hero lead + meta | "One national award, one founding membership, and 4 regional fairs led on footfall." | "One national award and the highest footfall at the region's garment exhibitions." |
| Marketing years (`facts.marketing.years`) | 30 | **35**: the tag, the hero figures, the meta, the summary, the CTA ("Put 35 years…"), the /brands CTA and the Marketing FAQ |
| Marketing hero | The trophy inset and the "Best Distributor of India · CMAI 2015" seal line | The building alone. `FeatureHeroMedia`'s `inset` is optional; the `marketingAward` slot and the `sections.award` copy are deleted. |
| Apparels hero logo | 4.75×2.6rem, the shared lockup size | 6×4rem (phone 4.5×2.75rem), Apparels only, via `data-unit` on the lockup |
| Apparels hero photo (`apparelsHero`) | The Itanagar store floor | The team at the office (`apparels-team.jpg`, 16:9). The tall desktop frame shows the middle of the group. |
| Apparels hero lead | "…with westernwear, kidswear and footwear beside them, bought on sell-through data so your racks hold what moved." | "…with kidswear and footwear beside them." |
| Westernwear elsewhere on Apparels | The portfolio lead, the business point and the FAQ bullet | All cut. Deal Jeans keeps its "Women's westernwear" brand category. |
| Retail hero headline | "…professionally run retail stores in Northeast India" | "The most modern and professionally run **multi-brand stores across** Northeast India" (it still fits one screen at 1280×650) |
| Itanagar store (`store-3`) | Tanzee | **Urban Closet** (the name its sign and the client's photo folder carry). Same id, so no orphan. |

## Verified (28 October)

- `tsc --noEmit` clean; `npm run lint` clean. **No production build was run**: another session's build/server held `.next` at the time.
- The running dev server (seed content) renders every change on /, /arihant-marketing, /arihant-apparels, /arihant-retail and /recognition, checked in the DOM. Headless Chrome screenshots: home at 1440 and 390, Marketing at 1440, Apparels at 1440, 1280×650 and 390, and Retail at 1280×650.
- `scratchpad/check_mobile_containment.py`: PASS.
- Seed dry-run vs live: 19 documents differ, all intended. That covers this round's business, page, funnel, FAQ, award and photo-slot docs, plus the other session's five store address/Maps docs. No Studio drift.

## For publish, and flagged

- **Delete `award-2` from the live dataset after seeding.** The seed writes awards by index, so the footfall entry moves to `award-1` (the old NEGTA doc), and `award-2` (the old "4 fairs" footfall row) would otherwise stay live as a duplicate. Neither doc has an uploaded image, so nothing needs unsetting.
- Studio orphan for the client (invisible): `photoslot-marketingAward`, alongside the older `store-5`, `groupstat-warehouse`, `photoslot-marketingCorridor` and `photoslot-marketingWarehouse`.
- **Flagged**: the Retail headline and its lead now both say "multi-brand stores". The lead could start "Stores our team staffs…" if that reads as a repeat.
- **Flagged**: Itanagar's atlas card and proof-strip photo is still the interior. With the store now named Urban Closet, its storefront (whose sign reads Urban Closet) could be used instead.
- The Apparels mission paragraph and the brand FAQ still say "sell-through". The request covered the hero's lead only.
- The Apparels CTA lead and the FAQ still say "the region's last 4 garment fairs". The request covered the awards entry only.
