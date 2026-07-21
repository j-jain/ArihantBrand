/**
 * The single content access layer for the site.
 *
 * Every getter returns EXACTLY the shapes from `@/content/types`. When Sanity
 * is configured it queries Sanity and maps the result; if a query returns
 * empty/null or throws, that getter falls back to the seed data (one warn).
 * When Sanity is not configured it returns seed data directly.
 *
 * These are pure async functions with no caching of their own — Next's static
 * generation / fetch cache handles revalidation.
 */

import type {
  Award,
  Business,
  Cta,
  Faq,
  Hero,
  LeaderPortrait,
  PageCopy,
  Partner,
  Post,
  PostBlock,
  ProcessStep,
  RecognitionPhoto,
  SiteSettings,
  Stat,
  Store,
  TeamMember,
  Testimonial,
} from "@/content/types";

import {
  awards as seedAwards,
  businesses as seedBusinesses,
  faqs as seedFaqs,
  groupStats as seedGroupStats,
  leaderPortraits as seedLeaderPortraits,
  partners as seedPartners,
  partnerSteps as seedPartnerSteps,
  pillars as seedPillars,
  posts as seedPosts,
  recognitionPhotos as seedRecognitionPhotos,
  sisScope as seedSisScope,
  siteSettings as seedSiteSettings,
  stores as seedStores,
  systems as seedSystems,
  team as seedTeam,
  testimonials as seedTestimonials,
  timeline as seedTimeline,
} from "@/content/seed";
import { pages as seedPages } from "@/content/pages";

import { getClient, sanityConfigured, urlFor, type SanityImageSource } from "@/lib/sanity";

/* Shapes that have no exported type in @/content/types but appear in the seed. */
export type Pillar = { title: string; text: string };
export type TimelineEntry = { year: string; title: string; text: string };

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

type SanityImage = { asset?: { _ref?: string; url?: string } } | null;

/** Resolve an image field to a URL string: uploaded asset first (via urlFor),
 *  then the seeded string path, else "". */
function resolveImage(image: SanityImage | undefined, path?: string | null): string {
  if (image && image.asset) {
    const built = urlFor(image as unknown as SanityImageSource);
    const url = built?.url();
    if (url) return url;
  }
  return path ?? "";
}

function warnFallback(getter: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.warn(`[content] ${getter} fell back to seed data: ${msg}`);
}

/** Run a Sanity query and map it, or fall back to seed. Treats null/empty
 *  results and thrown errors identically: use `seed`. */
async function fromSanity<Raw, Out>(
  getter: string,
  query: string,
  params: Record<string, unknown>,
  isEmpty: (raw: Raw) => boolean,
  map: (raw: Raw) => Out,
  seed: Out,
): Promise<Out> {
  if (!sanityConfigured) return seed;
  try {
    const raw = await getClient().fetch<Raw>(query, params);
    if (raw == null || isEmpty(raw)) return seed;
    return map(raw);
  } catch (err) {
    warnFallback(getter, err);
    return seed;
  }
}

const isEmptyArray = (rows: unknown[]): boolean => !Array.isArray(rows) || rows.length === 0;

/* ------------------------------------------------------------------ */
/* Raw GROQ row shapes                                                  */
/* ------------------------------------------------------------------ */

