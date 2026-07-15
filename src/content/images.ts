/** Curated stock photography manifest.
 *
 *  Every stock photo the site uses is listed here; pages must reference
 *  stock imagery only through this file, never by raw path. All files live
 *  under public/images/stock/ and are committed to the repo.
 *
 *  Provenance: Unsplash and Pexels only. Both licenses permit commercial
 *  use without attribution; photographer and source URL are recorded here
 *  for provenance regardless. The three real store photos in
 *  public/images/photos/ always take priority over stock in placement.
 *
 *  Alt text rule: describe what is visible, in brand voice. Never claim a
 *  scene shows Arihant's own warehouse, store, or people.
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
