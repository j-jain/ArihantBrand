/**
 * /llms.txt: a plain-language brief of the group for AI assistants and their
 * crawlers (ChatGPT, Perplexity, Claude, Gemini and the like), following the
 * llms.txt proposal. Nothing on the site links to it, so visitors never see
 * it; it changes nothing about how a page looks.
 *
 * Every line is built from the same content the pages print (src/content or
 * Sanity, through src/lib/content.ts): the businesses, their contacts, the
 * labels on the brand wall, the stores, the awards and the FAQs. It states
 * nothing the site does not already state, and it follows the copy rules
 * (no dashes, no invented figures). Rebuilt with the pages, hourly or on a
 * Studio publish.
 */

import { phrase } from "@/content/facts";
import type { Partner } from "@/content/types";
import {
  getAwards,
  getBusinesses,
  getFaqs,
  getPageCopy,
  getPartners,
  getPosts,
  getSiteSettings,
  getStores,
} from "@/lib/content";
import { siteUrl, storeMapsUrl } from "@/lib/seo";

export const revalidate = 3600;

const STATES =
  "Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura and Arunachal Pradesh";

/** The site's pages in reading order, with the page copy that describes them. */
const PAGES: { id: string; path: string; name: string }[] = [
  { id: "home", path: "/", name: "Home" },
  { id: "marketing", path: "/arihant-marketing", name: "Arihant Marketing" },
  { id: "apparels", path: "/arihant-apparels", name: "Arihant Apparels" },
  { id: "retail", path: "/arihant-retail", name: "Arihant Retail" },
  { id: "brands", path: "/brands", name: "Brands" },
  { id: "partner", path: "/partner", name: "Own a store" },
  { id: "recognition", path: "/recognition", name: "Awards and recognitions" },
  { id: "about", path: "/about", name: "About" },
  { id: "blog", path: "/blog", name: "Trade Notes" },
  { id: "contact", path: "/contact", name: "Contact" },
];

function labelLine(p: Partner): string {
  return p.category ? `${p.name} (${p.category})` : p.name;
}

export async function GET() {
  const [settings, businesses, partners, stores, faqs, awards, posts] = await Promise.all([
    getSiteSettings(),
    getBusinesses(),
    getPartners(),
    getStores(),
    getFaqs(),
    getAwards(),
    getPosts(),
  ]);
  const pageCopies = await Promise.all(PAGES.map((p) => getPageCopy(p.id)));

  // The building's address without the group's name in front, which the
  // floor lines below would otherwise repeat.
  const office = `${settings.addressLine}, ${settings.locality}, ${settings.city}, ${settings.state} ${settings.postalCode}`;
  const country = settings.country === "IN" ? "India" : settings.country;
  const base = siteUrl();
  const url = (path: string) => `${base}${path === "/" ? "" : path}`;
  const out: string[] = [];

  out.push(`# ${settings.orgName}`, "");
  out.push(
    `> ${settings.tagline}. A family-run garment house in ${settings.city}, ${settings.state}, India, with three businesses under one roof: readymade garments wholesale and brand distribution (Arihant Marketing and Arihant Apparels) and multi-brand apparel stores (Arihant Retail). It serves retailers across the seven states of Northeast India: ${STATES}.`,
    "",
  );

  out.push("## Key facts", "");
  out.push(`- Office: ${office}, ${country}`);
  out.push(`- Website: ${base}`);
  out.push(`- States served: ${STATES}`);
  out.push(
    `- ${phrase.groupBrandPartners} brand partners (${phrase.marketingBrands} with Arihant Marketing, ${phrase.apparelsBrands} with Arihant Apparels), ${phrase.groupRetailers} retailers, ${phrase.sisCounters} shop-in-shop counters`,
  );
  for (const award of awards) {
    const by = award.issuer ? `, ${award.issuer}` : "";
    const year = award.year ? ` (${award.year})` : "";
    out.push(`- Award: ${award.title}${by}${year}`);
  }
  out.push("");

  out.push("## The three businesses", "");
  for (const b of businesses) {
    const contact = settings.contacts.find((c) => c.unit === b.unit);
    out.push(`### ${b.name}`, "");
    out.push(b.summary, "");
    out.push(`- ${b.founded}`);
    if (b.leaders.length) out.push(`- Run by ${b.leaders.join(" and ")}`);
    if (contact) {
      out.push(`- Address: ${contact.floor}, ${office}`);
      for (const p of contact.phones) out.push(`- Phone: +91 ${p.phone} (${p.name})`);
      out.push(`- Email: ${contact.email}`);
      out.push(`- WhatsApp: https://wa.me/${contact.whatsapp}`);
    }
    out.push(`- Page: ${url(`/${b.slug}`)}`);
    const labels = partners.filter((p) => p.unit === b.unit);
    if (labels.length) {
      out.push("", `Labels ${b.name} distributes in Northeast India (the names on its brand wall):`, "");
      out.push(labels.map(labelLine).join(", "));
    }
    if (b.unit === "retail") {
      const open = stores.filter((s) => s.status === "Open");
      if (open.length) {
        out.push("", "Stores:", "");
        for (const s of open) {
          const owner = s.ownership ? `, ${s.ownership.toLowerCase()}` : "";
          const map = storeMapsUrl(s);
          out.push(`- ${s.name}, ${s.city}${owner}${map ? `. Directions: ${map}` : ""}`);
        }
      }
    }
    out.push("");
  }

  out.push("## How to work with Arihant", "");
  out.push(`- Retailers who want to stock these brands: ${url("/contact?intent=retailer")}`);
  out.push(`- Brands looking for a distributor in Northeast India: ${url("/contact?intent=brand")}`);
  out.push(`- Investors who want to own an apparel store run by Arihant Retail: ${url("/partner")}`);
  out.push(`- Anything else: ${url("/contact")}`, "");

  if (faqs.length) {
    out.push("## Frequently asked questions", "");
    for (const f of faqs) {
      out.push(`### ${f.question}`, "");
      out.push(f.bullets?.length ? `${f.answer} ${f.bullets.join(" ")}` : f.answer, "");
    }
  }

  out.push("## Pages", "");
  PAGES.forEach((p, i) => {
    const description = pageCopies[i]?.metaDescription;
    out.push(`- [${p.name}](${url(p.path)})${description ? `: ${description}` : ""}`);
  });
  out.push("");

  if (posts.length) {
    out.push("## Trade Notes", "");
    for (const post of posts) {
      out.push(`- [${post.title}](${url(`/blog/${post.slug}`)})${post.metaDescription ? `: ${post.metaDescription}` : ""}`);
    }
    out.push("");
  }

  return new Response(out.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
