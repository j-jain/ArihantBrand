import { defineType, defineField } from "sanity";

/** Mirrors `Store` in src/content/types.ts. */
export const store = defineType({
  name: "store",
  title: "Store",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "city",
      title: "City / area",
      description:
        "Must match a town in the site's store map (src/content/towns.ts) to get a pin; other towns are listed without one.",
      type: "string",
    }),
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
    defineField({
      name: "ownership",
      title: "Ownership",
      description:
        "Shown as the solid (company-owned) or framed (franchisee-owned) mark on the retail store map and list.",
      type: "string",
      options: {
        list: [
          { title: "Company-owned", value: "Company-owned" },
          { title: "Franchisee-owned", value: "Franchisee-owned" },
        ],
      },
    }),
    defineField({ name: "image", title: "Photo (uploaded — preferred)", type: "image", options: { hotspot: true } }),
    defineField({ name: "imagePath", title: "Photo path (fallback, e.g. /images/photos/x.webp)", type: "string" }),
    defineField({ name: "caption", title: "Caption / alt text", type: "text", rows: 2 }),
    defineField({
      name: "mapsQuery",
      title: "Address",
      description:
        "Full address. Fill this only when the location is confirmed. Used for search engines, and for Get directions when there is no Google Maps link.",
      type: "string",
    }),
    defineField({
      name: "mapsLink",
      title: "Google Maps link",
      description:
        "The store's exact pin: in Google Maps open the store, then Share > Copy link, and paste it here. Get directions opens it. Leave blank to fall back to a Maps search for the address; with neither, the store shows no Get directions link.",
      type: "url",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "ownership", media: "image" } },
});
