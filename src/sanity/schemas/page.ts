import { defineType, defineField, defineArrayMember } from "sanity";

/** Mirrors `PageCopy` (+ `Hero`) in src/content/types.ts.
 *  `sections` is stored as an array of keyed objects; content.ts converts it
 *  back into the `Record<string, {...}>` shape the site consumes. */
export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "pageId",
      title: "Page",
      type: "string",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Marketing", value: "marketing" },
          { title: "Apparels", value: "apparels" },
          { title: "Retail", value: "retail" },
          { title: "Partner (franchise)", value: "partner" },
          { title: "Brands", value: "brands" },
          { title: "About", value: "about" },
          { title: "Blog", value: "blog" },
          { title: "Contact", value: "contact" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "metaTitle", title: "Meta title", type: "string" }),
    defineField({ name: "metaDescription", title: "Meta description", type: "text", rows: 2 }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "threadLabel", title: "Thread label (kicker)", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "text", rows: 2 }),
        defineField({
          name: "headingEmphasis",
          title: "Heading emphasis (word set in italic accent)",
          type: "string",
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 3 }),
        defineField({ name: "primaryCta", title: "Primary CTA", type: "cta" }),
        defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            defineField({
              name: "key",
              title: "Key (stable id used by the page component)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "lead", title: "Lead", type: "text", rows: 2 }),
            defineField({
              name: "body",
              title: "Body (paragraphs / list lines)",
              type: "array",
              of: [defineArrayMember({ type: "text", rows: 2 })],
            }),
          ],
          preview: { select: { title: "heading", subtitle: "key" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { pageId: "pageId", metaTitle: "metaTitle" },
    prepare: ({ pageId, metaTitle }) => ({ title: pageId || "page", subtitle: metaTitle }),
  },
});
