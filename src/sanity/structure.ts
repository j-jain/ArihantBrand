import type { StructureResolver } from "sanity/structure";

const SINGLETON_ID = "siteSettings";
const RETAIL_MODEL_ID = "retailModel";

/** Custom desk: the singleton pinned at the top, then the editable
 *  collections, group content, and finally photography and people.
 *
 *  There is no Leads section. Enquiries are emailed, never written to Sanity,
 *  because a free-plan dataset is public and would expose a prospect's name,
 *  phone and email to anyone with the project id. An always-empty Leads list
 *  would read as "no enquiries" rather than "look in your inbox", so it is
 *  gone rather than left as furniture. See src/lib/notify-email.ts. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Arihant Group")
    .items([
      S.listItem()
        .title("Site Settings")
        .id(SINGLETON_ID)
        .child(S.document().schemaType("siteSettings").documentId(SINGLETON_ID)),

      S.divider(),

      S.documentTypeListItem("business").title("Businesses"),
      S.listItem()
        .title("Brand Partners")
        .schemaType("partner")
        .child(
          S.documentTypeList("partner")
            .title("Brand Partners")
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),
      S.documentTypeListItem("store").title("Stores"),
      S.listItem()
        .title("Retail Model")
        .id(RETAIL_MODEL_ID)
        .child(
          S.document().schemaType("retailModel").documentId(RETAIL_MODEL_ID),
        ),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("post").title("Trade Notes"),
      S.documentTypeListItem("page").title("Pages"),

      S.divider(),

      S.documentTypeListItem("groupStat").title("Group Stats"),
      S.documentTypeListItem("funnelCard").title("Home Funnel Cards"),
      S.documentTypeListItem("pillar").title("Why-Arihant Pillars"),
      S.documentTypeListItem("valuePanel").title("Value Panels"),
      S.documentTypeListItem("timelineEntry").title("Timeline"),
      S.documentTypeListItem("processStep").title("Partner Process Steps"),
      S.documentTypeListItem("award").title("Awards & Recognition"),

      S.divider(),

      S.documentTypeListItem("marketingStrength").title("Marketing Strengths"),
      S.documentTypeListItem("marketingStep").title("Marketing Steps"),
      S.documentTypeListItem("marketingReason").title("Marketing Reasons"),

      S.divider(),

      S.listItem()
        .title("Site Photographs")
        .schemaType("photoSlot")
        .child(
          S.documentTypeList("photoSlot")
            .title("Site Photographs")
            .defaultOrdering([{ field: "slot", direction: "asc" }]),
        ),
      S.documentTypeListItem("recognitionPhoto").title("Recognition Photos"),
      S.documentTypeListItem("teamMember").title("Team Members"),
      S.documentTypeListItem("leaderPortrait").title("Leadership Portraits"),
    ]);

/** Document types managed through custom singleton/list views above, so they
 *  should not also appear in the Studio's default "new document" menus. */
export const singletonTypes = new Set<string>([SINGLETON_ID, RETAIL_MODEL_ID]);
