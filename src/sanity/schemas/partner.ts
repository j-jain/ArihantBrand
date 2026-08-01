import { defineType, defineField } from "sanity";

/** Mirrors `Partner` in src/content/types.ts.
 *  `image` (uploaded) preferred over `imagePath` (e.g. /images/partners/x.png). */
export const partner = defineType({
  name: "partner",
  title: "Brand Partner",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "unit",
      title: "Distributed by",
      type: "string",
      options: {
        list: [
          { title: "Arihant Marketing", value: "marketing" },
          { title: "Arihant Apparels", value: "apparels" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "image", title: "Logo (uploaded — preferred)", type: "image", options: { hotspot: false } }),
    defineField({ name: "imagePath", title: "Logo path (fallback, e.g. /images/partners/x.png)", type: "string" }),
    defineField({
      name: "category",
      title: "Category (optional — only for well-known verifiable labels)",
      type: "string",
    }),
    defineField({
      name: "rank",
      title: "Wall rank (1 = shown first; blank = alphabetical)",
      description:
        "Presentation only. The labels a retailer is most likely to recognise lead the wall. It claims nothing about volume or importance. Leave blank and the brand simply follows in alphabetical order.",
      type: "number",
      validation: (r) => r.min(1).integer(),
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "unit", media: "image" } },
});
