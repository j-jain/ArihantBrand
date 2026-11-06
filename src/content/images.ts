/** The site's photography manifest.
 *
 *  TWO registers, deliberately separate:
 *
 *  1. `photoSlots` — every position on the site that wants a photograph of
 *     Arihant's own operation. Each slot is a named key with the aspect the
 *     layout needs, honest alt text, and `real: true|false`. A slot marked
 *     `real: false` is standing on stock until the client's photograph lands;
 *     swapping it in is then a one-line change here and nothing else moves.
 *     This is what the change brief's photography items (I1-I12, HP3, AM4,
 *     AA6, AR4, R10) are waiting on.
 *
 *  2. `stockImages` — the curated stock library those slots draw from. All
 *     files live under public/images/stock/ and are committed to the repo.
 *     Provenance: Unsplash and Pexels only. Both licenses permit commercial
 *     use without attribution; photographer and source URL are recorded
 *     regardless.
 *
 *  Alt text rule: describe what is visible, in brand voice. A stock photo's
 *  alt text NEVER claims the scene shows Arihant's own warehouse, store or
 *  people. Real photos always outrank stock in placement.
 */

export interface StockImage {
  /** Site-root path, e.g. "/images/stock/blog/blog-1.webp" */
  src: string;
  /** Factual description of the visible scene; no invented claims. */
  alt: string;
  width: number;
  height: number;
  /** Photographer display name. */
  credit: string;
  source: "unsplash" | "pexels";
  /** Photo page URL (not the CDN file). */
  sourceUrl: string;
}

/** One photographic position on the site. */
export interface PhotoSlot {
  /** Site-root path, or "" while the position has no file at all (not even
   *  stock). A page must draw `PhotoPlaceholder` for an empty src and never
   *  hand it to next/image; see isPendingSlot(). */
  src: string;
  alt: string;
  /** CSS aspect the layout reserves, e.g. "4 / 5". Reserving it means
   *  swapping the photograph never shifts anything around it. */
  ratio: string;
  /** True once this is Arihant's own photograph rather than stock. */
  real: boolean;
  /** What the client needs to shoot to make this slot real. */
  wanted?: string;
  /** A caption the photograph itself proves (its own banner, say). It
   *  belongs to the shipped file: a Studio upload replaces the slot without
   *  it (getPhotoSlots), so a new picture is never mislabelled. */
  caption?: string;
}

export const stockImages = {
  /* ------------------------------------------------- blog thumbnails, 3:2 */
  blog1: {
    src: "/images/stock/blog/blog-1.webp",
    alt: "A dark warehouse aisle between tall stocked racks, daylight at the far end",
    width: 1600,
    height: 1067,
    credit: "Othmane Ettalbi",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/dimly-lit-warehouse-aisle-with-tall-shelves-30341205/",
  },
  blog2: {
    src: "/images/stock/blog/blog-2.webp",
    alt: "A loaded cargo truck moving along a highway, the roadside blurred with speed",
    width: 1600,
    height: 1067,
    credit: "mohamad hassan",
    source: "pexels",
    sourceUrl: "https://www.pexels.com/photo/truck-on-highway-20862827/",
  },
  blog3: {
    src: "/images/stock/blog/blog-3.webp",
    alt: "Early morning on a shuttered Indian market street, knitwear hung outside shopfronts",
    width: 1600,
    height: 1067,
    credit: "Basit Manzoor",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/bustling-street-scene-in-ludhiana-india-32486624/",
  },
  blog4: {
    src: "/images/stock/blog/blog-4.webp",
    alt: "Folded shirts spaced along timber shelves against a glass-block wall",
    width: 1600,
    height: 1067,
    credit: "Iryna Varanovich",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/selection-of-clothes-on-shelves-21835299/",
  },
  blog5: {
    src: "/images/stock/blog/blog-5.webp",
    alt: "Garments on wooden hangers suspended in rows inside a boutique",
    width: 1600,
    height: 1067,
    credit: "Ron Lach",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/hangers-in-a-clothing-store-8306359/",
  },
  blog6: {
    src: "/images/stock/blog/blog-6.webp",
    alt: "Folded jeans sealed in poly bags, stacked on a table ready for dispatch",
    width: 1600,
    height: 1067,
    credit: "Dmitriy Steinke",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/a-pile-of-jeans-in-plastic-packages-lying-on-a-table-17096040/",
  },
  blog7: {
    src: "/images/stock/blog/blog-7.webp",
    alt: "A fabric swatch book with handwritten shade names and prices per metre",
    width: 1600,
    height: 1067,
    credit: "Eugenia Remark",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/fabric-samples-in-a-notebook-15764776/",
  },
  blog8: {
    src: "/images/stock/blog/blog-8.webp",
    alt: "A pigeonhole wall of folded dress shirts sorted by colour and pattern",
    width: 1600,
    height: 1067,
    credit: "Magda Ehlers",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/organized-display-of-dress-shirts-in-store-29765480/",
  },
} as const satisfies Record<string, StockImage>;