interface RawStat {
  value: number;
  suffix?: string | null;
  label: string;
}
interface RawCta {
  label: string;
  href: string;
}
interface RawBusiness {
  unit: Business["unit"];
  name: string;
  slug?: string | null;
  logo?: SanityImage;
  logoPath?: string | null;
  founded?: string | null;
  leaders?: string[] | null;
  positioning?: string | null;
  summary?: string | null;
  points?: string[] | null;
  stats?: RawStat[] | null;
  audienceCtas?: RawCta[] | null;
}
interface RawPartner {
  name: string;
  slug?: string | null;
  unit: Partner["unit"];
  image?: SanityImage;
  imagePath?: string | null;
  category?: string | null;
}
interface RawStore {
  name: string;
  city?: string | null;
  format: Store["format"];
  status: Store["status"];
  image?: SanityImage;
  imagePath?: string | null;
  caption?: string | null;
}
interface RawFaq {
  question: string;
  answer: string;
  page: Faq["page"];
}
interface RawTestimonial {
  quote: string;
  name: string;
  role?: string | null;
  published?: boolean | null;
}
interface RawPostBlock {
  _type: string;
  text?: string | null;
  items?: string[] | null;
}
interface RawPost {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  date: string;
  audience: Post["audience"];
  readMinutes?: number | null;
  metaDescription?: string | null;
  image?: SanityImage;
  imagePath?: string | null;
  body?: RawPostBlock[] | null;
}
interface RawContact {
  unit: SiteSettings["contacts"][number]["unit"];
  businessName: string;
  floor: string;
  phones?: { name: string; phone: string }[] | null;
  email: string;
  whatsapp: string;
}
interface RawSiteSettings {
  orgName: string;
  tagline?: string | null;
  addressLine?: string | null;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  defaultWhatsapp?: string | null;
  metaTitleSuffix?: string | null;
  contacts?: RawContact[] | null;
}
interface RawHero {
  heading?: string | null;
  headingEmphasis?: string | null;
  lead?: string | null;
  primaryCta?: RawCta | null;
  secondaryCta?: RawCta | null;
}
interface RawPageSection {
  key: string;
  heading?: string | null;
  lead?: string | null;
  body?: string[] | null;
}
interface RawPage {
  metaTitle?: string | null;
  metaDescription?: string | null;
  hero?: RawHero | null;
  sections?: RawPageSection[] | null;
}
interface RawPillar {
  title: string;
  text: string;
}
interface RawTimeline {
  year: string;
  title: string;
  text: string;
}
interface RawStep {
  title: string;
  text: string;
}
interface RawAward {
  year: string;
  title: string;
  issuer: string;
  detail?: string | null;
}

/* ------------------------------------------------------------------ */
/* Mappers                                                              */
/* ------------------------------------------------------------------ */

const mapStat = (s: RawStat): Stat => ({
  value: s.value,
  ...(s.suffix ? { suffix: s.suffix } : {}),
  label: s.label,
});

const mapCta = (c: RawCta): Cta => ({ label: c.label, href: c.href });

function mapBusiness(b: RawBusiness): Business {
  return {
    unit: b.unit,
    name: b.name,
    slug: b.slug ?? "",
    logo: resolveImage(b.logo, b.logoPath),
    founded: b.founded ?? "",
    leaders: b.leaders ?? [],
    positioning: b.positioning ?? "",
    summary: b.summary ?? "",
    points: b.points ?? [],
    stats: (b.stats ?? []).map(mapStat),
    audienceCtas: (b.audienceCtas ?? []).map(mapCta),
  };
}

function mapPartner(p: RawPartner): Partner {
  return {
    name: p.name,
    slug: p.slug ?? "",
    unit: p.unit,
    image: resolveImage(p.image, p.imagePath),
    ...(p.category ? { category: p.category } : {}),
  };
}

function mapStore(s: RawStore): Store {
  const image = resolveImage(s.image, s.imagePath);
  return {
    name: s.name,
    city: s.city ?? "",
    format: s.format,
    status: s.status,
    ...(image ? { image } : {}),
    ...(s.caption ? { caption: s.caption } : {}),
  };
}

function mapPostBlock(b: RawPostBlock): PostBlock | null {
  switch (b._type) {
    case "pBlock":
      return { type: "p", text: b.text ?? "" };
    case "h2Block":
      return { type: "h2", text: b.text ?? "" };
    case "h3Block":
      return { type: "h3", text: b.text ?? "" };
    case "ulBlock":
      return { type: "ul", items: b.items ?? [] };
    default:
      return null;
  }
}

function mapPost(p: RawPost): Post {
  const image = resolveImage(p.image, p.imagePath);
  return {
    title: p.title,
    slug: p.slug ?? "",
    excerpt: p.excerpt ?? "",
    date: p.date,
    audience: p.audience,
    readMinutes: p.readMinutes ?? 0,
    metaDescription: p.metaDescription ?? "",
    ...(image ? { image } : {}),
    body: (p.body ?? []).map(mapPostBlock).filter((b): b is PostBlock => b !== null),
  };
}

function mapSiteSettings(s: RawSiteSettings): SiteSettings {
  return {
    orgName: s.orgName,
    tagline: s.tagline ?? "",
    addressLine: s.addressLine ?? "",
    locality: s.locality ?? "",
    city: s.city ?? "",
    state: s.state ?? "",
    postalCode: s.postalCode ?? "",
    country: s.country ?? "",
    defaultWhatsapp: s.defaultWhatsapp ?? "",
    metaTitleSuffix: s.metaTitleSuffix ?? "",
    contacts: (s.contacts ?? []).map((c) => ({
      unit: c.unit,
      businessName: c.businessName,
      floor: c.floor,
      phones: c.phones ?? [],
      email: c.email,
      whatsapp: c.whatsapp,
    })),
  };
}

