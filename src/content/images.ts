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
  /** Site-root path, e.g. "/images/stock/hero/home-texture.jpg" */
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
  src: string;
  alt: string;
  /** CSS aspect the layout reserves, e.g. "4 / 5". Reserving it means
   *  swapping the photograph never shifts anything around it. */
  ratio: string;
  /** True once this is Arihant's own photograph rather than stock. */
  real: boolean;
  /** What the client needs to shoot to make this slot real. */
  wanted?: string;
}

export const stockImages = {
  /* ---------------------------------------------------------------- hero */
  homeTexture: {
    src: "/images/stock/hero/home-texture.jpg",
    alt: "Folded grey linen in soft directional light, the weave visible up close",
    width: 2400,
    height: 1600,
    credit: "Luca Laurence",
    source: "unsplash",
    sourceUrl: "https://unsplash.com/photos/grey-linen-FseXc3OsIic",
  },

  /* ------------------------------------------- trade: Arihant Marketing */
  marketingWarehouse1: {
    src: "/images/stock/trade/marketing-warehouse-1.jpg",
    alt: "Tall pallet racking stacked with labelled cartons in a distribution warehouse",
    width: 1601,
    height: 2400,
    credit: "ALHAWRAA",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/warehouse-storage-with-stacked-cardboard-boxes-38195854/",
  },
  marketingWarehouse2: {
    src: "/images/stock/trade/marketing-warehouse-2.jpg",
    alt: "Low-angle view of warehouse racking loaded with wrapped cartons under working lights",
    width: 2200,
    height: 1467,
    credit: "Ryan Klaus",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/low-angle-shot-of-boxes-standing-on-the-shelves-in-a-warehouse-27111449/",
  },

  systemsWarehouse1: {
    src: "/images/stock/trade/systems-warehouse-1.jpg",
    alt: "Tall stacks of sealed kraft cartons on pallets under the blue steel roof of a wholesale godown",
    width: 2000,
    height: 1500,
    credit: "Ihsan Adityawarman",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/stacked-boxes-in-a-warehouse-10834810/",
  },

  /* -------------------------------------------- trade: Arihant Apparels */
  apparelsRacks1: {
    src: "/images/stock/trade/apparels-racks-1.jpg",
    alt: "Linen shirts on wooden hangers along a showroom rack in natural light",
    width: 1600,
    height: 2400,
    credit: "Pew Nguyen",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/clothes-in-neutral-colors-hanging-on-the-racks-in-a-clothing-store-17293347/",
  },
  apparelsRacks2: {
    src: "/images/stock/trade/apparels-racks-2.jpg",
    alt: "Black and white shirts alternating along a display rail by a shop window",
    width: 2200,
    height: 1469,
    credit: "Star Zhang",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/black-and-white-clothing-display-in-retail-shop-29906028/",
  },

  /* ------------------------------------------------------- trade: about */
  aboutCraft1: {
    src: "/images/stock/trade/about-craft-1.jpg",
    alt: "A tailor's hands cutting grey cloth with shears at a workbench",
    width: 1600,
    height: 2400,
    credit: "Anna Shvets",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/close-up-of-a-hand-with-scissors-cutting-a-fabric-5830661/",
  },
  aboutCraft2: {
    src: "/images/stock/trade/about-craft-2.jpg",
    alt: "Hands smoothing a stack of freshly cut cream fabric panels on a worktable",
    width: 1600,
    height: 2400,
    credit: "Jane Blaze",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/hands-on-top-of-folder-fabrics-12362543/",
  },

  /* ----------------------------------------------------- trade: partner */
  partnerStorefront: {
    src: "/images/stock/trade/partner-storefront.jpg",
    alt: "A shopfront glowing warm at night, garments and goods visible through arched windows",
    width: 1600,
    height: 2400,
    credit: "Avenu3",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/stylish-boutique-window-display-at-night-37118432/",
  },

  /* -------------------------------------------------------------- retail */
  retailInterior1: {
    src: "/images/stock/retail/retail-interior-1.jpg",
    alt: "Interior of a multi-brand clothing store with racks, shelving and a central display case",
    width: 2200,
    height: 1467,
    credit: "Rachel Claire",
    source: "pexels",
    sourceUrl: "https://www.pexels.com/photo/clothing-store-interior-5531541/",
  },
  retailInterior2: {
    src: "/images/stock/retail/retail-interior-2.jpg",
    alt: "Apparel and accessories arranged on a display table inside a warmly lit store",
    width: 1600,
    height: 2400,
    credit: "Ron Lach",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/interior-of-a-clothing-store-8311878/",
  },

  retailCartons1: {
    src: "/images/stock/retail/retail-cartons-1.jpg",
    alt: "A bright distribution aisle with racking loaded on both sides with wrapped cartons",
    width: 2000,
    height: 1125,
    credit: "Handi Boyz LLC",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/stacks-of-cardboard-boxes-5775099/",
  },

  /* ------------------------------------------------- blog thumbnails, 3:2 */
  blog1: {
    src: "/images/stock/blog/blog-1.jpg",
    alt: "A dark warehouse aisle between tall stocked racks, daylight at the far end",
    width: 1600,
    height: 1067,
    credit: "Othmane Ettalbi",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/dimly-lit-warehouse-aisle-with-tall-shelves-30341205/",
  },
  blog2: {
    src: "/images/stock/blog/blog-2.jpg",
    alt: "A loaded cargo truck moving along a highway, the roadside blurred with speed",
    width: 1600,
    height: 1067,
    credit: "mohamad hassan",
    source: "pexels",
    sourceUrl: "https://www.pexels.com/photo/truck-on-highway-20862827/",
  },
  blog3: {
    src: "/images/stock/blog/blog-3.jpg",
    alt: "Early morning on a shuttered Indian market street, knitwear hung outside shopfronts",
    width: 1600,
    height: 1067,
    credit: "Basit Manzoor",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/bustling-street-scene-in-ludhiana-india-32486624/",
  },
  blog4: {
    src: "/images/stock/blog/blog-4.jpg",
    alt: "Folded shirts spaced along timber shelves against a glass-block wall",
    width: 1600,
    height: 1067,
    credit: "Iryna Varanovich",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/selection-of-clothes-on-shelves-21835299/",
  },
  blog5: {
    src: "/images/stock/blog/blog-5.jpg",
    alt: "Garments on wooden hangers suspended in rows inside a boutique",
    width: 1600,
    height: 1067,
    credit: "Ron Lach",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/hangers-in-a-clothing-store-8306359/",
  },
  blog6: {
    src: "/images/stock/blog/blog-6.jpg",
    alt: "Folded jeans sealed in poly bags, stacked on a table ready for dispatch",
    width: 1600,
    height: 1067,
    credit: "Dmitriy Steinke",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/a-pile-of-jeans-in-plastic-packages-lying-on-a-table-17096040/",
  },
  blog7: {
    src: "/images/stock/blog/blog-7.jpg",
    alt: "A fabric swatch book with handwritten shade names and prices per metre",
    width: 1600,
    height: 1067,
    credit: "Eugenia Remark",
    source: "pexels",
    sourceUrl:
      "https://www.pexels.com/photo/fabric-samples-in-a-notebook-15764776/",
  },
  blog8: {
    src: "/images/stock/blog/blog-8.jpg",
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
    // A clothing floor rather than a fabric swatch: the first photograph on the
    // site should show the business the group is actually in. Native portrait,
    // so the 4/5 frame takes it without a hard crop.
    src: stockImages.retailInterior2.src,
    alt: stockImages.retailInterior2.alt,
    ratio: "4 / 5",
    real: false,
    wanted:
      "Portrait of the Guwahati godown mid-dispatch: stacked indents, staff working, shot in daylight.",
  },
  homeProofGround: {
    src: stockImages.marketingWarehouse2.src,
    alt: "",
    ratio: "16 / 9",
    real: false,
    wanted: "Wide shot of the racking in either godown, used at low opacity behind the award band.",
  },

  /* ---- Arihant Marketing --------------------------------------- AM4 */
  marketingWarehouse: {
    src: stockImages.marketingWarehouse1.src,
    alt: stockImages.marketingWarehouse1.alt,
    ratio: "4 / 5",
    real: false,
    wanted:
      "Portrait of the 15,000 sq ft Marketing godown: binned stock, a picker mid-indent.",
  },
  /* The award band stands on the trophy itself. It is a real object we hold,
     photographed as it sits, which is worth more to a brand manager than a
     stock godown dimmed to 30% behind a headline. */
  marketingAward: {
    // The file is 899x1599, so a 2/3 frame trims about 16% of the height. The
    // object-position in .am-award__object spends that on the empty tabletop
    // below the plaque rather than on the trophy.
    src: "/images/photos/awards/award-distributor-of-the-year.jpg",
    alt: "The Golden Star Seller Distributor of the Year trophy awarded to Arihant Marketing",
    ratio: "2 / 3",
    real: true,
  },
  marketingCorridor: {
    src: stockImages.blog2.src,
    alt: stockImages.blog2.alt,
    ratio: "16 / 9",
    real: false,
    wanted:
      "A loaded Arihant vehicle on the Guwahati corridor, shot from the roadside.",
  },
  /* ---- Arihant Apparels ---------------------------------------- AA6 */
  apparelsWarehouse: {
    src: "/images/photos/apparels-warehouse-2.jpg",
    alt: "Racks of folded denim organised by label in the Arihant Apparels warehouse, Guwahati",
    ratio: "4 / 5",
    real: true,
  },
  apparelsTeam: {
    src: "/images/photos/apparels-team.jpg",
    alt: "The Arihant Apparels team at their Guwahati office",
    ratio: "4 / 3",
    real: true,
  },

  /* ---- Arihant Retail ------------------------------------------ AR4 */
  retailInterior: {
    src: "/images/photos/store-interior.jpg",
    alt: "Inside an Arihant Retail floor: merchandised, staffed and stocked by our own team",
    ratio: "4 / 5",
    real: true,
  },
  retailShopfront: {
    src: "/images/photos/store-ebo-indian-terrain.jpg",
    alt: "A national brand partner's outlet run by Arihant Retail",
    ratio: "3 / 2",
    real: true,
  },

  /* ---- Partner / About ------------------------------------------ I8 */
  partnerStorefront: {
    src: stockImages.partnerStorefront.src,
    alt: stockImages.partnerStorefront.alt,
    ratio: "4 / 5",
    real: false,
    wanted: "An Arihant Retail store lit at night, shot from the street.",
  },
  aboutCraft: {
    src: stockImages.aboutCraft1.src,
    alt: stockImages.aboutCraft1.alt,
    ratio: "4 / 5",
    real: false,
    wanted: "The family on the Arihant Tower floor, or the original counter if a photograph exists.",
  },

  /* ---- Contact --------------------------------------------------- X4 */
  officeMap: {
    // AWAITING ASSET: a committed static map image of Arihant Tower,
    // Jyotikuchi. Not a third-party embed — DESIGN.md forbids external
    // scripts and CDN calls, so this must be a file in the repo. Until it
    // exists the address block renders its directions link and no image.
    src: "",
    alt: "Map showing Arihant Tower, Jyotikuchi, Guwahati",
    ratio: "3 / 2",
    real: false,
    wanted:
      "A static map export (PNG/WebP, ~1200x800) centred on Arihant Tower, committed under public/images/photos/.",
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
