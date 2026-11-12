import type { Metadata } from "next";
import { OFFICE_POINT, TOWNS, townKey } from "@/content/towns";
import type {
  Business,
  Faq,
  Partner,
  Post,
  SiteSettings,
  Store,
  UnitContact,
} from "@/content/types";

/** The office address as one line, for maps links and JSON-LD. */
export function fullAddress(s: SiteSettings): string {
  return `${s.orgName}, ${s.addressLine}, ${s.locality}, ${s.city}, ${s.state} ${s.postalCode}`;
}

/** A plain external Google Maps link for one address string. Google's
 *  documented cross-platform Maps URL (change round 6): it opens the Maps app
 *  on a phone and the site on a desktop. Used by `storeMapsUrl` and
 *  `mapsUrl` below. */
export function directionsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** One store on Google Maps, for the atlas's Get directions and the JSON-LD
 *  (change round 13). Like `mapsUrl`: the store's own Maps link (the exact
 *  place) wins, then a search for its confirmed address, else nothing. */
export function storeMapsUrl(store: Store): string | undefined {
  if (store.mapsLink) return store.mapsLink;
  return store.mapsQuery ? directionsUrl(store.mapsQuery) : undefined;
}

/** The office on Google Maps. One definition, used by the footer, /contact
 *  and the JSON-LD. The Studio's "Google Maps link" (the exact pin) wins;
 *  until it is set, a search for the building, its locality and postcode.
 *  The landmark phrases ("Opposite Bhagwat Dham, near Shankar Hotel") stay out
 *  of the query: they help a person, but they throw a geocoder off. */
export function mapsUrl(s: SiteSettings): string {
  if (s.mapsLink) return s.mapsLink;
  return directionsUrl(officeQuery(s));
}

/** The office as a geocoder reads it: the building, its locality and the
 *  postcode, without the landmark phrases. */
function officeQuery(s: SiteSettings): string {
  const building = s.addressLine.split(",")[0]?.trim() || s.addressLine;
  return `${building}, ${s.locality}, ${s.city}, ${s.state} ${s.postalCode}`;
}

/** The office as a live Google Map, for the footer's map strip (change round
 *  7, at the client's request). Google's keyless embed for a search, which
 *  resolves to the Arihant Tower listing with its own Directions card. It is
 *  the site's one third-party frame, loaded lazily, so a reader who never
 *  reaches the footer never requests it. A Studio share link cannot be
 *  embedded, so the exact pin (`mapsLink`) stays on the "Open in Google Maps"
 *  link beside it. */
