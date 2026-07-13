import { defineType, defineField } from "sanity";

/** Mirrors `Testimonial` in src/content/types.ts. Only `published: true`
 *  entries are ever rendered on the site (honesty rail). */
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Role / store", type: "string" }),
    defineField({
      name: "published",
      title: "Published (renders on the site)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role", published: "published" },
    prepare: ({ title, subtitle, published }) => ({
      title: `${published ? "✓ " : "○ "}${title}`,
      subtitle,
    }),
  },
});
