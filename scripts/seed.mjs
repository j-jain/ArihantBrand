/**
 * Seed the configured Sanity project from src/content (seed.ts + pages.ts).
 *
 * ── How this runs ────────────────────────────────────────────────────────────
 * Invoked as `npm run seed` → `node --disable-warning=... scripts/seed.mjs`.
 * We import the TypeScript seed modules DIRECTLY. This machine runs Node v24,
 * which strips TypeScript types natively (enabled by default since v23.6), so no
 * `tsx`/`ts-node`/build step and no new dependencies are needed. The
 * `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` flag only silences a cosmetic
 * perf notice about importing the extensionless .ts files. (If you ever run this
 * on Node < 22.6, add `tsx` and invoke via `npx tsx scripts/seed.mjs` instead.)
 *
 * ── What it does ─────────────────────────────────────────────────────────────
 *  - Loads env from .env.local then .env (manual parse, no dotenv dependency).
 *  - Requires NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_TOKEN, else prints
 *    friendly setup guidance and exits 0.
 *  - Uploads logos / partner logos / store photos from public/images and links
 *    them (concurrency 4, hand-rolled). Sanity dedupes assets by content hash,
 *    so re-runs reuse existing assets rather than duplicating them.
 *  - Upserts every seed document with a STABLE _id via createOrReplace, so the
 *    script is idempotent (re-running updates in place; never duplicates).
 *  - Leads are never seeded. Testimonials carry each seed entry's own
 *    `published` flag (the seed ships role-attributed, published trade voices).
 *  - Prints a summary table.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

/* src/content/*.ts imports its siblings extensionless ("./facts"), which is
 * right for the bundler but unresolvable to Node's ESM loader — type stripping
 * does not bring TypeScript's extension inference with it. This hook appends
 * ".ts" for relative specifiers that resolve to a real file, so the seed modules
 * import unmodified. Nothing under src/ needs to change for the sake of this
 * script. */
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && !/\.[cm]?[jt]s$/.test(specifier)) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) return next(`${specifier}.ts`, context);
    }
    return next(specifier, context);
  },
});

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const API_VERSION = "2025-06-01";

/* ── env loading ─────────────────────────────────────────────────────────── */

