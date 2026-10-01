import { defineType, defineField } from "sanity";

/** Rejects any field that contains a digit. The returns worksheet and the
 *  ROIC line are the two places an editor is most likely to reach for a
 *  number, and PRODUCT.md's honesty rails say franchise economics stay
 *  qualitative. Enforcing it here beats trusting everyone to remember. */
const noFigures = (message: string) => (value?: string) =>
  value && /\d/.test(value) ? message : true;

const calculatorField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({
        name: "label",
        title: "Label",
        type: "string",
        validation: (r) => r.required(),
      }),
      defineField({
        name: "help",
        title: "Help text",
        type: "string",
        validation: (r) => r.required(),
      }),
    ],
  });

const resultLabel = (name: string, title: string) =>
  defineField({ name, title, type: "string", validation: (r) => r.required() });

/**
 * The Arihant Retail managed-store model. One document per site (singleton),
 * rendered by ModelBoard on /arihant-retail and /partner.
 *
 * Mirrors `RetailModel` in src/content/types.ts. NOTHING in this document may
 * state an Arihant business figure: no investment amount, no return
 * percentage, no payback period. The worksheet computes only from figures the
 * visitor types on the page, and the disclosure below says so.
 */
export const retailModel = defineType({
  name: "retailModel",
  title: "Retail model",
  type: "document",
  fields: [
    defineField({
      name: "pillars",
      title: "Pillars",
      description:
        "Four rows, each drawn with its own diagram. The selector id chooses the diagram, so it must not be renamed. Title and text are free copy.",
      type: "array",
      validation: (r) => r.required().min(1).max(4),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "id",
              title: "Selector id (do not rename)",
              type: "string",
              options: {
                list: [
                  { title: "Zero deadstock", value: "zero-deadstock" },
                  { title: "Multi-brand", value: "multi-brand" },
                  { title: "No frills", value: "no-frills" },
                  { title: "Company-run", value: "company-run" },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "id" } },
        },
      ],
    }),
    defineField({
      name: "roicNote",
      title: "Return on capital note (no figures)",
      description:
        "Qualitative only. Franchise economics stay qualitative on this site, so no percentage and no amount. Any digit is rejected.",
      type: "text",
      rows: 4,
      validation: (r) =>
        r
          .required()
          .custom(
            noFigures(
              "Franchise economics stay qualitative. No figures or percentages in the return-on-capital note (PRODUCT.md honesty rails).",
            ),
          ),
    }),
    defineField({
      name: "calculator",
      title: "Returns worksheet",
      description:
        "Every string the worksheet popup prints. It computes only from what the visitor types in; nothing here is or may become a number.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "triggerLabel",
          title: "Button label",
          description:
            "Names the tool, not an outcome. Avoid anything that promises a result.",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "heading",
          title: "Panel heading",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "lead",
          title: "Panel lead",
          type: "text",
          rows: 2,
          validation: (r) => r.required(),
        }),
        defineField({
          name: "disclosure",
          title: "Disclosure (required, always shown)",
          description:
            "Sits above the fields and is what a screen reader announces on open. It must keep saying that every figure is the visitor's own, that nothing shown is an Arihant projection, and that nothing is sent or stored.",
          type: "text",
          rows: 5,
          validation: (r) =>
            r
              .required()
              .custom(
                noFigures(
                  "The disclosure must not contain figures. It is the sentence that says no figure here is ours.",
                ),
              ),
        }),
        defineField({
          name: "fields",
          title: "Input labels",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            calculatorField("area", "Carpet area"),
            calculatorField("rent", "Monthly rent"),
            calculatorField("sales", "Expected monthly sales"),
            calculatorField("margin", "Expected gross margin"),
            calculatorField("otherCosts", "Other running costs"),
          ],
        }),
        defineField({
          name: "results",
          title: "Output row labels",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            resultLabel("grossMargin", "Gross margin row"),
            resultLabel("statedCosts", "Stated costs row"),
            resultLabel("leftOver", "What the numbers leave row"),
            resultLabel("salesPerSqFt", "Sales per sq ft row"),
            resultLabel("rentShare", "Rent share row"),
            resultLabel("empty", "Placeholder while a field is blank"),
          ],
        }),
        defineField({
          name: "resultNote",
          title: "Note above the results",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "leftOverNote",
          title: "Note under the leftover row",
          description:
            "This row is the one a reader will mistake for profit. The note must say what it excludes.",
          type: "text",
          rows: 3,
          validation: (r) => r.required(),
        }),
        defineField({
          name: "cta",
          title: "Closing call to action",
          type: "cta",
          validation: (r) => r.required(),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Retail model", subtitle: "Pillars, ROIC note, worksheet" }),
  },
});
