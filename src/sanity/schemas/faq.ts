import { defineType, defineField } from "sanity";

/** Mirrors `Faq` in src/content/types.ts. `page` is a single value chosen
 *  from a fixed list (which page the FAQ appears on). */
export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({
      name: "bullets",
      title: "Answer bullets (optional)",
      description:
        "Use when an answer makes three or more separate claims. Shown as a list under the answer.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "page",
      title: "Page",
      type: "string",
      options: {
        list: [
          { title: "Partner (franchise)", value: "partner" },
          { title: "Marketing", value: "marketing" },
          { title: "Apparels", value: "apparels" },
          { title: "Contact", value: "contact" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "question", subtitle: "page" } },
});
