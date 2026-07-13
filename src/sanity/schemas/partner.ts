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
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "unit", media: "image" } },
});
