# Change round 4: status

The fourth round (2 October 2026): the home hero loading in twice, the
"leading" pixel animation, and the Arihant Retail page (a realistic store map,
hover photos, and better copy).

- **Done**: implemented and verified locally (evidence column).
- **Pending**: waiting on something outside the code.

## Hero

| Item | Status | Evidence |
|---|---|---|
| Hero loads, then replays | Done | Root cause: the server painted the finished hero, then hydration hid it and replayed the intro. An inline head script now sets `html[data-intro]` before the first paint (motion users only), `motion.css` holds the hero under it with a 3s failsafe, and `HeroIntro` lifts the gate once its own start states are set. Screencasts of the load (desktop 1440, phone 390 at 2x, About) show no finished-then-reset frame; with JS off the hero renders in full; reduced motion never sets the gate. Every page's hero benefits, since they all use `HeroIntro`. |
| One orchestrated load | Done | Reveals, the line rise and the pixel word are one timeline, played after fonts settle (at most 800ms) with lag smoothing held, so a long task during hydration delays the intro instead of skipping its start. |
| "leading" animation | Done | Rebuilt: squares about 4px (scaled to the type), hopping cell to cell as they ride their line up, landing left to right as they set in full colour, then a stepped dither into the real word (no soft double image). Uses the shared `PIXEL` values. |

## Arihant Retail

| Item | Status | Evidence |
|---|---|---|
| Realistic map | Done | A shaded-relief terrain map toned to the site's paper, with India's borders as India draws them, the state borders, the Brahmaputra and its tributaries, and place names. Built by `scripts/build-atlas-map.mjs` from Natural Earth (public domain) and AWS open terrain tiles; relief image 121 KB. |
| Map animation | Done | The terrain comes up with a slow push in, borders and names fade in, rivers draw downstream, each route sews out stitch by stitch, pins drop with one landing ripple, swing tags swing in on their eyelets. A slight tilt toward the pointer on desktop. Phones get a shorter version; reduced motion gets the finished map. |
| Photos on hover | Done (photos pending) | Hovering a pin, tag or list entry opens a card (store, town, ownership, photo). On phones a tapped town docks its card under the map. The store's own Studio photo always wins; until then a credited town photo. The cards show without a photo until the town photos are approved. |
| Copy | Done in the seed | Hero lead, map lead, model lead and the closing band rewritten; headings unchanged. The band's button label is now editable in the Studio (`ctaLabel`). |

### Headline alternatives (for the client, not applied)

The retail H1 runs to 11 words against the 6-word guide. Options if they want it shorter:

- "Stores we stock, staff and run"
- "Northeast India's best-run stores"

### Town photo candidates (awaiting approval before download)

| Town | Pick | Licence |
|---|---|---|
| Guwahati | View of Guwahati city from atop Nilachal hill (Gitartha.bordoloi), or Guwahati-city-01 with the river (Anushila Bharali) | CC BY-SA 4.0 |
| Goalpara | Evening view of river Brahmaputra from Kacharighat (Moniruj) | CC BY-SA 4.0 |
| Kohima | Kohima 24 July 2021 (The Anonymous Earthling), or a foggy morning by Udayaditya Barua | CC BY-SA 4.0 / Unsplash |
| Itanagar | Itanagar Monastery amid hills (W0TAFF); no good free townscape exists | CC BY-SA 4.0 |

## Publishing

1. Deploy the code (pushed to `main`; Vercel builds it).
2. The new wording lives in the seed. Vercel reads live Sanity, so it shows only after a re-seed: run `node scripts/seed.mjs --dry-run --out=<file>`, port any Studio edits into the seed, then `npm run seed`. Checked 2 October: no live store record carries a photo, so no card can show the wrong store.
3. Revalidate, then check every page.
4. Round 3 leftovers still open: delete the **Tura** and **Next door** fit-out stores in the Studio.
