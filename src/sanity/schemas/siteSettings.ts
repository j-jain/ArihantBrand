import { defineType, defineField, defineArrayMember } from "sanity";

/** Singleton. Mirrors `SiteSettings` in src/content/types.ts. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "orgName", title: "Organisation name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "addressLine", title: "Address line", type: "string" }),
    defineField({ name: "locality", title: "Locality", type: "string" }),
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({ name: "state", title: "State", type: "string" }),
    defineField({ name: "postalCode", title: "Postal code", type: "string" }),
    defineField({ name: "country", title: "Country (ISO)", type: "string", initialValue: "IN" }),
    defineField({
      name: "defaultWhatsapp",
      title: "Default WhatsApp (digits, with country code)",
      type: "string",
    }),
    defineField({
      name: "gstin",
      title: "GSTIN",
      description: "Printed in the footer when filled. Leave blank to hide the line.",
      type: "string",
    }),
    defineField({
      name: "cin",
      title: "CIN",
      description: "Printed in the footer when filled. Leave blank to hide the line.",
      type: "string",
    }),
    defineField({
      name: "mapsLink",
      title: "Google Maps link",
      description:
        "The office pin: in Google Maps open Arihant Tower, then Share > Copy link, and paste it here. The footer address and /contact open it. Leave blank to fall back to a Maps search for the address.",
      type: "url",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({ name: "metaTitleSuffix", title: "Meta title suffix", type: "string" }),
    defineField({
      name: "contacts",
      title: "Unit contacts",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "unitContact",
          fields: [
            defineField({
              name: "unit",
              title: "Unit",
              type: "string",
              options: {
                list: [
                  { title: "Marketing", value: "marketing" },
                  { title: "Apparels", value: "apparels" },
                  { title: "Retail", value: "retail" },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({ name: "businessName", title: "Business name", type: "string" }),
            defineField({ name: "floor", title: "Floor", type: "string" }),
            defineField({
              name: "phones",
              title: "Phones",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "phone",
                  fields: [
                    defineField({ name: "name", title: "Contact name", type: "string" }),
                    defineField({ name: "phone", title: "Phone number", type: "string" }),
                  ],
                  preview: { select: { title: "name", subtitle: "phone" } },
                }),
              ],
            }),
            defineField({ name: "email", title: "Email", type: "string" }),
            defineField({
              name: "whatsapp",
              title: "WhatsApp (digits, with country code)",
              type: "string",
            }),
          ],
          preview: { select: { title: "businessName", subtitle: "floor" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
