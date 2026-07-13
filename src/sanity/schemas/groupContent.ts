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
