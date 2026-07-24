/** Shared content shapes. The Sanity schemas mirror these exactly;
 *  `lib/content.ts` returns this shape whether data comes from Sanity or seed. */

export type UnitKey = "marketing" | "apparels" | "retail";

export interface Cta {
  label: string;
  href: string;
}

export interface Hero {
  heading: string;
  /** Optional word inside heading to set in Besley italic + unit accent. */
  headingEmphasis?: string;
  lead: string;
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
  body: PostBlock[];
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
export interface Funnel {
  id: string;
  title: string;
  text: string;
  cta: Cta;
}

/** Inquiry-form payload. The server action in src/lib/leads.ts and the
 *  InquiryForm component must both use exactly this shape. */
export interface LeadInput {
  intent: "retailer" | "brand" | "franchise" | "other";
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
  sections: Record<string, { heading: string; lead?: string; body?: string[] }>;
}
