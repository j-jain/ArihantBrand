import { defineType, defineField } from "sanity";

/** Mirrors `Store` in src/content/types.ts. */
export const store = defineType({
  name: "store",
  title: "Store",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "city", title: "City / area", type: "string" }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: [{ title: "Multi-brand", value: "Multi-brand" }],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Open", value: "Open" },
          { title: "Fit-out", value: "Fit-out" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "image", title: "Photo (uploaded — preferred)", type: "image", options: { hotspot: true } }),
    defineField({ name: "imagePath", title: "Photo path (fallback, e.g. /images/photos/x.jpg)", type: "string" }),
    defineField({ name: "caption", title: "Caption / alt text", type: "text", rows: 2 }),
    defineField({
      name: "mapsQuery",
      title: "Address for directions",
      description:
        "Full address. Fill this only when the location is confirmed; leaving it blank hides the Get directions link.",
      type: "string",
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "status", media: "image" } },
});