function mapHero(h: RawHero): Hero {
  return {
    heading: h.heading ?? "",
    ...(h.headingEmphasis ? { headingEmphasis: h.headingEmphasis } : {}),
    lead: h.lead ?? "",
    primaryCta: h.primaryCta ? mapCta(h.primaryCta) : { label: "", href: "#" },
    ...(h.secondaryCta ? { secondaryCta: mapCta(h.secondaryCta) } : {}),
  };
}

function mapPage(p: RawPage): PageCopy {
  const sections: PageCopy["sections"] = {};
  for (const s of p.sections ?? []) {
    if (!s?.key) continue;
    sections[s.key] = {
      heading: s.heading ?? "",
      ...(s.lead ? { lead: s.lead } : {}),
      ...(s.body && s.body.length ? { body: s.body } : {}),
    };
  }
  return {
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    hero: mapHero(p.hero ?? {}),
    sections,
  };
}

/* ------------------------------------------------------------------ */
/* GROQ queries                                                         */
/* ------------------------------------------------------------------ */

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  orgName, tagline, addressLine, locality, city, state, postalCode, country,
  defaultWhatsapp, metaTitleSuffix,
  contacts[]{ unit, businessName, floor, phones[]{ name, phone }, email, whatsapp }
}`;

const BUSINESSES_QUERY = `*[_type == "business"] | order(order asc){
  unit, name, "slug": slug.current, logo, logoPath, founded, leaders, positioning,
  summary, points, stats[]{ value, suffix, label }, audienceCtas[]{ label, href }
}`;

const PARTNERS_QUERY = `*[_type == "partner"] | order(order asc){
  name, "slug": slug.current, unit, image, imagePath, category
}`;

const STORES_QUERY = `*[_type == "store"] | order(order asc){
  name, city, format, status, image, imagePath, caption
}`;

const FAQS_ALL_QUERY = `*[_type == "faq"] | order(order asc){ question, answer, page }`;
const FAQS_PAGE_QUERY = `*[_type == "faq" && page == $page] | order(order asc){ question, answer, page }`;

const TESTIMONIALS_QUERY = `*[_type == "testimonial" && published == true] | order(order asc){
  quote, name, role, published
}`;

const POST_PROJECTION = `{
  title, "slug": slug.current, excerpt, date, audience, readMinutes, metaDescription,
  image, imagePath,
  body[]{ _type, text, items }
}`;
const POSTS_QUERY = `*[_type == "post"] | order(date desc)${POST_PROJECTION}`;
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]${POST_PROJECTION}`;

const PAGE_QUERY = `*[_type == "page" && pageId == $pageId][0]{
  metaTitle, metaDescription,
  hero{ heading, headingEmphasis, lead,
    primaryCta{ label, href }, secondaryCta{ label, href } },
  sections[]{ key, heading, lead, body }
}`;

const GROUP_STATS_QUERY = `*[_type == "groupStat"] | order(order asc){ value, suffix, label }`;
const PILLARS_QUERY = `*[_type == "pillar"] | order(order asc){ title, text }`;
const TIMELINE_QUERY = `*[_type == "timelineEntry"] | order(order asc){ year, title, text }`;
const STEPS_QUERY = `*[_type == "processStep"] | order(order asc){ title, text }`;
const AWARDS_QUERY = `*[_type == "award"] | order(order asc){ year, title, issuer, detail }`;
const SYSTEMS_QUERY = `*[_type == "systemFeature"] | order(order asc){ title, text }`;
const SIS_SCOPE_QUERY = `*[_type == "sisPoint"] | order(order asc){ title, text }`;

/* ------------------------------------------------------------------ */
/* Getters                                                              */
/* ------------------------------------------------------------------ */

export function getSiteSettings(): Promise<SiteSettings> {
  return fromSanity<RawSiteSettings | null, SiteSettings>(
    "getSiteSettings",
    SITE_SETTINGS_QUERY,
    {},
    (raw) => raw == null || !raw.orgName,
    (raw) => mapSiteSettings(raw as RawSiteSettings),
    seedSiteSettings,
  );
}

export function getBusinesses(): Promise<Business[]> {
  return fromSanity<RawBusiness[], Business[]>(
    "getBusinesses",
    BUSINESSES_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map(mapBusiness),
    seedBusinesses,
  );
}

