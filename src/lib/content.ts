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
  CalculatorField,
  Cta,
  Faq,
  Funnel,
  Hero,
  LeaderPortrait,
  ModelPillarId,
  PageCopy,
  Partner,
  Post,
  PostBlock,
  ProcessStep,
  RecognitionPhoto,
  RetailModel,
  SiteSettings,
  Stat,
  Store,
  TeamMember,
  Testimonial,
} from "@/content/types";

import {
  photoSlots as seedPhotoSlots,
  type PhotoSlot,
  type PhotoSlotKey,
} from "@/content/images";

import {
  awards as seedAwards,
  businesses as seedBusinesses,
  faqs as seedFaqs,
  featuredTestimonialIndex as seedFeaturedTestimonialIndex,
  funnels as seedFunnels,
  groupStats as seedGroupStats,
  leaderPortraits as seedLeaderPortraits,
  marketingReasons as seedMarketingReasons,
  marketingSteps as seedMarketingSteps,
  marketingStrengths as seedMarketingStrengths,
  byPopularity,
  partners as seedPartners,
  partnerSteps as seedPartnerSteps,
  pillars as seedPillars,
  posts as seedPosts,
  recognitionPhotos as seedRecognitionPhotos,
  retailModel as seedRetailModel,
  siteSettings as seedSiteSettings,
  stores as seedStores,
  team as seedTeam,
  testimonials as seedTestimonials,
  timeline as seedTimeline,
  values as seedValues,
} from "@/content/seed";
import { pages as seedPages } from "@/content/pages";

import { getClient, sanityConfigured, urlFor, type SanityImageSource } from "@/lib/sanity";

/* Shapes that have no exported type in @/content/types but appear in the seed. */
/** Every photographic position on the site, resolved. Same shape as the code
 *  manifest in src/content/images.ts, so call sites do not change. */
export type PhotoSlotMap = Record<PhotoSlotKey, PhotoSlot>;

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

/** Time-based safety net. Tag revalidation is the real mechanism; this only
 *  covers a webhook that never arrived (network blip, wrong secret). */
const FALLBACK_REVALIDATE = 3600;

/** Run a Sanity query and map it, or fall back to seed. Treats null/empty
 *  results and thrown errors identically: use `seed`.
 *
 *  `tags` are the Sanity document types this query reads. The webhook route at
 *  /api/revalidate expires them when a document of that type is published, so
 *  the next request rebuilds the pages that read it. The "sanity" catch-all is
 *  always included, so a document type nobody remembered to map in the route
 *  handler still cannot go stale forever. */
