import type { Metadata } from "next";
import type { Business, Faq, Post, SiteSettings, UnitContact } from "@/content/types";

/** The office address as one line, for maps links and JSON-LD. */
export function fullAddress(s: SiteSettings): string {
  return `${s.orgName}, ${s.addressLine}, ${s.locality}, ${s.city}, ${s.state} ${s.postalCode}`;
}

/** Directions to the office. One definition, used by the footer, /contact and
 *  any store that has no address of its own. */
export function mapsUrl(s: SiteSettings): string {
  return `https://maps.google.com/?q=${encodeURIComponent(fullAddress(s))}`;
}

/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in production (no trailing slash). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://arihantgroup.in").replace(/\/$/, "");
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string; // e.g. "/arihant-marketing"
}): Metadata {
  const url = `${siteUrl()}${opts.path === "/" ? "" : opts.path}`;
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
      type: "website",
      images: [{ url: `${siteUrl()}/og.png`, width: 1200, height: 630, alt: "Arihant Group, Northeast India's leading readymade garments distribution house" }],
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

export function organizationJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}/#organization`,
    name: s.orgName,
    url: siteUrl(),
    description: s.tagline,
    foundingDate: "1999",
    address: postalAddress(s),
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

/** Marketing/Apparels → WholesaleStore; Retail → ClothingStore. */
export function businessJsonLd(s: SiteSettings, b: Business, contact: UnitContact) {
  const type = b.unit === "retail" ? "ClothingStore" : "WholesaleStore";
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${siteUrl()}/${b.slug}#business`,
    name: b.name,
    url: `${siteUrl()}/${b.slug}`,
    description: b.summary,
    parentOrganization: { "@id": `${siteUrl()}/#organization` },
    address: { ...postalAddress(s), streetAddress: `${contact.floor}, ${s.addressLine}, ${s.locality}` },
    telephone: contact.phones[0] ? `+91${contact.phones[0].phone}` : undefined,
    email: contact.email,
    areaServed: { "@type": "Place", name: "Northeast India" },
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
    author: { "@type": "Organization", name: "Arihant Group" },
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}