export function mapsEmbedUrl(s: SiteSettings): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(officeQuery(s))}&z=16&output=embed`;
}

/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in production (no trailing slash). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.arihant.marketing").replace(/\/$/, "");
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string; // e.g. "/arihant-marketing"
  /** "article" for a Trade Note (change round 9); pages stay "website". */
  type?: "website" | "article";
  /** An article's own header image, as a site-root path. */
  image?: string;
}): Metadata {
  const url = `${siteUrl()}${opts.path === "/" ? "" : opts.path}`;
  const image = opts.image
    ? { url: `${siteUrl()}${opts.image}`, alt: opts.title }
    : {
        url: `${siteUrl()}/og.png`,
        width: 1200,
        height: 630,
        alt: "Arihant Group, Northeast India's leading readymade garments distribution house",
      };
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Arihant Group",
      locale: "en_IN",
      type: opts.type ?? "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD builders (schema.org)                                       */
/* ------------------------------------------------------------------ */

function postalAddress(s: SiteSettings) {
  return {
    "@type": "PostalAddress",
    streetAddress: `${s.addressLine}, ${s.locality}`,
    addressLocality: s.city,
    addressRegion: s.state,
    postalCode: s.postalCode,
    addressCountry: s.country,
  };
}

/** The group's own profiles elsewhere, for `sameAs`. Only pages the group
 *  runs: a search engine joins them to this site as one business. */
const PROFILES = ["https://www.linkedin.com/company/arihant-marketinghy"];

/** Arihant Marketing's listing on Google Maps (Clothing wholesaler, Arihant
 *  Tower, 2nd Floor; its website field already points here). Joining it to
 *  the unit's JSON-LD tells Google and AI answers that the listing and this
 *  site are one business, and keeps it apart from the tile shop of the same
 *  name in Kalapahar. */
const MARKETING_MAPS_LISTING = "https://www.google.com/maps?cid=2725169947089833962";

/** The seven states the group sells into, as one list for every entity. */
const AREA_SERVED = [
  "Assam",
  "Meghalaya",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Arunachal Pradesh",
].map((name) => ({ "@type": "State", name }));

/** A site-root path (or an absolute Sanity URL) as an absolute URL. */
function absoluteUrl(src: string): string {
  return src.startsWith("http") ? src : `${siteUrl()}${src}`;
}

/** What each business does, in the words buyers search with. */
const UNIT_KNOWS_ABOUT: Record<Business["unit"], string[]> = {
  marketing: ["readymade garments wholesale", "apparel brand distribution", "shop-in-shop counters"],
  apparels: ["readymade garments wholesale", "apparel brand distribution"],
  retail: ["multi-brand apparel retail", "apparel store franchise"],
};

/** One label as a schema.org Brand. */
function brandEntity(p: Partner) {
  return { "@type": "Brand", name: p.name, logo: absoluteUrl(p.image) };
}

/** The office building as a point on the map. */
const OFFICE_GEO = {
  "@type": "GeoCoordinates",
  latitude: OFFICE_POINT.lat,
  longitude: OFFICE_POINT.lon,
};

/** The site itself, so Google can show "Arihant Group" as the site name and
 *  match the people who search for it as "Arihant Marketing" (the domain). */
export function websiteJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: s.orgName,
    alternateName: [
      ...s.contacts.map((c) => c.businessName),
      new URL(siteUrl()).hostname.replace(/^www\./, ""),
    ],
    url: siteUrl(),
    inLanguage: "en-IN",
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}

export function organizationJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}/#organization`,
    name: s.orgName,
    // The three trading names people search for (Marketing, Apparels, Retail).
    alternateName: s.contacts.map((c) => c.businessName),
    url: siteUrl(),
    logo: `${siteUrl()}/icon.png`,
    sameAs: PROFILES,
    description: s.tagline,
    foundingDate: "1999",
    address: postalAddress(s),
    hasMap: mapsUrl(s),
    // One sales desk per business, read from the same contacts the footer
    // prints, so an AI answer to "how do I contact Arihant" has the right
    // phone and email for each business.
    contactPoint: s.contacts.map((c) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      name: c.businessName,
      ...(c.phones[0] ? { telephone: `+91${c.phones[0].phone}` } : {}),
      email: c.email,
      areaServed: AREA_SERVED,
    })),
    // Genuine, documented awards only (honesty rail: no invented awards). The
    // NEGTA founder role is modelled as membership via `memberOf`, not an award.
    award: ["Best Distributor of India 2015, CMAI (Clothing Manufacturers Association of India)"],
    memberOf: { "@type": "Organization", name: "North Eastern Garment Traders Association (NEGTA)" },
    subOrganization: [
      { "@id": `${siteUrl()}/arihant-marketing#business` },
      { "@id": `${siteUrl()}/arihant-apparels#business` },
      { "@id": `${siteUrl()}/arihant-retail#business` },
    ],
  };
}

/** Marketing/Apparels → WholesaleStore; Retail → ClothingStore.
 *
 *  `partners` (Marketing and Apparels) lists every label the business
 *  distributes as a schema.org `brand`. This is how a search for "Spykar
 *  distributor in Northeast India" can reach the business without a page per
 *  label: each name is already printed on /brands, so the markup states
 *  nothing a visitor cannot see. */
export function businessJsonLd(
  s: SiteSettings,
  b: Business,
  contact: UnitContact,
  partners: Partner[] = [],
) {
  const type = b.unit === "retail" ? "ClothingStore" : "WholesaleStore";
  const brands = partners.filter((p) => p.unit === b.unit).map(brandEntity);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${siteUrl()}/${b.slug}#business`,
    name: b.name,
    url: `${siteUrl()}/${b.slug}`,
    description: b.summary,
    logo: absoluteUrl(b.logo),
    image: `${siteUrl()}/images/photos/group-building.webp`,
    parentOrganization: { "@id": `${siteUrl()}/#organization` },
    address: { ...postalAddress(s), streetAddress: `${contact.floor}, ${s.addressLine}, ${s.locality}` },
    geo: OFFICE_GEO,
    hasMap: b.unit === "marketing" ? MARKETING_MAPS_LISTING : mapsUrl(s),
    ...(b.unit === "marketing" ? { sameAs: [MARKETING_MAPS_LISTING, ...PROFILES] } : {}),
    telephone: contact.phones[0] ? `+91${contact.phones[0].phone}` : undefined,
    email: contact.email,
    areaServed: AREA_SERVED,
    knowsAbout: UNIT_KNOWS_ABOUT[b.unit],
    ...(brands.length ? { brand: brands } : {}),
  };
}