async function fromSanity<Raw, Out>(
  getter: string,
  query: string,
  params: Record<string, unknown>,
  tags: string[],
  isEmpty: (raw: Raw) => boolean,
  map: (raw: Raw) => Out,
  seed: Out,
): Promise<Out> {
  if (!sanityConfigured) return seed;
  try {
    const raw = await getClient().fetch<Raw>(query, params, {
      next: { tags: ["sanity", ...tags], revalidate: FALLBACK_REVALIDATE },
    });
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
  id?: string | null;
  value: number;
  suffix?: string | null;
  label: string;
}
interface RawCta {
  label: string;
  href: string;
}
interface RawBusinessPoint {
  id?: string | null;
  text?: string | null;
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
  tagline?: string | null;
  summary?: string | null;
  highlights?: string[] | null;
  points?: RawBusinessPoint[] | null;
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
  rank?: number | null;
}
const MODEL_PILLAR_IDS: readonly ModelPillarId[] = [
  "zero-deadstock",
  "multi-brand",
  "no-frills",
  "company-run",
];

function isModelPillarId(value: unknown): value is ModelPillarId {
  return MODEL_PILLAR_IDS.includes(value as ModelPillarId);
}

interface RawRetailModel {
  roicNote?: string | null;
  pillars?: ({ id?: string | null; title: string; text: string } | null)[] | null;
  calculator?: {
    triggerLabel?: string | null;
    heading?: string | null;
    lead?: string | null;
    fields?: Partial<
      Record<
        keyof RetailModel["calculator"]["fields"],
        { label?: string | null; help?: string | null } | null
      >
    > | null;
    results?: Partial<
      Record<keyof RetailModel["calculator"]["results"], string | null>
    > | null;
    disclosure?: string | null;
    resultNote?: string | null;
    leftOverNote?: string | null;
    cta?: Cta | null;
  } | null;
}

interface RawStore {
  name: string;
  city?: string | null;
  format: Store["format"];
  status: Store["status"];
  ownership?: Store["ownership"] | null;
  image?: SanityImage;
  imagePath?: string | null;
  caption?: string | null;
  mapsQuery?: string | null;
}
interface RawFaq {
  question: string;
  answer: string;
  bullets?: string[] | null;
  page: Faq["page"];
}
interface RawTeamMember {
  name: string;
  title: string;
  unit: TeamMember["unit"];
  group?: string | null;
}
interface RawRecognitionPhoto {
  image?: SanityImage;
  srcPath?: string | null;
  alt?: string | null;
  caption?: string | null;
}
interface RawLeaderPortrait {
  leaderName?: string | null;
  image?: SanityImage;
  srcPath?: string | null;
  alt?: string | null;
}
interface RawPhotoSlot {
  slot?: string | null;
  image?: SanityImage;
  alt?: string | null;
  ratio?: string | null;
}
interface RawTestimonial {
  quote: string;
  name: string;
  role?: string | null;
  published?: boolean | null;
  featured?: boolean | null;
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
  imageAlt?: string | null;
  author?: { name?: string | null; role?: string | null; sourceUrl?: string | null } | null;
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
  gstin?: string | null;
  cin?: string | null;
  mapsLink?: string | null;
  contacts?: RawContact[] | null;
}
interface RawHero {
  heading?: string | null;
  headingEmphasis?: string | null;
  lead?: string | null;
  points?: string[] | null;
  primaryCta?: RawCta | null;
  secondaryCta?: RawCta | null;
}
interface RawPageSection {
  key: string;
  heading?: string | null;
  lead?: string | null;
  body?: string[] | null;
  ctaLabel?: string | null;
}
interface RawPage {
  metaTitle?: string | null;
  metaDescription?: string | null;
  hero?: RawHero | null;
  sections?: RawPageSection[] | null;
}
interface RawFunnel {
  id?: string | null;
  title: string;
  text?: string | null;
  cta?: RawCta | null;
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
  ...(s.id ? { id: s.id } : {}),
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
    tagline: b.tagline?.trim() || undefined,
    summary: b.summary ?? "",
    highlights: b.highlights ?? [],
    // Points without an id are unselectable by page code, so drop them rather
    // than let a half-mapped row reach a layout that keys off `id`.
    points: (b.points ?? [])
      .filter((p): p is { id: string; text?: string | null } => Boolean(p?.id))
      .map((p) => ({ id: p.id, text: p.text ?? "" })),
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
    // Presentation rank drives byPopularity() in getPartners(). Without it
    // every comparison ties and the wall silently falls back to alphabetical.
    ...(typeof p.rank === "number" ? { rank: p.rank } : {}),
  };
}

