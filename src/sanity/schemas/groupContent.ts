import { defineType, defineField } from "sanity";

/** Group-level "Why Arihant" pillar. Mirrors a seed `pillars[]` entry. */
export const pillar = defineType({
  name: "pillar",
  title: "Why-Arihant Pillar",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});

/** One home-page audience funnel. Mirrors `Funnel` in src/content/types.ts.
 *  Each funnel is its own card and its own CTA: a retailer and a franchise
 *  investor must never share a button. */
export const funnelCard = defineType({
  name: "funnelCard",
  title: "Home funnel",
  type: "document",
  fields: [
    defineField({
      name: "id",
      title: "Selector id (do not rename)",
      description:
        "Matches the inquiry-form intent this funnel routes to, e.g. retailer, franchise.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "cta", title: "Call to action", type: "cta" }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "id" } },
});

/** One About-page value. Deliberately separate from `pillar`: the home page
 *  argues what a retailer buys, the About page states what the family is
 *  trying to be. Mirrors a seed `values[]` entry. */
export const valuePanel = defineType({
  name: "valuePanel",
  title: "About Value",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});

/** About-page timeline entry. Mirrors a seed `timeline[]` entry. */
export const timelineEntry = defineType({
  name: "timelineEntry",
  title: "Timeline Entry",
  type: "document",
  fields: [
    defineField({ name: "year", title: "Year (label)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "year" } },
});

/** Franchise process step (true numbered sequence). Mirrors `ProcessStep`. */
export const processStep = defineType({
  name: "processStep",
  title: "Partner Process Step",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Step order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Step order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "order" } },
});

/** Group-level headline stat. Mirrors a seed `groupStats[]` entry (`Stat`). */
export const groupStat = defineType({
  name: "groupStat",
  title: "Group Stat",
  type: "document",
  fields: [
    defineField({
      name: "id",
      title: "Selector id (do not rename)",
      description:
        "Stable key the site uses to place this stat. Changing it can blank a section.",
      type: "string",
    }),
    defineField({ name: "value", title: "Value (number)", type: "number", validation: (r) => r.required() }),
    defineField({ name: "suffix", title: "Suffix", type: "string" }),
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { value: "value", suffix: "suffix", label: "label" },
    prepare: ({ value, suffix, label }) => ({ title: `${value ?? ""}${suffix ?? ""}`, subtitle: label }),
  },
});
