/** Shared content shapes. The Sanity schemas mirror these exactly;
 *  `lib/content.ts` returns this shape whether data comes from Sanity or seed. */

export type UnitKey = "marketing" | "apparels" | "retail";

export interface Cta {
  label: string;
  href: string;
}

export interface Hero {
  heading: string;
  /** Optional word inside the heading set in the accent colour (upright). */
  headingEmphasis?: string;
  lead: string;
  /** Short figure lines set under the lead ("300+ retailers served"). The
   *  leading figure in each line is picked out typographically; the wording
   *  stays exactly as written. Optional: most heroes carry none. */
  points?: string[];
  primaryCta: Cta;
  secondaryCta?: Cta;
}

export interface Stat {
  /** Stable selector key. Page code picks a stat by `id`, never by matching
   *  its label, so copy can be rewritten without blanking a section. */
  id?: string;
  value: number;
  suffix?: string;
  label: string;
}

/** One proof point on a business. `id` is the stable selector page code uses;
 *  `text` is the copy, which is free to change without breaking a layout. */
export interface BusinessPoint {
  id: string;
  text: string;
}

export interface Business {
  unit: UnitKey;
  name: string;
  slug: string;
  logo: string;
  founded: string;
  leaders: string[];
  positioning: string;
  /** One short line for the header's Businesses menu (change round 5). The
   *  menu falls back to `positioning` when it is empty. */
  tagline?: string;
  summary: string;
  /** Three short lines for the home page's unit row. Kept separate from
   *  `points` so the home page summarises a business and the unit page argues
   *  it, instead of both printing the same sentences. */
  highlights: string[];
  points: BusinessPoint[];
  stats: Stat[];
  audienceCtas: Cta[];
}

export interface Partner {
  name: string;
  slug: string;
  unit: Exclude<UnitKey, "retail">;
  image: string;
  /** Verified product category for well-known national labels (optional —
   *  design never depends on it; obscure regional labels stay untagged). */
  category?: string;
  /** Display rank on brand walls: the labels a retailer is most likely to
   *  recognise lead, lowest first. Presentation only — it makes no claim about
   *  sales, and unranked labels simply follow in their existing order. */
  rank?: number;
}

/** A named, real team member with a designation. Seeded per unit; the roster
 *  is only ever real, client-supplied people (honesty rail). */
export interface TeamMember {
  name: string;
  title: string;
  unit: UnitKey;
  /** Optional grouping label (e.g. "SIS team") for related roles. */
  group?: string;
}

export interface Store {
  name: string;
  city: string;
  /** Every store is multi-brand. The "EBO" value was removed at the client's
   *  request (change brief, AR2); the field stays so a future format can be
   *  added without a data migration. */
  format: "Multi-brand";
  status: "Open" | "Fit-out";
  /** Who owns the asset. Every store is run by Arihant either way, which is
   *  the whole point of the model, so this says nothing about operations. */
  ownership?: "Company-owned" | "Franchisee-owned";
  image?: string;
  caption?: string;
  /** Address string for a maps "Get directions" link. Present only where the
   *  location is confirmed; absent stores render no directions link. */
  mapsQuery?: string;
}

export interface Faq {
  question: string;
  answer: string;
  /** Optional list rendered under the answer. An answer making three or more
   *  separate claims reads as a wall of prose; bullets let the reader find the
   *  one they came for. Folded into the answer text for FAQPage JSON-LD. */
  bullets?: string[];
  page: "partner" | "marketing" | "apparels" | "contact";
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  published: boolean;
  /** The one voice the home page prints. Exactly one entry should carry it;
   *  /recognition renders every other. Seeded from `featuredTestimonialIndex`
   *  so an editor can move the choice without touching code. */
  featured?: boolean;
}

export interface Award {
  /** Display marker: a year ("2015") or a short tag ("Founder"). */
  year: string;
  title: string;
  issuer: string;
  detail: string;
}

/** A photograph of a real certificate, trophy, or recognition moment. Rendered
 *  as an honest, captioned gallery on /recognition. */
export interface RecognitionPhoto {
  src: string;
  alt: string;
  caption: string;
}

/** A real portrait of a named leader, keyed by that leader's exact name. Absent
 *  names render a monogram placeholder instead, so the leadership section is
 *  complete before any photograph exists. */
export interface LeaderPortrait {
  src: string;
  alt: string;
}

export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

