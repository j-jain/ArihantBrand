import { defineType, defineField, defineArrayMember } from "sanity";

/** Mirrors `Post` + `PostBlock` in src/content/types.ts.
 *  Body is NOT portable text — it is the typed block union the site renders:
 *  pBlock -> {type:"p"}, h2Block -> {type:"h2"}, h3Block -> {type:"h3"},
 *  ulBlock -> {type:"ul", items[]}. */
export const post = defineType({
  name: "post",
  title: "Trade Note (post)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
    defineField({ name: "date", title: "Date (ISO)", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "audience",
      title: "Audience",
      type: "string",
      options: {
        list: [
          { title: "Retailers", value: "Retailers" },
          { title: "Brands", value: "Brands" },
          { title: "Investors", value: "Investors" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "readMinutes", title: "Read minutes", type: "number" }),
    defineField({ name: "metaDescription", title: "Meta description", type: "text", rows: 2 }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "pBlock",
          title: "Paragraph",
          fields: [defineField({ name: "text", title: "Text", type: "text", rows: 4 })],
          preview: { select: { title: "text" }, prepare: ({ title }) => ({ title: title || "Paragraph" }) },
        }),
        defineArrayMember({
          type: "object",
          name: "h2Block",
          title: "Heading 2",
          fields: [defineField({ name: "text", title: "Text", type: "string" })],
          preview: { select: { title: "text" }, prepare: ({ title }) => ({ title: `H2 · ${title || ""}` }) },
        }),
        defineArrayMember({
          type: "object",
          name: "h3Block",
          title: "Heading 3",
          fields: [defineField({ name: "text", title: "Text", type: "string" })],
          preview: { select: { title: "text" }, prepare: ({ title }) => ({ title: `H3 · ${title || ""}` }) },
        }),
        defineArrayMember({
          type: "object",
          name: "ulBlock",
          title: "Bullet list",
          fields: [
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [defineArrayMember({ type: "text", rows: 2 })],
            }),
          ],
          preview: {
            select: { items: "items" },
            prepare: ({ items }) => ({ title: `List · ${(items || []).length} items` }),
          },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "audience" } },
});