export type StockImageKey = keyof typeof stockImages;

/* ------------------------------------------------------------------ */
/* Photographic slots                                                   */
/*                                                                      */
/* Every position on the site that wants a photograph of Arihant's own  */
/* operation. `real: false` means the slot is standing on stock until    */
/* the shoot lands; `wanted` says what to shoot. Swapping one in is a    */
/* one-line edit here, and the ratio is already reserved so nothing      */
/* around it moves.                                                     */
/* ------------------------------------------------------------------ */

export const photoSlots = {
  /* ---- Home ---------------------------------------------------- HP3 */
  homeHero: {
    // The group's own racked stock, not a stock boutique (change round 9): the
    // first photograph on the site shows the business the house is in, from a
    // godown it runs. Since change round 12 (client's request) a store's polo
    // wall; since change round 13 (client's request) the group's building, a
    // portrait cut of it, and the polo wall moved to the Marketing hero.
    src: "/images/photos/group-building-portrait.webp",
    alt: "Arihant Tower, the group's building in Guwahati, where all three businesses work",
    ratio: "4 / 5",
    real: true,
  },
  homeProofGround: {
    // The Apparels dispatch floor, open cartons mid-indent, at low opacity
    // behind the awards band (change round 9: it stood on stock racking).
    src: "/images/photos/apparels-warehouse-1.webp",
    alt: "",
    ratio: "16 / 9",
    real: true,
  },

  /* ---- Arihant Marketing --------------------------------------- AM4 */
  /* The feature hero (change round 6): a wide photograph run to the screen's
     edge and a smaller inset on it. Since change round 11 the wide one is the
     Marketing godown itself (the client's own photograph; it stood on stock
     until then). From change round 7 the inset was the trophy; since change
     round 13 Marketing's hero has no inset. */
  /* In change round 12 the wide one was the group's building (client's
     request); the godown still runs in the About values panel. Once the home
     hero took the building (change round 13), the Marketing hero took the
     home hero's earlier photograph, the Itanagar polo wall (client's
     request): landscape, so the tall frame centres on the two polos. */
  marketingHero: {
    src: "/images/photos/stores/store-itanagar-polos.webp",
    alt: "A wall of polos and folded shirts on timber and steel shelving, two polos hung at its centre",
    ratio: "4 / 5",
    real: true,
  },
  /* The trophy inset (`marketingAward`, change rounds 7 to 12) came off the
     hero in change round 13 at the client's request, with the proof line
     beside it. The cut-out still stands in the recognition cabinet. */
  /* ---- Arihant Apparels ---------------------------------------- AA6 */
  /* The feature hero (change round 6): the team working the warehouse floor,
     and the 2024 spring summer fair (its banner names the event). */
  /* In change round 12 the wide one was a store floor stocked by Apparels;
     since change round 13 (client's request) it is the team at their office,
     the same file as the team band lower down. The photograph is 16:9, so the
     tall desktop frame shows the middle of the group; the inset is unchanged. */
  apparelsHero: {
    src: "/images/photos/apparels-team.webp",
    alt: "The Arihant Apparels team in their green uniforms at the Guwahati office",
    ratio: "4 / 5",
    real: true,
  },
  apparelsHeroInset: {
    src: "/images/photos/apparels-fair-2024.webp",
    alt: "The Arihant Apparels team outside the Spring Summer Garment Fair, January 2024",
    ratio: "4 / 3",
    real: true,
    caption: "Spring Summer Garment Fair, January 2024",
  },
  apparelsWarehouse: {
    // The dispatch floor (change round 9): the racked denim moved to the home
    // hero, so the Apparels page does not print the same photograph twice.
    src: "/images/photos/apparels-warehouse-1.webp",
    alt: "Open cartons of the season's indents on the Arihant Apparels dispatch floor in Guwahati",
    ratio: "4 / 5",
    real: true,
  },
  apparelsTeam: {
    src: "/images/photos/apparels-team.webp",
    alt: "The Arihant Apparels team at their Guwahati office",
    ratio: "4 / 3",
    real: true,
  },

  /* ---- Arihant Retail ------------------------------------------ AR4 */
  /* The retail hero's two frames (change round 11): both from the client's
     Goalpara shoot (public/images/photos/stores/, scripts/process-store-
     photos.mjs), so the alt text may name the town. The back frame is the
     aisle; the front frame is the counter under the store's own lit sign,
     cut to the frame's 6:7 by the script. The ~400px files these replaced
     (store-interior.jpg, store-urban-closet.jpg, the town of the second
     never confirmed) are gone, and with them the small-file caps. */
  retailInterior: {
    src: "/images/photos/stores/store-goalpara-aisle.webp",
    alt: "The aisle of Urban Closet, Goalpara, under the track lights, folded stock on the shelves either side",
    ratio: "4 / 5",
    real: true,
  },
  retailStorefront: {
    src: "/images/photos/stores/store-goalpara-sign.webp",
    alt: "The counter at Urban Closet, Goalpara, under the store's lit sign",
    ratio: "6 / 7",
    real: true,
  },

  /* ---- Partner / About ------------------------------------------ I8 */
  /* The real store beside the managed-store model (change round 9; it stood
     on a stock shopfront with arched windows): since change round 11 the
     Goalpara counter under its sign, the same file as retailStorefront. */
  partnerStorefront: {
    src: "/images/photos/stores/store-goalpara-sign.webp",
    alt: "The counter at Urban Closet, Goalpara, under the store's lit sign",
    ratio: "6 / 7",
    real: true,
  },
  /* The group's own building (change round 11; the team photograph stood
     here from change round 9, and still runs on the Apparels page). The
     client's file is titled the group building; the About copy and the
     contact settings place all three businesses in Arihant Tower. */
  aboutCraft: {
    src: "/images/photos/group-building.webp",
    alt: "Arihant Tower, the group's building in Guwahati, where all three businesses work",
    ratio: "3 / 2",
    real: true,
  },
  /* The three expanding panels in the About values section, one business
     each since change round 11: the Apparels team at the fair, the Marketing
     godown's racks, a Retail store's aisle. */
  aboutValue1: {
    src: "/images/photos/apparels-fair-2024.webp",
    alt: "The Arihant Apparels team outside the Spring Summer Garment Fair, January 2024",
    ratio: "3 / 4",
    real: true,
  },
  aboutValue2: {
    src: "/images/photos/marketing-godown-2.webp",
    alt: "Racks of packed denim and cartons of the season's indents in the Arihant Marketing godown, Guwahati",
    ratio: "3 / 4",
    real: true,
  },
  aboutValue3: {
    src: "/images/photos/stores/store-goalpara-aisle.webp",
    alt: "The aisle of Urban Closet, Goalpara, under the track lights, folded stock on the shelves either side",
    ratio: "3 / 4",
    real: true,
  },

  /* ---------------------------------------------------------- recognition */
  /* No file yet (change round 10): the hero draws a PhotoPlaceholder until
     one lands. Swap in: drop the file under public/images/photos/awards/,
     set src and alt, real: true; or upload onto "Recognition: hero" in the
     Studio, which wins at once. */
  recognitionHero: {
    src: "",
    alt: "",
    ratio: "3 / 2",
    real: false,
    wanted: "The CMAI 2015 award, at the presentation or as it sits today.",
  },
} as const satisfies Record<string, PhotoSlot>;