export interface Post {
  title: string;
  slug: string;
  excerpt: string;
  date: string; // ISO
  audience: "Retailers" | "Brands" | "Investors";
  readMinutes: number;
  metaDescription: string;
  /** Thumbnail / header image path (optional — Phase 3 fills it). */
  image?: string;
  /** Alt text for the header image. Set explicitly because a Studio upload
   *  resolves to a cdn.sanity.io URL, which the code image manifest cannot
   *  match, and an unmatched lookup would silently leave the alt empty. */
  imageAlt?: string;
  /** A named author, for notes written by a person rather than the house
   *  (e.g. posts first published on LinkedIn). Absent means "Arihant Group". */
  author?: PostAuthor;
  body: PostBlock[];
}

export interface PostAuthor {
  name: string;
  role: string;
  /** Where the note was first published, if anywhere (a LinkedIn post URL). */
  sourceUrl?: string;
}

export interface UnitContact {
  unit: UnitKey;
  businessName: string;
  floor: string;
  phones: { name: string; phone: string }[];
  email: string;
  whatsapp: string; // digits with country code
}

export interface SiteSettings {
  orgName: string;
  tagline: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  defaultWhatsapp: string;
  contacts: UnitContact[];
  metaTitleSuffix: string;
  /** Registration identifiers, printed in the footer when present. Empty until
   *  the client supplies them; nothing ships as a placeholder. */
  gstin?: string;
  cin?: string;
}

export interface ProcessStep {
  title: string;
  text: string;
}

/** One of the site's audience funnels, rendered as its own card and its own
 *  CTA on the home page. `id` matches the inquiry-form intent it routes to
 *  where one exists, so the card and the form agree. */
/* ------------------------------------------------------------------ */
/* The Arihant Retail managed-store model, as rendered by ModelBoard.   */
/* ------------------------------------------------------------------ */

/** Stable selector. It picks the figure drawn beside each row, so renaming a
 *  value drops that row rather than changing its copy. */
export type ModelPillarId =
  | "zero-deadstock"
  | "multi-brand"
  | "no-frills"
  | "company-run";

export interface ModelPillar {
  id: ModelPillarId;
  title: string;
  text: string;
}

/** One labelled input in the returns worksheet. There is deliberately no
 *  default value on this shape: a prefilled figure would be an Arihant
 *  projection with an extra step (PRODUCT.md honesty rails). */
export interface CalculatorField {
  label: string;
  help: string;
}

/** Every string the returns worksheet prints. Nothing in this shape is, or may
 *  become, a number. The worksheet computes only from visitor input. */
export interface ReturnsCalculatorCopy {
  triggerLabel: string;
  heading: string;
  lead: string;
  fields: {
    area: CalculatorField;
    rent: CalculatorField;
    sales: CalculatorField;
    margin: CalculatorField;
    otherCosts: CalculatorField;
  };
  results: {
    grossMargin: string;
    statedCosts: string;
    leftOver: string;
    salesPerSqFt: string;
    rentShare: string;
    /** Printed in place of a figure while an input it needs is empty. */
    empty: string;
  };
  /** The honesty rail. Always visible, never collapsed, and referenced by the
   *  dialog's aria-describedby. */
  disclosure: string;
  resultNote: string;
  /** Printed under the "what your numbers leave" row, which is the one a
   *  reader will otherwise mistake for profit. */
  leftOverNote: string;
  cta: Cta;
}

export interface RetailModel {
  pillars: ModelPillar[];
  /** Qualitative return-on-capital statement. Carries no percentage and no
   *  figure; the Studio validation rejects digits in this field. */
  roicNote: string;
  calculator: ReturnsCalculatorCopy;
}

export interface Funnel {
  id: string;
  title: string;
  text: string;
  cta: Cta;
}

/** Inquiry-form payload. The server action in src/lib/leads.ts and the
 *  InquiryForm component must both use exactly this shape. */
export interface LeadInput {
  intent: "retailer" | "brand" | "franchise" | "careers" | "other";
  name: string;
  phone: string;
  email?: string;
  city?: string;
  company?: string;
  message?: string;
  sourcePage: string;
}

export interface LeadResult {
  ok: boolean;
  error?: string;
}

export interface PageCopy {
  hero: Hero;
  metaTitle: string;
  metaDescription: string;
  sections: Record<
    string,
    {
      heading: string;
      lead?: string;
      body?: string[];
      /** The section's own button label, where it has one. */
      ctaLabel?: string;
    }
  >;
}
