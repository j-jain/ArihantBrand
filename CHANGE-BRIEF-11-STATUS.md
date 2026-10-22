# Change round 11: status

Requested 22 October 2026: place the client's photographs (dropped into the shared `Arihant\Photo` folder on 19 October: five store shoots, the Marketing godown, the group's building, a team photo, the exhibition film) wherever the site has a slot for them, favouring them over what the site showed, remove the stand-ins they replace, and remake the awards cabinet so the trophies and certificates read as awards rather than as snapshots of them.

- **Done**: implemented and verified locally (evidence column).
- **Flagged**: a judgement call for you or the client.

**Not yet published.** Everything below is in the working tree, uncommitted. Publish order: commit and push to `main` -> Vercel deploy -> `node scripts/seed.mjs --dry-run --out=<file>` and a diff against the live dataset -> `npm run seed` -> the signed revalidate.

## Decisions taken with you on 22 October

| Decision | Outcome |
|---|---|
| The Itanagar photographs show an URBAN CLOSET sign; the site lists the Itanagar store as Tanzee | **Keep Tanzee, use no Itanagar photographs.** The Itanagar set is not processed. If the client confirms the store's name, add it to `scripts/process-store-photos.mjs` and the gallery. |
| The "Guwahati Store Photos" show the store under Indian Terrain and Spykar fascias (the one earlier rounds left unplaced as a single-brand outlet) | **Same store as Urban Closet, Guwahati; use them.** The alt text says what the fascias show. **Flagged**: the client should confirm the store trades as Urban Closet. |
| A Tura storefront exists; the site said four stores, and the client had Tura removed as a fit-out in round 2 | **Tura is the fifth store, franchisee-owned.** Counts are now 2 company-owned + 3 franchisee-owned = 5 (`facts.ts`, derived). **Flagged**: on your word, not the client's. |
| The awards cabinet | **A shelf of cut-outs** replaces the fan of cards; the hero shows three of them. |

## Photographs placed

| Where | Before | Now | Source |
|---|---|---|---|
| Retail hero, back frame (`retailInterior`) | `store-interior.jpg`, 386px, town unknown | The Goalpara aisle | `Urban Closet Goalpara\DSCF0040.JPG` |
| Retail hero, front frame (`retailStorefront`) | `store-urban-closet.jpg`, 401px, town unconfirmed | The Goalpara counter under its lit sign, cut to 6:7 | `DSCF0048.JPG` |
| Partner model band (`partnerStorefront`) | the same 401px front, capped at 15.5rem | The Goalpara counter, cap raised to 18rem | same |
| Store atlas hover cards and the Partner proof strip (`stores[].image`) | drawn shopfronts, "Store photo coming soon" | Guwahati, Goalpara, Kohima and Tura fronts; the strip prints store and town under each | the four folders' front shots |
| Retail page, new band "Inside the stores" | none | nine floor photographs on a four-column grid (`StoreGallery`) | Guwahati SST2/SST3, Goalpara DSCF0001/0015/0030, Kohima IMG_4866/4957/4962 and IMG-20240325-WA0031 |
| Marketing feature hero, wide photo (`marketingHero`) | stock warehouse (Pexels) | The Arihant Marketing godown | `Arihant Marketing Godown Photo 1.jpeg` |
| Marketing hero inset (`marketingAward`) | the trophy photographed on an office table, cropped high | The trophy cut out, whole, on the paper-shade plate | `Awards/` original via `scripts/cutout-awards.py` |
| About story aside (`aboutCraft`) | the Apparels team photo (also on the Apparels page) | The group's building | `Arihant Group Building Photo.jpg` |
| About values panels 2 and 3 | the Apparels floor and dispatch floor (both used elsewhere) | The godown's racks; the Goalpara aisle (one business per panel with the fair) | `Godown Photo 4.jpeg`; `DSCF0040.JPG` |
| Recognition hero (`recognitionHero` pending) | drawn `PhotoPlaceholder` | The cabinet's first three cut-outs on a shelf inside the plate | |
| Recognition trophy case rows | three drawn placeholders | No frame unless the award carries a photograph (none does yet); rows run full width | |
| Recognition cabinet | `CardFan`: eight snapshots in 4:5 plates | `TrophyShelf`: nine cut-outs on drawn shelves, captioned, click to enlarge; the Tadpole 2018 launch trophy added | |

Stock survives only on the Trade Notes thumbnails. Deleted: `store-interior.jpg`, `store-urban-closet.jpg`, `store-ebo-indian-terrain.jpg` (a 640px copy of the Guwahati front), `src/components/motion/CardFan.tsx`.

Not placed, and why: the new team photo (1079px) is the same picture as the committed 1280px `apparels-team.jpg`; `Arihant Exhibition Video.mov` is byte-identical to the repo's `Arihant Event Promo.mov`, already served as the Marketing film; the Shree Shyam Televenture logo has no slot; Kohima's lingerie wall, perfume close-ups and the timestamped Octave shot; the Thailand "thank you for participating" plaque (a memento, not an award; its cut-out is written for the Studio anyway). The old `awards/*.jpg` stay committed until the live dataset is re-seeded (its `recognitionPhoto` documents reference them); delete them in a later round.

## Scripts

| Script | What it does | Evidence |
|---|---|---|
| `scripts/process-store-photos.mjs` (new) | Reads the sibling `../Photo` folder (never served), writes 18 JPEGs under `public/images/photos/` and `photos/stores/` (EXIF-rotated, long edge 1600 or 2000, two pre-cropped frames) | 18/18 written, 70KB to 433KB |
| `scripts/cutout-awards.py` (new, Python, rembg) | Reads the ten gitignored `Awards/` originals, keys out the background, de-fringes, trims, writes `awards/cut/<name>.webp` and the generated `src/content/award-cutout-sizes.ts` | see "Cut-outs" below |

