import { defineType, defineField } from "sanity";

/** Awards & recognition (recognition page trophy case). Mirrors a seed
 *  `awards[]` entry (`Award` in src/content/types.ts). `year` is a display
 *  marker — a real year ("2015") or a short tag ("Founder", "4 fairs").
 *  Honesty rail: only genuine, documented recognitions belong here. */
export const award = defineType({
  name: "award",
  title: "Award / Recognition",
  type: "document",
  fields: [
    defineField({ name: "year", title: "Year / marker (label)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "issuer", title: "Issuer", type: "string", validation: (r) => r.required() }),
    defineField({ name: "detail", title: "Detail", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "year" } },
});

/** Retail-backend "system" feature (home InfrastructureSection). Mirrors a
 *  seed `systems[]` entry; backs SYSTEMS_QUERY in src/lib/content.ts. */
export const systemFeature = defineType({
  name: "systemFeature",
  title: "System Feature",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});

/** Shop-in-shop scope point (marketing page SIS section). Mirrors a seed
 *  `sisScope[]` entry; backs SIS_SCOPE_QUERY in src/lib/content.ts. */
export const sisPoint = defineType({
  name: "sisPoint",
  title: "Shop-in-Shop Scope Point",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});

/** One of the four strengths the Marketing page argues to a brand audience.
 *  The home page argues the same four to a retailer audience via `pillar`;
 *  they are separate documents on purpose, so neither page reprints the
 *  other. Mirrors a seed `marketingStrengths[]` entry. */
export const marketingStrength = defineType({
  name: "marketingStrength",
  title: "Marketing Strength (brand audience)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});