export type PhotoSlotKey = keyof typeof photoSlots;

/** Slots still standing on stock, for the status report and for a quick
 *  answer to "what is the photographer actually shooting?". */
export function pendingPhotoSlots(): { key: string; wanted: string }[] {
  return Object.entries(photoSlots)
    .filter(([, slot]) => !slot.real)
    .map(([key, slot]) => ({ key, wanted: (slot as PhotoSlot).wanted ?? "" }));
}

/** True while a position has no photograph at all (change round 10). The
 *  page draws `PhotoPlaceholder` for it (src/components/PhotoPlaceholder.tsx);
 *  a Studio upload (getPhotoSlots) or a committed file here replaces it. */
export function isPendingSlot(slot: Pick<PhotoSlot, "src">): boolean {
  return slot.src === "";
}

/* ------------------------------------------------------------------ */
/* 3. Town photographs (change round 4)                                 */
/* ------------------------------------------------------------------ */

/** A licensed photograph of a TOWN, never of a store. The Arihant Retail
 *  store atlas shows it in a store's hover card until the client sends a
 *  photograph of the store itself (a store's own `image`, set in the Studio,
 *  always outranks it). Alt text and caption name the town only.
 *
 *  Unlike the stock register these can come from Wikimedia Commons, so the
 *  licence travels with the file and the card prints the credit the licence
 *  asks for. */
export interface TownPhoto {
  src: string;
  /** What is visible, naming the town, never a store. */
  alt: string;
  width: number;
  height: number;
  /** Photographer as the licence asks to credit them. */
  credit: string;
  /** e.g. "CC BY-SA 4.0", "Unsplash License". */
  license: string;
  /** Photo page URL (not the file). */
  sourceUrl: string;
}

/** Keyed by town (src/content/towns.ts `townKey`). A town without a row
 *  gets a card without a photograph. */
export const townPhotos: Readonly<Record<string, TownPhoto>> = {};
