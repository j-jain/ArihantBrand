import { defineType, defineField, defineArrayMember } from "sanity";

/** Mirrors `Business` in src/content/types.ts.
 *  `logo` (uploaded image) is preferred; `logoPath` (e.g. /images/logos/x.png)
 *  is the fallback the seed uses. `order` is schema-only (drives display order). */
export const business = defineType({
  name: "business",
  title: "Business",
  type: "document",
  fields: [
    defineField({
      name: "unit",
      title: "Unit",
      type: "string",
      options: {
        list: [
          { title: "Marketing", value: "marketing" },
          { title: "Apparels", value: "apparels" },
          { title: "Retail", value: "retail" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "logo", title: "Logo (uploaded — preferred)", type: "image", options: { hotspot: false } }),
    defineField({ name: "logoPath", title: "Logo path (fallback, e.g. /images/logos/x.png)", type: "string" }),
    defineField({ name: "founded", title: "Founded (label)", type: "string" }),
    defineField({ name: "leaders", title: "Leaders", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "positioning", title: "Positioning", type: "string" }),
    defineField({
      name: "tagline",
      title: "Menu line",
      description:
        "One short line for the header's Businesses menu, about five words. Empty falls back to Positioning.",
      type: "string",
      validation: (r) => r.max(48).warning("Keep it to one short line."),
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "highlights",
      title: "Home-page highlights (3 short lines)",
      description:
        "What the home page prints for this business. Keep these as summaries; the arguing is done by Points on the unit page.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "points",
      title: "Points",
      description:
        "Each point carries a stable selector id the site places it by. Edit the text freely; do not rename an id.",
      type: "array",
      of: [defineArrayMember({ type: "businessPoint" })],
    }),
    defineField({ name: "stats", title: "Stats", type: "array", of: [defineArrayMember({ type: "stat" })] }),
    defineField({ name: "audienceCtas", title: "Audience CTAs", type: "array", of: [defineArrayMember({ type: "cta" })] }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "positioning" } },
});
