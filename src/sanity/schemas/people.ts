import { defineType, defineField } from "sanity";

/** Mirrors `TeamMember` in src/content/types.ts. Honesty rail: real,
 *  client-supplied people only. No placeholder names. */
export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Designation", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "unit",
      title: "Unit",
      type: "string",
      options: {
        list: [
          { title: "Arihant Marketing", value: "marketing" },
          { title: "Arihant Apparels", value: "apparels" },
          { title: "Arihant Retail", value: "retail" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "group",
      title: "Group label (optional)",
      description: 'Groups related roles together, e.g. "SIS team". Leave blank for most people.',
      type: "string",
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "title" } },
});

/** Mirrors `RecognitionPhoto`. An uploaded `image` is preferred; `srcPath`
 *  keeps the committed file working until one is uploaded. */
export const recognitionPhoto = defineType({
  name: "recognitionPhoto",
  title: "Recognition Photo",
  type: "document",
  fields: [
    defineField({ name: "image", title: "Photograph (uploaded, preferred)", type: "image", options: { hotspot: true } }),
    defineField({
      name: "srcPath",
      title: "Photograph path (fallback, e.g. /images/photos/awards/x.jpg)",
      type: "string",
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      description: "Describe what the certificate or trophy actually says. Screen readers read this instead of the photo.",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      description: "The short line printed under the photograph. Keep it factual: award name and year.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "caption", subtitle: "alt", media: "image" } },
});

/** Mirrors `LeaderPortrait`, keyed by the leader's exact name. Kept separate
 *  from `teamMember` on purpose: portraits are looked up by the names listed on
 *  a Business document, while the roster is filtered by unit. Folding the two
 *  would make an editor keep two lists in sync by hand. A name with no portrait
 *  renders a monogram, so the section is complete before any photo exists. */
export const leaderPortrait = defineType({
  name: "leaderPortrait",
  title: "Leadership Portrait",
  type: "document",
  fields: [
    defineField({
      name: "leaderName",
      title: "Leader name (must match the name on the Business exactly)",
      description: 'For example "Sagar Sancheti". A name that does not match keeps the monogram placeholder.',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Portrait (uploaded, preferred; 4:5 portrait crop)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "srcPath", title: "Portrait path (fallback)", type: "string" }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "leaderName", subtitle: "alt", media: "image" } },
});
