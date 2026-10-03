/**
 * Words that live inside two drawn sections (change round 6):
 *
 *  - the Arihant Marketing counter rail ("How we work with retailers"), whose
 *    labels are phrases lifted from the four steps' own text, shortened to fit
 *    the drawing, so it says what the reader has just read;
 *  - the Arihant Apparels storefront street ("From first counter to category
 *    leader"), whose stage bodies are the Apparels brand FAQ's own three
 *    bullets and whose titles, key and note are written for it.
 *
 * Seed-only for now: these are not in the Sanity schema, so the Studio cannot
 * edit them yet (follow-up: add a `sectionArt` document and read it through
 * src/lib/content.ts like every other copy). No numbers, ever: the visit
 * cycle stays "fixed", never its figure (PRODUCT.md, repetition discipline),
 * and the street is marked illustrative.
 */

export const counterRailLabels = {
  portfolio: "Our portfolio",
  deep: "Depth where your customer shops",
  sit: ["Nothing that", "will sit"],
  cycle: "On a fixed cycle",
  chips: ["Reorders", "Claims", "Market feedback"],
  status: ["Supply, on time", "Credit note, on time", "Grievance, resolved"],
  ledger: ["Claims", "Settlements"],
  ledgerFoot: "On paper, on schedule",
  capital: ["Capital keeps", "rotating"],
} as const;

export const storeStreetCopy = {
  heading: "From first counter to category leader",
  titles: ["Seed the anchors", "Widen at the fair", "Add shop-in-shop counters"],
  key: {
    warehouse: "Our warehouse",
    store: "Store stocking the label",
    sis: "Shop-in-shop counter",
  },
  inset: "Inside one store",
  note: "Illustrative. Every label's path is its own.",
  /** Used only if the Apparels brand FAQ ("We are a brand. What does the
   *  first season look like?") is missing from the content source. */
  fallback: {
    lead: "Three stages, over roughly two seasons.",
    bullets: [
      "We seed the top multi-brand counters in Guwahati and two or three anchor cities.",
      "Exhibition orders widen distribution at the next regional fair.",
      "Where the sell-through justifies it, we add shop-in-shop (SIS) counters.",
    ],
  },
} as const;