function mapStore(s: RawStore): Store {
  const image = resolveImage(s.image, s.imagePath);
  return {
    name: s.name,
    city: s.city ?? "",
    format: s.format,
    status: s.status,
    ...(s.ownership ? { ownership: s.ownership } : {}),
    ...(image ? { image } : {}),
    ...(s.caption ? { caption: s.caption } : {}),
    ...(s.mapsQuery ? { mapsQuery: s.mapsQuery } : {}),
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
    ...(p.imageAlt ? { imageAlt: p.imageAlt } : {}),
    ...(p.author?.name
      ? {
          author: {
            name: p.author.name,
            role: p.author.role ?? "",
            ...(p.author.sourceUrl ? { sourceUrl: p.author.sourceUrl } : {}),
          },
        }
      : {}),
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
    ...(s.gstin ? { gstin: s.gstin } : {}),
    ...(s.cin ? { cin: s.cin } : {}),
    ...(s.mapsLink?.trim() ? { mapsLink: s.mapsLink.trim() } : {}),
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
    ...(h.points?.length ? { points: h.points } : {}),
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
      ...(s.ctaLabel ? { ctaLabel: s.ctaLabel } : {}),
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
  defaultWhatsapp, metaTitleSuffix, gstin, cin, mapsLink,
  contacts[]{ unit, businessName, floor, phones[]{ name, phone }, email, whatsapp }
}`;

const BUSINESSES_QUERY = `*[_type == "business"] | order(order asc){
  unit, name, "slug": slug.current, logo, logoPath, founded, leaders, positioning,
  tagline, summary, highlights, points[]{ id, text }, stats[]{ id, value, suffix, label },
  audienceCtas[]{ label, href }
}`;

const PARTNERS_QUERY = `*[_type == "partner"] | order(order asc){
  name, "slug": slug.current, unit, image, imagePath, category, rank
}`;

const RETAIL_MODEL_QUERY = `*[_type == "retailModel"][0]{
  roicNote,
  pillars[]{ id, title, text },
  calculator{
    triggerLabel, heading, lead,
    fields{
      area{ label, help }, rent{ label, help }, sales{ label, help },
      margin{ label, help }, otherCosts{ label, help }
    },
    results{ grossMargin, statedCosts, leftOver, salesPerSqFt, rentShare, empty },
    disclosure, resultNote, leftOverNote, cta{ label, href }
  }
}`;

const STORES_QUERY = `*[_type == "store"] | order(order asc){
  name, city, format, status, ownership, image, imagePath, caption, mapsQuery
}`;

const FAQS_ALL_QUERY = `*[_type == "faq"] | order(order asc){ question, answer, bullets, page }`;
const FAQS_PAGE_QUERY = `*[_type == "faq" && page == $page] | order(order asc){ question, answer, bullets, page }`;

const TEAM_QUERY = `*[_type == "teamMember"] | order(order asc){ name, title, unit, group }`;
const RECOGNITION_PHOTOS_QUERY = `*[_type == "recognitionPhoto"] | order(order asc){
  image, srcPath, alt, caption
}`;
const LEADER_PORTRAITS_QUERY = `*[_type == "leaderPortrait"]{ leaderName, image, srcPath, alt }`;
const PHOTO_SLOTS_QUERY = `*[_type == "photoSlot" && defined(slot)]{ slot, image, alt, ratio }`;

const TESTIMONIALS_QUERY = `*[_type == "testimonial" && published == true] | order(order asc){
  quote, name, role, published, featured
}`;

const POST_PROJECTION = `{
  title, "slug": slug.current, excerpt, date, audience, readMinutes, metaDescription,
  image, imagePath, imageAlt, author{ name, role, sourceUrl },
  body[]{ _type, text, items }
}`;
const POSTS_QUERY = `*[_type == "post"] | order(date desc)${POST_PROJECTION}`;
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]${POST_PROJECTION}`;

const PAGE_QUERY = `*[_type == "page" && pageId == $pageId][0]{
  metaTitle, metaDescription,
  hero{ heading, headingEmphasis, lead, points,
    primaryCta{ label, href }, secondaryCta{ label, href } },
  sections[]{ key, heading, lead, body, ctaLabel }
}`;

const GROUP_STATS_QUERY = `*[_type == "groupStat"] | order(order asc){ id, value, suffix, label }`;
const FUNNELS_QUERY = `*[_type == "funnelCard"] | order(order asc){
  id, title, text, cta{ label, href }
}`;
const PILLARS_QUERY = `*[_type == "pillar"] | order(order asc){ title, text }`;
const VALUES_QUERY = `*[_type == "valuePanel"] | order(order asc){ title, text }`;
const TIMELINE_QUERY = `*[_type == "timelineEntry"] | order(order asc){ year, title, text }`;
const STEPS_QUERY = `*[_type == "processStep"] | order(order asc){ title, text }`;
const AWARDS_QUERY = `*[_type == "award"] | order(order asc){ year, title, issuer, detail }`;
const MARKETING_STRENGTHS_QUERY = `*[_type == "marketingStrength"] | order(order asc){ title, text }`;
const MARKETING_STEPS_QUERY = `*[_type == "marketingStep"] | order(order asc){ title, text }`;
const MARKETING_REASONS_QUERY = `*[_type == "marketingReason"] | order(order asc){ title, text }`;

/* ------------------------------------------------------------------ */
/* Selectors                                                            */
/*                                                                      */
/* Page code picks a point or a stat by its stable `id`, never by        */
/* matching the copy. Rewriting a string must never be able to blank a   */
/* section, which is exactly what substring lookups used to allow.       */
/* ------------------------------------------------------------------ */

/** The text of one business point, or undefined if that id is absent. */
export function pointById(
  business: Business | undefined,
  id: string,
): string | undefined {
  return business?.points.find((p) => p.id === id)?.text || undefined;
}

/** Several point texts in the order asked for; missing ids drop out. */
export function pointsByIds(
  business: Business | undefined,
  ids: readonly string[],
): string[] {
  return ids
    .map((id) => pointById(business, id))
    .filter((text): text is string => Boolean(text));
}

/** One stat by its stable id, or undefined if that id is absent. */
export function statById(
  business: Business | undefined,
  id: string,
): Stat | undefined {
  return business?.stats.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ */
/* Getters                                                              */
/* ------------------------------------------------------------------ */

export function getSiteSettings(): Promise<SiteSettings> {
  return fromSanity<RawSiteSettings | null, SiteSettings>(
    "getSiteSettings",
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
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
    ["business"],
    isEmptyArray,
    (rows) => rows.map(mapBusiness),
    seedBusinesses,
  );
}

export async function getPartners(): Promise<Partner[]> {
  const list = await fromSanity<RawPartner[], Partner[]>(
    "getPartners",
    PARTNERS_QUERY,
    {},
    ["partner"],
    isEmptyArray,
    (rows) => rows.map(mapPartner),
    seedPartners,
  );
  // Wall order is decided once, where the data leaves this layer, rather than
  // at the four call sites that render it — they had already drifted apart.
  return byPopularity(list);
}

export function getStores(): Promise<Store[]> {
  return fromSanity<RawStore[], Store[]>(
    "getStores",
    STORES_QUERY,
    {},
    ["store"],
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
    ["faq"],
    isEmptyArray,
    (rows) =>
      rows.map((f) => ({
        question: f.question,
        answer: f.answer,
        ...(f.bullets?.length ? { bullets: f.bullets } : {}),
        page: f.page,
      })),
    seed,
  );
}

export function getTestimonials(): Promise<Testimonial[]> {
  // The seed marks its featured voice by index; Sanity marks it with a
  // boolean an editor can move. Both arrive at the same shape, so the pages
  // only ever ask "which one is featured".
  const seed = seedTestimonials
    .filter((t) => t.published)
    .map((t, i) => ({ ...t, featured: i === seedFeaturedTestimonialIndex }));
  return fromSanity<RawTestimonial[], Testimonial[]>(
    "getTestimonials",
    TESTIMONIALS_QUERY,
    {},
    ["testimonial"],
    isEmptyArray,
    (rows) =>
      rows.map((t) => ({
        quote: t.quote,
        name: t.name,
        role: t.role ?? "",
        published: true,
        featured: t.featured === true,
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
    ["post"],
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
    ["post"],
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
    ["page"],
    (raw) => raw == null || !raw.hero,
    (raw) => {
      // Seed sections sit UNDER the Sanity ones, key by key. Page code reads
      // `sections.x.heading` directly, so a section key the Studio document
      // does not carry yet (a new band shipped before a re-seed) falls back to
      // its seed copy instead of throwing on undefined.
      const page = mapPage(raw as RawPage);
      if (!seed) return page;
      // A button label is newer than most Studio documents (change round 4),
      // so a section that has no label in the Studio keeps the seed's.
      const sections = { ...seed.sections, ...page.sections };
      for (const [key, s] of Object.entries(page.sections)) {
        const label = seed.sections[key]?.ctaLabel;
        if (!s.ctaLabel && label) sections[key] = { ...s, ctaLabel: label };
      }
      return { ...page, sections };
    },
    seed,
  );
}

export function getGroupStats(): Promise<Stat[]> {
  return fromSanity<RawStat[], Stat[]>(
    "getGroupStats",
    GROUP_STATS_QUERY,
    {},
    ["groupStat"],
    isEmptyArray,
    (rows) => rows.map(mapStat),
    seedGroupStats,
  );
}

export function getFunnels(): Promise<Funnel[]> {
  return fromSanity<RawFunnel[], Funnel[]>(
    "getFunnels",
    FUNNELS_QUERY,
    {},
    ["funnelCard"],
    isEmptyArray,
    (rows) =>
      rows
        .filter((f) => Boolean(f.id) && Boolean(f.cta))
        .map((f) => ({
          id: f.id as string,
          title: f.title,
          text: f.text ?? "",
          cta: mapCta(f.cta as RawCta),
        })),
    seedFunnels,
  );
}

export function getPillars(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getPillars",
    PILLARS_QUERY,
    {},
    ["pillar"],
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedPillars,
  );
}

/** The About page's three values. Separate from `getPillars()` so the two
 *  pages stop printing the same three cards (change brief, G2). */
export function getValues(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getValues",
    VALUES_QUERY,
    {},
    ["valuePanel"],
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedValues,
  );
}

/** The Arihant Retail managed-store model: four pillars, the qualitative ROIC
 *  line and every string the returns worksheet prints.
 *
 *  The emptiness test is stricter than the usual "did the array come back":
 *  a half-filled Studio document must not be able to publish a worksheet
 *  without its disclosure, because that sentence is the honesty rail. If the
 *  document is missing recognised pillars, the disclosure, or the CTA target,
 *  the whole object falls back to seed rather than rendering a partial one. */
export function getRetailModel(): Promise<RetailModel> {
  return fromSanity<RawRetailModel, RetailModel>(
    "getRetailModel",
    RETAIL_MODEL_QUERY,
    {},
    ["retailModel"],
    (raw) =>
      !raw ||
      !raw.pillars?.some((p) => isModelPillarId(p?.id)) ||
      !raw.calculator?.disclosure?.trim() ||
      !raw.calculator?.cta?.href,
    (raw) => {
      const seedCalc = seedRetailModel.calculator;
      const c = raw.calculator;
      const field = (
        key: keyof RetailModel["calculator"]["fields"],
      ): CalculatorField => ({
        label: c?.fields?.[key]?.label ?? seedCalc.fields[key].label,
        help: c?.fields?.[key]?.help ?? seedCalc.fields[key].help,
      });
      const result = (
        key: keyof RetailModel["calculator"]["results"],
      ): string => c?.results?.[key] ?? seedCalc.results[key];

      return {
        roicNote: raw.roicNote ?? seedRetailModel.roicNote,
        // Editor order is respected. An unrecognised id is dropped rather than
        // rendered without the figure that belongs beside it.
        pillars: (raw.pillars ?? [])
          .filter((p): p is { id: ModelPillarId; title: string; text: string } =>
            isModelPillarId(p?.id),
          )
          .map((p) => ({ id: p.id, title: p.title, text: p.text })),
        calculator: {
          triggerLabel: c?.triggerLabel ?? seedCalc.triggerLabel,
          heading: c?.heading ?? seedCalc.heading,
          lead: c?.lead ?? seedCalc.lead,
          fields: {
            area: field("area"),
            rent: field("rent"),
            sales: field("sales"),
            margin: field("margin"),
            otherCosts: field("otherCosts"),
          },
          results: {
            grossMargin: result("grossMargin"),
            statedCosts: result("statedCosts"),
            leftOver: result("leftOver"),
            salesPerSqFt: result("salesPerSqFt"),
            rentShare: result("rentShare"),
            empty: result("empty"),
          },
          disclosure: c?.disclosure ?? seedCalc.disclosure,
          resultNote: c?.resultNote ?? seedCalc.resultNote,
          leftOverNote: c?.leftOverNote ?? seedCalc.leftOverNote,
          cta: c?.cta ?? seedCalc.cta,
        },
      };
    },
    seedRetailModel,
  );
}

export function getTimeline(): Promise<TimelineEntry[]> {
  return fromSanity<RawTimeline[], TimelineEntry[]>(
    "getTimeline",
    TIMELINE_QUERY,
    {},
    ["timelineEntry"],
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
    ["processStep"],
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
    ["award"],
    isEmptyArray,
    (rows) =>
      rows.map((a) => ({ year: a.year, title: a.title, issuer: a.issuer, detail: a.detail ?? "" })),
    seedAwards,
  );
}

/** Team roster (real, client-supplied people). Optionally scoped to a unit.
 *  Filtering happens after the fetch so the tag stays type-level. */
export async function getTeam(unit?: TeamMember["unit"]): Promise<TeamMember[]> {
  const rows = await fromSanity<RawTeamMember[], TeamMember[]>(
    "getTeam",
    TEAM_QUERY,
    {},
    ["teamMember"],
    isEmptyArray,
    (list) =>
      list.map((m) => ({
        name: m.name,
        title: m.title,
        unit: m.unit,
        ...(m.group ? { group: m.group } : {}),
      })),
    seedTeam,
  );
  return unit ? rows.filter((m) => m.unit === unit) : rows;
}

/** Real recognition photographs. A row with neither an upload nor a path is
 *  dropped rather than rendered as a broken frame. */
export function getRecognitionPhotos(): Promise<RecognitionPhoto[]> {
  return fromSanity<RawRecognitionPhoto[], RecognitionPhoto[]>(
    "getRecognitionPhotos",
    RECOGNITION_PHOTOS_QUERY,
    {},
    ["recognitionPhoto"],
    isEmptyArray,
    (rows) =>
      rows
        .map((r) => ({
          src: resolveImage(r.image, r.srcPath),
          alt: r.alt ?? "",
          caption: r.caption ?? "",
        }))
        .filter((r) => r.src !== ""),
    seedRecognitionPhotos,
  );
}

/** Portraits of named leaders, keyed by that leader's exact name. Names with
 *  no entry fall back to a monogram placeholder at the call site, so the
 *  leadership section is complete before any photograph exists. */
export function getLeaderPortraits(): Promise<Record<string, LeaderPortrait>> {
  return fromSanity<RawLeaderPortrait[], Record<string, LeaderPortrait>>(
    "getLeaderPortraits",
    LEADER_PORTRAITS_QUERY,
    {},
    ["leaderPortrait"],
    isEmptyArray,
    (rows) => {
      const out: Record<string, LeaderPortrait> = { ...seedLeaderPortraits };
      for (const row of rows) {
        if (!row.leaderName) continue;
        const src = resolveImage(row.image, row.srcPath);
        // No photograph means no override: an empty document must never be
        // able to replace a portrait with a broken frame.
        if (!src) continue;
        out[row.leaderName] = { src, alt: row.alt ?? "" };
      }
      return out;
    },
    seedLeaderPortraits,
  );
}

/** Every photographic position on the site, Sanity first, code manifest
 *  second. A slot only moves when an image was actually uploaded, so an empty
 *  document can never blank a hero. */
export function getPhotoSlots(): Promise<PhotoSlotMap> {
  return fromSanity<RawPhotoSlot[], PhotoSlotMap>(
    "getPhotoSlots",
    PHOTO_SLOTS_QUERY,
    {},
    ["photoSlot"],
    isEmptyArray,
    (rows) => {
      const out: PhotoSlotMap = { ...seedPhotoSlots };
      for (const row of rows) {
        const key = row.slot as PhotoSlotKey;
        const base = out[key];
        if (!base) continue; // unknown slot id: ignore rather than guess
        const src = resolveImage(row.image, null);
        if (!src) continue; // nothing uploaded: keep the code slot
        out[key] = {
          src,
          alt: row.alt ?? base.alt,
          ratio: row.ratio || base.ratio,
          // An uploaded photograph is by definition no longer "wanted".
          real: true,
        };
      }
      return out;
    },
    seedPhotoSlots,
  );
}

/** The four strengths the Marketing page argues to a brand audience. Distinct
 *  from `getPillars()`, which argues the same four to a retailer audience on
 *  the home page (change brief, HP7 + AM10). */
export function getMarketingStrengths(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getMarketingStrengths",
    MARKETING_STRENGTHS_QUERY,
    {},
    ["marketingStrength"],
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedMarketingStrengths,
  );
}

/** The four steps of the retailer visit cycle (marketing page). A real
 *  sequence, so document order drives the 01-04 numerals on the page. */
export function getMarketingSteps(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getMarketingSteps",
    MARKETING_STEPS_QUERY,
    {},
    ["marketingStep"],
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedMarketingSteps,
  );
}

/** Why the region needs its own distributor (marketing page). Four parallel
 *  arguments, not a sequence, so the page renders them without numerals. */
export function getMarketingReasons(): Promise<Pillar[]> {
  return fromSanity<RawPillar[], Pillar[]>(
    "getMarketingReasons",
    MARKETING_REASONS_QUERY,
    {},
    ["marketingReason"],
    isEmptyArray,
    (rows) => rows.map((p) => ({ title: p.title, text: p.text })),
    seedMarketingReasons,
  );
}
