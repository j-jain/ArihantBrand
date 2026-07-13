import { defineType, defineField } from "sanity";

/** Inquiry lead. Written by src/lib/leads.ts; reviewed in the Studio. Mirrors
 *  `LeadInput` in src/content/types.ts plus createdAt + status.
 *  The captured fields are read-only in the Studio (they came from the site);
 *  only `status` is editable, so the team can triage without rewriting a lead. */
export const lead = defineType({
  name: "lead",
  title: "Lead",
  type: "document",
  fields: [
    defineField({
      name: "intent",
      title: "Intent",
      type: "string",
      readOnly: true,
      options: {
        list: [
          { title: "Retailer", value: "retailer" },
          { title: "Brand", value: "brand" },
          { title: "Franchise", value: "franchise" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({ name: "name", title: "Name", type: "string", readOnly: true }),
    defineField({ name: "phone", title: "Phone", type: "string", readOnly: true }),
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "city", title: "City", type: "string", readOnly: true }),
    defineField({ name: "company", title: "Company", type: "string", readOnly: true }),
    defineField({ name: "message", title: "Message", type: "text", rows: 4, readOnly: true }),
    defineField({ name: "sourcePage", title: "Source page", type: "string", readOnly: true }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime", readOnly: true }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "new",
    }),
  ],
  orderings: [{ title: "Newest first", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { title: "name", intent: "intent", status: "status", createdAt: "createdAt" },
    prepare: ({ title, intent, status, createdAt }) => ({
      title: `${title || "Lead"} · ${intent || "?"}`,
      subtitle: `${status || "new"}${createdAt ? " · " + new Date(createdAt).toLocaleDateString() : ""}`,
    }),
  },
});