/** Every label on /brands as one list of schema.org Brands, so a crawler
 *  reads the whole portfolio in a single pass. */
export function brandListJsonLd(partners: Partner[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Apparel brands Arihant distributes in Northeast India",
    numberOfItems: partners.length,
    itemListElement: partners.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: brandEntity(p),
    })),
  };
}

/** The page itself as an AboutPage or ContactPage, tied to the group. */
export function webPageJsonLd(
  type: "AboutPage" | "ContactPage",
  opts: { title: string; description: string; path: string },
) {
  const url = `${siteUrl()}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    inLanguage: "en-IN",
    isPartOf: { "@id": `${siteUrl()}/#website` },
    about: { "@id": `${siteUrl()}/#organization` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl()}${it.path === "/" ? "" : it.path}`,
    })),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        // Bullets are part of the answer a reader sees, so they are part of
        // the answer a search engine is told about.
        text: f.bullets?.length
          ? `${f.answer} ${f.bullets.join(" ")}`
          : f.answer,
      },
    })),
  };
}

export function articleJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    url: `${siteUrl()}/blog/${post.slug}`,
    ...(post.image
      ? { image: post.image.startsWith("http") ? post.image : `${siteUrl()}${post.image}` }
      : {}),
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          ...(post.author.role ? { jobTitle: post.author.role } : {}),
          ...(post.author.sourceUrl ? { url: post.author.sourceUrl } : {}),
        }
      : { "@type": "Organization", name: "Arihant Group" },
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}

/* ------------------------------------------------------------------ */
/* Local SEO                                                           */
/*                                                                     */
/* The site had Organization and per-unit WholesaleStore markup, but    */
/* nothing that said "this is a business at this address in Guwahati"   */
/* in the terms local search actually reads (change brief, G9/X4).      */
/* ------------------------------------------------------------------ */

/**
 * The group as a physical business at Arihant Tower. Distinct from
 * `organizationJsonLd`, which describes the company; this describes the
 * premises, the hours and the catchment, which is what a "garment
 * distributor Guwahati" query resolves against.
 */
export function localBusinessJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl()}/#localbusiness`,
    name: s.orgName,
    url: siteUrl(),
    description: s.tagline,
    parentOrganization: { "@id": `${siteUrl()}/#organization` },
    address: postalAddress(s),
    hasMap: mapsUrl(s),
    telephone: `+${s.defaultWhatsapp}`,
    geo: OFFICE_GEO,
    priceRange: "$$",
    areaServed: AREA_SERVED,
    knowsAbout: [
      "readymade garments distribution",
      "apparel wholesale",
      "shop-in-shop retail",
      "multi-brand apparel retail",
    ],
    // Trade hours, not shop hours: this is the office and the godowns.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
  };
}

/** One trading store, as a place a shopper can visit. Fit-out stores are not
 *  emitted: telling a search engine about a door that does not open yet is
 *  exactly the kind of claim this site does not make. */
export function storeJsonLd(s: SiteSettings, store: Store) {
  if (store.status !== "Open") return null;
  // Since change round 13 a town's row in towns.ts is the store's own place.
  const town = TOWNS[townKey(store.city)];
  const map = storeMapsUrl(store);
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${siteUrl()}/arihant-retail#store-${store.name}-${store.city}`
      .toLowerCase()
      .replace(/\s+/g, "-"),
    name: `${store.name}, ${store.city}`,
    parentOrganization: { "@id": `${siteUrl()}/#organization` },
    address: store.mapsQuery
      ? { "@type": "PostalAddress", streetAddress: store.mapsQuery, addressLocality: store.city, addressCountry: s.country }
      : { "@type": "PostalAddress", addressLocality: store.city, addressCountry: s.country },
    ...(town ? { geo: { "@type": "GeoCoordinates", latitude: town.lat, longitude: town.lon } } : {}),
    ...(map ? { hasMap: map } : {}),
    ...(store.image ? { image: `${siteUrl()}${store.image}` } : {}),
  };
}

/** Every trading store, as one ItemList a crawler can read in a single pass. */
export function storeListJsonLd(s: SiteSettings, stores: Store[]) {
  const open = stores.filter((store) => store.status === "Open");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Arihant Retail stores",
    itemListElement: open.map((store, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: storeJsonLd(s, store),
    })),
  };
}
