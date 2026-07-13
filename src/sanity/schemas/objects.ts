import { defineType, defineField } from "sanity";

/** Reusable call-to-action object. Mirrors `Cta` in src/content/types.ts. */
export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "Href", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

/** Reusable stat object. Mirrors `Stat` in src/content/types.ts. */
export const stat = defineType({
  name: "stat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({ name: "value", title: "Value (number)", type: "number", validation: (r) => r.required() }),
    defineField({ name: "suffix", title: "Suffix", type: "string" }),
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
  ],
  preview: {
    select: { value: "value", suffix: "suffix", label: "label" },
    prepare: ({ value, suffix, label }) => ({
      title: `${value ?? ""}${suffix ?? ""}`,
      subtitle: label,
    }),
  },
});