async function loadEnvFile(file) {
  let text;
  try {
    text = await fs.readFile(path.join(ROOT, file), "utf8");
  } catch {
    return;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

/** Hand-rolled concurrency limiter (no p-limit dependency). */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

const imageRef = (assetId) =>
  assetId ? { _type: "image", asset: { _type: "reference", _ref: assetId } } : undefined;

const stat = (s, i) => ({
  _type: "stat",
  _key: s.id ? `stat-${s.id}` : `stat-${i}`,
  ...(s.id ? { id: s.id } : {}),
  value: s.value,
  suffix: s.suffix,
  label: s.label,
});
/** Business points carry a stable selector id; it doubles as the array key. */
const businessPoint = (p) => ({
  _type: "businessPoint",
  _key: `point-${p.id}`,
  id: p.id,
  text: p.text,
});
const cta = (c) => ({ _type: "cta", label: c.label, href: c.href });
const ctaKeyed = (c, i) => ({ _type: "cta", _key: `cta-${i}`, label: c.label, href: c.href });

/** seed "/images/foo/bar.png" -> absolute file path under public/. */
const publicPath = (webPath) => path.join(ROOT, "public", webPath.replace(/^\//, ""));

/* ── main ────────────────────────────────────────────────────────────────── */

async function main() {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;

  /* `--dry-run [--out=file.json]` builds every document exactly as a real run
   * would, writes them to a JSON file and stops: no asset uploads, no network,
   * no credentials needed. Image fields are omitted (they need uploaded asset
   * ids), so compare everything except `image`/`logo` against Sanity. Used to
   * diff the seed against the live dataset before overwriting it. */
  const dryRun = process.argv.includes("--dry-run");
  const outArg = process.argv.find((a) => a.startsWith("--out="));
  const outFile = outArg ? path.resolve(outArg.slice("--out=".length)) : path.join(ROOT, "seed-dry-run.json");

  if (!dryRun && (!projectId || !token)) {
    console.log(`
  Sanity is not configured, so there is nothing to seed.

  The site already runs fully on the seed content in src/content — you only need
  to seed if you want to manage content through the Studio.

  To seed, create .env.local (copy .env.example) and set:
    NEXT_PUBLIC_SANITY_PROJECT_ID = your project id
    NEXT_PUBLIC_SANITY_DATASET    = production   (or your dataset)
    SANITY_API_TOKEN              = a token with write access

  Then run:  npm run seed
`);
    process.exit(0);
  }

  // Import the seed content (TypeScript, stripped natively by Node 24).
  const seed = await import("../src/content/seed.ts");
  const { pages } = await import("../src/content/pages.ts");
  const { stockImages, photoSlots } = await import("../src/content/images.ts");

  /* Post header images get an explicit alt in Sanity. The site used to resolve
   * it by matching the src against this manifest, which fails the moment an
   * editor uploads their own file (a cdn.sanity.io URL matches nothing), so the
   * alt is written into the document instead of inferred at render time. */
  const altForImage = (src) =>
    src ? (Object.values(stockImages).find((img) => img.src === src)?.alt ?? "") : "";

  const client = dryRun
    ? null
    : createClient({ projectId, dataset, apiVersion: API_VERSION, token, useCdn: false });

  console.log(
    dryRun
      ? `\n  Dry run: building documents only, nothing is sent to Sanity.\n`
      : `\n  Seeding project "${projectId}" / dataset "${dataset}"…\n`,
  );

  /* 1) Collect the images to upload (unique by file path). */
  const imageJobs = new Map(); // webPath -> absPath
  for (const b of seed.businesses) if (b.logo) imageJobs.set(b.logo, publicPath(b.logo));
  for (const p of seed.partners) if (p.image) imageJobs.set(p.image, publicPath(p.image));
  for (const s of seed.stores) if (s.image) imageJobs.set(s.image, publicPath(s.image));
  for (const p of seed.posts) if (p.image) imageJobs.set(p.image, publicPath(p.image));
  for (const r of seed.recognitionPhotos) if (r.src) imageJobs.set(r.src, publicPath(r.src));

  const jobList = [...imageJobs.entries()];
  const assetByWebPath = new Map();
  let uploaded = 0;
  let missingImages = 0;

  await mapLimit(dryRun ? [] : jobList, 4, async ([webPath, absPath]) => {
    try {
      const buffer = await fs.readFile(absPath);
      const asset = await client.assets.upload("image", buffer, {
        filename: path.basename(absPath),
      });
      assetByWebPath.set(webPath, asset._id);
      uploaded += 1;
    } catch (err) {
      missingImages += 1;
      console.warn(`  ! skipped image ${webPath}: ${err.message}`);
    }
  });

  console.log(`  Images: ${uploaded} uploaded/linked${missingImages ? `, ${missingImages} missing` : ""}.\n`);

  /* 2) Build documents with stable ids. */
  const docs = [];

  // Retail model (singleton). Pillars need _key values; nothing in this
  // document may carry a business figure (see src/content/seed.ts).
  docs.push({
    _id: "retailModel",
    _type: "retailModel",
    roicNote: seed.retailModel.roicNote,
    pillars: seed.retailModel.pillars.map((p) => ({
      _type: "object",
      _key: p.id,
      id: p.id,
      title: p.title,
      text: p.text,
    })),
    calculator: seed.retailModel.calculator,
  });

  // Site settings (singleton)
  const ss = seed.siteSettings;
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    orgName: ss.orgName,
    tagline: ss.tagline,
    addressLine: ss.addressLine,
    locality: ss.locality,
    city: ss.city,
    state: ss.state,
    postalCode: ss.postalCode,
    country: ss.country,
    defaultWhatsapp: ss.defaultWhatsapp,
    metaTitleSuffix: ss.metaTitleSuffix,
    gstin: ss.gstin,
    cin: ss.cin,
    contacts: ss.contacts.map((c, ci) => ({
      _type: "unitContact",
      _key: `contact-${ci}`,
      unit: c.unit,
      businessName: c.businessName,
      floor: c.floor,
      phones: c.phones.map((p, pi) => ({
        _type: "phone",
        _key: `phone-${ci}-${pi}`,
        name: p.name,
        phone: p.phone,
      })),
      email: c.email,
      whatsapp: c.whatsapp,
    })),
  });

  // Businesses
  seed.businesses.forEach((b, i) => {
    const logo = imageRef(assetByWebPath.get(b.logo));
    docs.push({
      _id: `business-${b.unit}`,
      _type: "business",
      unit: b.unit,
      name: b.name,
      slug: { _type: "slug", current: b.slug },
      ...(logo ? { logo } : {}),
      logoPath: b.logo,
      founded: b.founded,
      leaders: b.leaders,
      positioning: b.positioning,
      summary: b.summary,
      highlights: b.highlights,
      points: b.points.map(businessPoint),
      stats: b.stats.map(stat),
      audienceCtas: b.audienceCtas.map(ctaKeyed),
      order: i,
    });
  });

  // Partners
  seed.partners.forEach((p, i) => {
    const image = imageRef(assetByWebPath.get(p.image));
    docs.push({
      _id: `partner-${p.slug}`,
      _type: "partner",
      name: p.name,
      slug: { _type: "slug", current: p.slug },
      unit: p.unit,
      ...(image ? { image } : {}),
      imagePath: p.image,
      ...(p.category ? { category: p.category } : {}),
      ...(typeof p.rank === "number" ? { rank: p.rank } : {}),
      order: i,
    });
  });

  // Stores
  seed.stores.forEach((s, i) => {
    const image = imageRef(s.image ? assetByWebPath.get(s.image) : undefined);
    docs.push({
      _id: `store-${i}`,
      _type: "store",
      name: s.name,
      city: s.city,
      format: s.format,
      status: s.status,
      ...(s.ownership ? { ownership: s.ownership } : {}),
      ...(image ? { image } : {}),
      ...(s.image ? { imagePath: s.image } : {}),
      ...(s.caption ? { caption: s.caption } : {}),
      ...(s.mapsQuery ? { mapsQuery: s.mapsQuery } : {}),
      order: i,
    });
  });

  // FAQs
  seed.faqs.forEach((f, i) => {
    docs.push({
      _id: `faq-${i}`,
      _type: "faq",
      question: f.question,
      answer: f.answer,
      ...(f.bullets?.length ? { bullets: f.bullets } : {}),
      page: f.page,
      order: i,
    });
  });

  // Testimonials (published flag comes straight from the seed entry)
  seed.testimonials.forEach((t, i) => {
    docs.push({
      _id: `testimonial-${i}`,
      _type: "testimonial",
      quote: t.quote,
      name: t.name,
      role: t.role,
      published: t.published,
      featured: i === seed.featuredTestimonialIndex,
      order: i,
    });
  });

  // Posts
  seed.posts.forEach((p) => {
    const image = imageRef(p.image ? assetByWebPath.get(p.image) : undefined);
    docs.push({
      _id: `post-${p.slug}`,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      excerpt: p.excerpt,
      date: p.date,
      audience: p.audience,
      readMinutes: p.readMinutes,
      metaDescription: p.metaDescription,
      ...(image ? { image } : {}),
      ...(p.image ? { imagePath: p.image } : {}),
      ...(p.imageAlt || altForImage(p.image)
        ? { imageAlt: p.imageAlt || altForImage(p.image) }
        : {}),
      ...(p.author
        ? {
            author: {
              name: p.author.name,
              role: p.author.role,
              ...(p.author.sourceUrl ? { sourceUrl: p.author.sourceUrl } : {}),
            },
          }
        : {}),
      body: p.body.map((block, bi) => {
        const _key = `block-${bi}`;
        if (block.type === "p") return { _type: "pBlock", _key, text: block.text };
        if (block.type === "h2") return { _type: "h2Block", _key, text: block.text };
        if (block.type === "h3") return { _type: "h3Block", _key, text: block.text };
        return { _type: "ulBlock", _key, items: block.items };
      }),
    });
  });

  // Pages
  Object.entries(pages).forEach(([pageId, copy]) => {
    docs.push({
      _id: `page-${pageId}`,
      _type: "page",
      pageId,
      metaTitle: copy.metaTitle,
      metaDescription: copy.metaDescription,
      hero: {
        heading: copy.hero.heading,
        ...(copy.hero.headingEmphasis ? { headingEmphasis: copy.hero.headingEmphasis } : {}),
        lead: copy.hero.lead,
        ...(copy.hero.points?.length ? { points: copy.hero.points } : {}),
        primaryCta: cta(copy.hero.primaryCta),
        ...(copy.hero.secondaryCta ? { secondaryCta: cta(copy.hero.secondaryCta) } : {}),
      },
      sections: Object.entries(copy.sections).map(([key, s], si) => ({
        _type: "section",
        _key: `section-${si}`,
        key,
        heading: s.heading,
        ...(s.lead ? { lead: s.lead } : {}),
        ...(s.body ? { body: s.body } : {}),
      })),
    });
  });

  // Group content
  seed.groupStats.forEach((s, i) => {
    docs.push({
      _id: s.id ? `groupstat-${s.id}` : `groupstat-${i}`,
      _type: "groupStat",
      ...(s.id ? { id: s.id } : {}),
      value: s.value,
      suffix: s.suffix,
      label: s.label,
      order: i,
    });
  });
  /** Funnel ids double as the inquiry-form intent, so they key the document. */
  seed.funnels.forEach((f, i) => {
    docs.push({
      _id: `funnel-${f.id}`,
      _type: "funnelCard",
      id: f.id,
      title: f.title,
      text: f.text,
      cta: cta(f.cta),
      order: i,
    });
  });
  seed.pillars.forEach((p, i) => {
    docs.push({ _id: `pillar-${i}`, _type: "pillar", title: p.title, text: p.text, order: i });
  });
  seed.values.forEach((p, i) => {
    docs.push({ _id: `value-${i}`, _type: "valuePanel", title: p.title, text: p.text, order: i });
  });
  seed.timeline.forEach((t, i) => {
    docs.push({ _id: `timeline-${i}`, _type: "timelineEntry", year: t.year, title: t.title, text: t.text, order: i });
  });
  seed.partnerSteps.forEach((s, i) => {
    docs.push({ _id: `step-${i}`, _type: "processStep", title: s.title, text: s.text, order: i });
  });
  seed.awards.forEach((a, i) => {
    docs.push({
      _id: `award-${i}`,
      _type: "award",
      year: a.year,
      title: a.title,
      issuer: a.issuer,
      detail: a.detail,
      order: i,
    });
  });

  // People. Portraits seed empty today (seed.leaderPortraits is {}), which is
  // correct: the client creates them in the Studio as photographs arrive, and a
  // leader with no portrait keeps the monogram placeholder.
  seed.team.forEach((m, i) => {
    docs.push({
      _id: `team-${m.unit}-${i}`,
      _type: "teamMember",
      name: m.name,
      title: m.title,
      unit: m.unit,
      ...(m.group ? { group: m.group } : {}),
      order: i,
    });
  });

  seed.recognitionPhotos.forEach((r, i) => {
    const image = imageRef(assetByWebPath.get(r.src));
    docs.push({
      _id: `recognitionphoto-${i}`,
      _type: "recognitionPhoto",
      ...(image ? { image } : {}),
      srcPath: r.src,
      alt: r.alt,
      caption: r.caption,
      order: i,
    });
  });

  Object.entries(seed.leaderPortraits).forEach(([leaderName, p], i) => {
    docs.push({
      _id: `leaderportrait-${i}`,
      _type: "leaderPortrait",
      leaderName,
      srcPath: p.src,
      alt: p.alt,
    });
  });

  /* Photographic positions. Seeded WITHOUT an image on purpose: the document
   * exists so the client sees the full list of positions in the Studio with the
   * current alt text as a starting point, and uploading a file is the only
   * action needed. The code manifest stays the fallback, so an untouched slot
   * keeps shipping the photograph it ships with today. Positions nothing
   * renders (retailShopfront, officeMap) are deliberately not listed. */
  const EDITABLE_SLOTS = [
    "homeHero", "homeProofGround",
    "marketingWarehouse", "marketingAward", "marketingCorridor",
    "apparelsWarehouse", "apparelsTeam",
    "retailInterior", "retailStorefront", "partnerStorefront",
    "aboutCraft", "aboutValue1", "aboutValue2", "aboutValue3",
  ];
  for (const key of EDITABLE_SLOTS) {
    const slot = photoSlots[key];
    if (!slot) {
      console.warn(`  ! unknown photo slot "${key}" — skipped`);
      continue;
    }
    docs.push({
      _id: `photoslot-${key}`,
      _type: "photoSlot",
      slot: key,
      alt: slot.alt,
    });
  }

  seed.marketingStrengths.forEach((p, i) => {
    docs.push({ _id: `strength-${i}`, _type: "marketingStrength", title: p.title, text: p.text, order: i });
  });

  seed.marketingSteps.forEach((p, i) => {
    docs.push({ _id: `mktstep-${i}`, _type: "marketingStep", title: p.title, text: p.text, order: i });
  });

  seed.marketingReasons.forEach((p, i) => {
    docs.push({ _id: `mktreason-${i}`, _type: "marketingReason", title: p.title, text: p.text, order: i });
  });

  if (dryRun) {
    await fs.writeFile(outFile, JSON.stringify(docs, null, 2), "utf8");
    console.log(`  Wrote ${docs.length} documents to ${outFile}\n`);
    return;
  }

  /* 3) Commit as one transaction (createOrReplace = idempotent upsert). */
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit({ visibility: "async" });

  /* 4) Summary table. */
  const counts = docs.reduce((acc, d) => {
    acc[d._type] = (acc[d._type] || 0) + 1;
    return acc;
  }, {});
  const rows = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  const width = Math.max(...rows.map(([t]) => t.length), 12);
  console.log("  Upserted documents:");
  console.log("  " + "type".padEnd(width) + "  count");
  console.log("  " + "-".repeat(width) + "  -----");
  for (const [type, n] of rows) console.log("  " + type.padEnd(width) + "  " + String(n).padStart(5));
  console.log("  " + "-".repeat(width) + "  -----");
  console.log("  " + "TOTAL".padEnd(width) + "  " + String(docs.length).padStart(5));
  console.log("\n  Done. Open /studio to review.\n");
}

main().catch((err) => {
  console.error("\n  Seed failed:", err.message);
  process.exit(1);
});
