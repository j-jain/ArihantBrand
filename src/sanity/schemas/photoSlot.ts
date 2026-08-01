import { defineType, defineField } from "sanity";

/** One photographic position on the site, keyed by the slot id in
 *  src/content/images.ts. A position with no document, or a document with no
 *  uploaded image, falls back to the photograph the code ships with, so the
 *  site can never end up half-photographed.
 *
 *  Only positions that actually render are listed. The stock register in
 *  images.ts stays code-only on purpose: it is a licensing record (credit,
 *  source, dimensions), not editorial content, and every position that uses a
 *  stock file is replaceable here anyway. */
export const photoSlot = defineType({
  name: "photoSlot",
  title: "Site Photograph",
  type: "document",
  fields: [
    defineField({
      name: "slot",
      title: "Position (do not rename)",
      description: "Which photograph on the site this replaces. One document per position.",
      type: "string",
      options: {
        list: [
          { title: "Home: hero", value: "homeHero" },
          { title: "Home: award band background (a texture, not a picture)", value: "homeProofGround" },
          { title: "Marketing: godown", value: "marketingWarehouse" },
          { title: "Marketing: award", value: "marketingAward" },
          { title: "Marketing: corridor", value: "marketingCorridor" },
          { title: "Apparels: warehouse", value: "apparelsWarehouse" },
          { title: "Apparels: team", value: "apparelsTeam" },
          { title: "Retail: store interior", value: "retailInterior" },
          { title: "Partner: storefront", value: "partnerStorefront" },
          { title: "About: craft", value: "aboutCraft" },
          { title: "About: values panel 1", value: "aboutValue1" },
          { title: "About: values panel 2", value: "aboutValue2" },
          { title: "About: values panel 3", value: "aboutValue3" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Photograph",
      description: "Leave empty to keep the photograph the site ships with.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      description:
        "Describe what is actually visible. Never claim a stock photograph shows Arihant's own warehouse, store or people.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "ratio",
      title: "Frame ratio (advanced, leave blank)",
      description:
        'For example "4 / 5". Blank keeps the shape the layout already reserves. Changing it can shift the section around it.',
      type: "string",
    }),
    defineField({ name: "credit", title: "Photographer credit (optional)", type: "string" }),
  ],
  orderings: [{ title: "Position", name: "slotAsc", by: [{ field: "slot", direction: "asc" }] }],
  preview: { select: { title: "slot", subtitle: "alt", media: "image" } },
});
