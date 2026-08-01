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

/** One step of the retailer visit cycle (marketing page "How we work").
 *  A real sequence, so `order` is load-bearing: it drives the 01-04 numerals
 *  the page renders. Mirrors a seed `marketingSteps[]` entry. */
export const marketingStep = defineType({
  name: "marketingStep",
  title: "Marketing Step (retailer cycle)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});

/** One reason the Northeast needs its own distributor (marketing page "Why a
 *  specialist"), written for a national brand manager. Four parallel
 *  arguments rather than a sequence, so the page renders them with named
 *  lead-ins and no numerals. Mirrors a seed `marketingReasons[]` entry. */
export const marketingReason = defineType({
  name: "marketingReason",
  title: "Marketing Reason (why a specialist)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});