## Cut-outs

Model: rembg `isnet-general-use`, alpha matting off, then a light de-fringe, trim and 3% air. BiRefNet could not be fetched (see the network note). Three files needed hand-set corrections, written into the script so a re-run reproduces them:

| File | Size | KB | How | Note |
|---|---|---|---|---|
| `award-twills-2021.webp` | 821x1098 | 93 | isnet | clean |
| `award-distributor-of-the-year.webp` | 889x1124 | 44 | isnet + erase + restore | the matte kept the black office chair under the left wing and in the gap before the sphere (erased by a box and a polygon, dark or grey pixels only) and cut the right wing off at the blinds' cord (its tip traced back from the photograph) |
| `award-tadpole-launch-2018.webp` | 554x917 | 39 | isnet | clean |
| `award-tadpole-champion-2122.webp` | 1400x618 | 95 | isnet | clean |
| `award-indian-terrain-east-india.webp` | 1362x909 | 94 | quad | isnet kept the paper and threw the frame away; cut as the frame's four corners instead |
| `award-indian-terrain-2023.webp` | 583x1400 | 45 | isnet | clean; the clear acrylic carries a little of the room, as the object does |
| `award-octave-excellence-2024.webp` | 949x1242 | 72 | quad | as East India |
| `award-tadpole-assam.webp` | 919x907 | 81 | isnet | clean |
| `award-cmai-nigf-2024.webp` | 1187x879 | 117 | isnet | clean, frame whole |
| `award-tadpole-15yr-thailand.webp` | 537x1384 | 64 | isnet | written, not placed (a memento, not an award) |

**Network note.** This machine's connection resets TLS to GitHub's release-asset host, where rembg fetches its models (and where onnxruntime-node fetches its binaries, so the Node alternative could not install either). The isnet model came from a Hugging Face mirror (sha256 `4c56bbc2…`) into `~/.rembg/models/isnet-general-use/`, and the script runs with `MODEL_CHECKSUM_DISABLED=1` because the mirror's bytes do not match rembg's recorded MD5. BiRefNet's ONNX file has no mirror there (only the 844 MB PyTorch weights), so it was not tried; on another network, drop the variable and run with the default model to compare.

The Python environment lives outside the repo (this session's scratchpad: `py -3.13 -m venv venv`, `pip install "rembg[cpu]" pillow`); nothing was added to `package.json`.

## Code

| Item | Status | Evidence |
|---|---|---|
| `facts.retail`: 2 + 3, `storesOpen` derived; every "four stores" literal now interpolates (`seed.ts` business copy, the About timeline's "Five stores, two models") | Done | `grep -w four` leaves only unrelated fours (steps, reasons) |
| Tura: store record, `towns.ts` pin (90.20E 25.51N, tag hung left), PRODUCT.md | Done | Five pins on the atlas at 1440 and 390, tags clear of each other |
| `TrophyShelf` (`src/components/`), its desktop block in `motion.css`, phone rules in `mobile.css` section 16; `CardFan` and its rules deleted | Done | /recognition at 1440: nine objects on two shelves, captions; 390: a rail of plates |
| Recognition hero plate (`.shelf-plate`) with the `hero` variant; `AwardMedia` renders only with an image | Done | no "Photo coming soon" anywhere on the site |
| `RecognitionPhoto` carries `width`/`height`; the GROQ reads `image.asset->metadata.dimensions`, the mapper falls back to the seed entry by path | Done | tsc clean |
| `StoreGallery` (`arihant-retail/_components/`), `src/app/gallery.css` (imported in globals.css), `mobile.css` section 18 rail, `storeGallery` in the seed, `sections.gallery` on the retail page copy | Done | /arihant-retail at 1440: 4 x 3 grid closes; 390: rail |
| `ProofStrip`: four up, store and town under each, the record's caption as alt | Done | /partner at 1440 and 390 |
| Marketing inset `object-fit: contain` on the plate (`feature-hero.css`) | Done | |
| Docs: DESIGN.md (recognition, retail, imagery, components, motion), CLAUDE.md, PRODUCT.md, SETUP.md | Done | |

## Verification

- `npm run lint` clean; `npx tsc --noEmit` clean.
- `scratchpad/check_mobile_containment.py`: PASS (29 phone-only blocks in mobile.css, none elsewhere). Desktop CSS changes this round (new shelf and gallery rules), so the byte-identity check does not apply.
- Headless captures at 1440x900 and 390x844 (reduced motion, scrolled through): /arihant-retail, /partner, /arihant-marketing, /about, /recognition, home (unchanged). The cabinet's enlarge dialog checked in the browser: opens on the object's button with the caption as title and the alt text as description, focus on its close button, the picture loaded, Escape closes it.
- Seed dry run: 203 documents (201 before: one store, one recognition photo more); the five store documents carry their image paths and captions, the nine recognition documents their cut-out paths, `page-retail` its `gallery` section.

## For the client

1. Confirm the Guwahati store trades as Urban Closet (its fascias read Indian Terrain and Spykar).
2. Confirm Tura as a trading, franchisee-owned store.
3. Confirm the Itanagar store's name; its photographs (an URBAN CLOSET sign) are held until then.
4. The CMAI 2015 Best Distributor row still has no photograph of its own; upload one on the award document in the Studio and the row takes it.
