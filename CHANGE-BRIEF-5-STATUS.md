# Change round 5: status

The fifth round (3 October 2026): the Arihant Retail page reworked (premium
finish, better motion, one screen per band), the header's Businesses menu,
a lean footer, and logo walls without tiles.

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on something outside the code.

## Arihant Retail

| Item | Status | Evidence |
|---|---|---|
| Hero, more premium | Done | One screen from 768px up (`UnitHero fit`): the copy in eight columns, the headline at four lines, beside an offset stack of the two real photographs (store interior behind, Urban Closet storefront in front on a paper keyline). The photographs open out of a mask inside the hero's one load timeline; the back one drifts a little on scroll (fine pointers). The one action is a quiet jump to the stores (not a /partner ask). Hero 832px at 1440×900. Phones: lockup, headline, lead, link, then the two photographs side by side. |
| "On the street today": refined | Done | Deeper relief tone, an inner vignette and a lifted plate; the key inset on a frosted panel; pins spring a size up and tags cast a shadow when active. The entry build overlaps its stages, about 2.5s (was about 3.5s), with a calmer tag swing. |
| Pictures on hover | Done (placeholder) | Every store's card now opens with a picture. With no store photo yet, it is a drawn shopfront (`StorePlaceholder`): the store's own name on the fascia, a purple awning, labelled "Store photo coming soon", so it can never be taken for the real store. The card rises from the pin on a slight spring, the picture opens from the bottom, the lines draw, then the text. Verified: hovering the pin, the tag and the list entry opens the right store's card; Escape closes it. A photo set on the store in the Studio replaces the drawing automatically. Phones dock the card under the map with the drawing in a 3:2 frame. |
| "The zero-deadstock model" realigning | Done | Two causes fixed. (1) The word split could not break "zero-deadstock" at its hyphen, so the heading re-wrapped during and after its reveal; hyphenated heading words are now kept whole sitewide (`EmphasisHeading`, `.nobr`). Measured: 61px tall, one line, before, during and after the reveal. (2) The rail was sticky and slid against the rows; it no longer sticks. |
| Model fits one screen | Done | `ModelBoard fit`: the band is one viewport tall under the header, the heading on one line above both columns, tighter rows, the figures drawn as one sequence. 836px at 1440×900 (the screen minus the header); content ends 115px above the band's foot. /partner keeps its own layout. |
| Model copy, more concise | Done in the seed | Same claims, fewer words: the lead, the four pillar lines and the ROIC note (four sentences down to two, still no figure and still saying why). Headings and pillar titles unchanged. Shared with /partner's model board. |
| Hero and map leads | Done in the seed | Hero lead now says the counts in words; map lead shortened. |

## Header, footer, logo walls

| Item | Status | Evidence |
|---|---|---|
| Businesses menu: shorter lines | Done in the seed | A new Studio field, "Menu line" (`tagline`), used only in the menu: "Brand distribution since the 1990s", "Building category leaders since 2013", "Company-run multi-brand stores". The home page keeps its longer lines. Never clamped (measured: one line each, no ellipsis). |
| Businesses menu: logo alignment | Done | The three business logos had opaque white canvases; they are transparent cutouts now (`scripts/cutout-unit-logos.mjs`, originals kept in `assets/unit-logos-original/`), each in one fixed box, so the three names share a baseline (measured: equal tops). Also removes the white box from every unit hero's lockup. |
| Footer, less crowded | Done | Removed: the three intent links, the nav row, "Integrity · Discipline · Trust" and the privacy paragraph. Kept: the headline, the three contact blocks, the animated map, one slim bottom line (copyright, address, Get directions). The privacy line moved under the submit button of the inquiry form (/contact, /partner) and the brand-list form (/brands). |
| Apparels portfolio: no backgrounds | Done | The logo walls lost their white tiles: Apparels, and (as agreed) Marketing and /brands. Transparent logos sit on the section ground, sized by equal area; logos whose coloured block is the mark (BIBA, Libas and nine more) keep it as a rounded badge, as the home strip does. The partner pop-up still opens from every logo. |

## Checks

- `tsc`, `eslint src scripts`: clean for this round's files. `next build`: all 24 routes static. (An untracked `src/app/(site)/proto/` folder appeared from another session during this round; it is not part of round 5, currently fails `tsc` on its own, and must be left out of the round 5 commit.)
- Screenshots at 1440×900 and 390×844 (2x), and with reduced motion (the card opens at once, fully drawn). No horizontal scroll on a phone.
- With JavaScript off the production build renders the hero photographs and the map. The dev server does not load the hero images with JS off; that is a dev-only quirk.
- Seed dry run diffed against live Sanity: it matches the committed seed apart from this round's 11 intended changes, so there are no Studio edits to port.

## Publishing (done, 3 October 2026)

1. Committed as b28d459 (the untracked `proto/` folder left out) and pushed to `main`; the Vercel production deploy went live about two minutes later.
2. Re-diffed the seed against live Sanity right before seeding: still only this round's 11 changes. `npm run seed` upserted all 199 documents and uploaded the transparent logos (the retail logo now serves as the 396×228 cutout). Signed revalidate: `{"revalidated":true}`.
3. Checked on arihant-brand.vercel.app: the new retail copy, the drawn shopfront card on hover, the model band at 836px with its heading on one line (61px), the three menu lines, the transparent logos and the lean footer.
4. Still open from earlier rounds: delete the **Tura** and **Next door** fit-out stores in the Studio; store photographs from the client will replace the drawn shopfronts.

## Notes for the client

- A few light-grey logos (Clubwear, Chocolate Baby, Catwalk) read faintly on the paper ground without a white tile behind them. Darker versions of those files would fix it.
