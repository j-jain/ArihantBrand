/** Shared content shapes. The Sanity schemas mirror these exactly;
 *  `lib/content.ts` returns this shape whether data comes from Sanity or seed. */

export type UnitKey = "marketing" | "apparels" | "retail";

export interface Cta {
  label: string;
  href: string;
}

export interface Hero {
  threadLabel: string;
  heading: string;
  /** Optional word inside heading to set in Besley italic + unit accent. */
  headingEmphasis?: string;
  lead: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
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
  points: string[];
  stats: Stat[];
  audienceCtas: Cta[];
}

export interface Partner {
  name: string;
  slug: string;
  unit: Exclude<UnitKey, "retail">;
  image: string;
}

export interface Store {
  name: string;
  city: string;
  format: "Multi-brand" | "EBO";
  status: "Open" | "Fit-out";
  image?: string;
  caption?: string;
}

export interface Faq {
  question: string;
  answer: string;
  page: "partner" | "marketing" | "apparels" | "contact";
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  published: boolean;
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
}

export interface ProcessStep {
  title: string;
  text: string;
}

export interface PageCopy {
  hero: Hero;
  metaTitle: string;
  metaDescription: string;
  sections: Record<string, { heading: string; lead?: string; body?: string[] }>;
}