export function getPartners(): Promise<Partner[]> {
  return fromSanity<RawPartner[], Partner[]>(
    "getPartners",
    PARTNERS_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map(mapPartner),
    seedPartners,
  );
}

export function getStores(): Promise<Store[]> {
  return fromSanity<RawStore[], Store[]>(
    "getStores",
    STORES_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map(mapStore),
    seedStores,
  );
}

export function getFaqs(page?: Faq["page"]): Promise<Faq[]> {
  const seed = page ? seedFaqs.filter((f) => f.page === page) : seedFaqs;
  return fromSanity<RawFaq[], Faq[]>(
    "getFaqs",
    page ? FAQS_PAGE_QUERY : FAQS_ALL_QUERY,
    page ? { page } : {},
    isEmptyArray,
    (rows) => rows.map((f) => ({ question: f.question, answer: f.answer, page: f.page })),
    seed,
  );
}

export function getTestimonials(): Promise<Testimonial[]> {
  const seed = seedTestimonials.filter((t) => t.published);
  return fromSanity<RawTestimonial[], Testimonial[]>(
    "getTestimonials",
    TESTIMONIALS_QUERY,
    {},
    isEmptyArray,
    (rows) =>
      rows.map((t) => ({
        quote: t.quote,
        name: t.name,
        role: t.role ?? "",
        published: true,
      })),
    seed,
  );
}

export function getPosts(): Promise<Post[]> {
  const seed = [...seedPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
  return fromSanity<RawPost[], Post[]>(
    "getPosts",
    POSTS_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map(mapPost),
    seed,
  );
}

export function getPost(slug: string): Promise<Post | undefined> {
  const seed = seedPosts.find((p) => p.slug === slug);
  return fromSanity<RawPost | null, Post | undefined>(
    "getPost",
    POST_QUERY,
    { slug },
    (raw) => raw == null,
    (raw) => mapPost(raw as RawPost),
    seed,
  );
}

export function getPageCopy(pageId: string): Promise<PageCopy | undefined> {
  const seed = seedPages[pageId];
  return fromSanity<RawPage | null, PageCopy | undefined>(
    "getPageCopy",
    PAGE_QUERY,
    { pageId },
    (raw) => raw == null || !raw.hero,
    (raw) => mapPage(raw as RawPage),
    seed,
  );
}

export function getGroupStats(): Promise<Stat[]> {
  return fromSanity<RawStat[], Stat[]>(
    "getGroupStats",
    GROUP_STATS_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map(mapStat),
    seedGroupStats,
  );
}

export function getPillars(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getPillars",
    PILLARS_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedPillars,
  );
}

export function getTimeline(): Promise<TimelineEntry[]> {
  return fromSanity<RawTimeline[], TimelineEntry[]>(
    "getTimeline",
    TIMELINE_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map((t) => ({ year: t.year, title: t.title, text: t.text })),
    seedTimeline,
  );
}

export function getPartnerSteps(): Promise<ProcessStep[]> {
  return fromSanity<RawStep[], ProcessStep[]>(
    "getPartnerSteps",
    STEPS_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map((s) => ({ title: s.title, text: s.text })),
    seedPartnerSteps,
  );
}

export function getAwards(): Promise<Award[]> {
  return fromSanity<RawAward[], Award[]>(
    "getAwards",
    AWARDS_QUERY,
    {},
    isEmptyArray,
    (rows) =>
      rows.map((a) => ({ year: a.year, title: a.title, issuer: a.issuer, detail: a.detail ?? "" })),
    seedAwards,
  );
}

/** Team roster (seed-only; real, client-supplied people). Optionally scoped to
 *  a unit. No Sanity mirror yet, so this returns the seed directly. */
export function getTeam(unit?: TeamMember["unit"]): Promise<TeamMember[]> {
  const rows = unit ? seedTeam.filter((m) => m.unit === unit) : seedTeam;
  return Promise.resolve(rows);
}

/** Real recognition photographs (seed-only). */
export function getRecognitionPhotos(): Promise<RecognitionPhoto[]> {
  return Promise.resolve(seedRecognitionPhotos);
}

/** Portraits of named leaders, keyed by name (seed-only). Names with no entry
 *  fall back to a monogram placeholder at the call site. */
export function getLeaderPortraits(): Promise<Record<string, LeaderPortrait>> {
  return Promise.resolve(seedLeaderPortraits);
}

export function getSystems(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getSystems",
    SYSTEMS_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedSystems,
  );
}

export function getSisScope(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getSisScope",
    SIS_SCOPE_QUERY,
    {},
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedSisScope,
  );
}
