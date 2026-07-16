import type { StructureResolver } from "sanity/structure";

const SINGLETON_ID = "siteSettings";

/** Custom desk: the singleton pinned at the top, then the editable
 *  collections, group content, and finally Leads split into New / All views. */
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
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("post").title("Trade Notes"),
      S.documentTypeListItem("page").title("Pages"),

      S.divider(),

      S.documentTypeListItem("groupStat").title("Group Stats"),
      S.documentTypeListItem("pillar").title("Why-Arihant Pillars"),
      S.documentTypeListItem("timelineEntry").title("Timeline"),
      S.documentTypeListItem("processStep").title("Partner Process Steps"),
      S.documentTypeListItem("award").title("Awards & Recognition"),
      S.documentTypeListItem("systemFeature").title("System Features"),
      S.documentTypeListItem("sisPoint").title("Shop-in-Shop Scope"),

      S.divider(),

      S.listItem()
        .title("Leads")
        .schemaType("lead")
        .child(
          S.list()
            .title("Leads")
            .items([
              S.listItem()
                .title("New")
                .id("leads-new")
                .child(
                  S.documentList()
                    .title("New Leads")
                    .schemaType("lead")
                    .filter('_type == "lead" && status == "new"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("All")
                .id("leads-all")
                .child(
                  S.documentList()
                    .title("All Leads")
                    .schemaType("lead")
                    .filter('_type == "lead"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
                ),
            ]),
        ),
    ]);

/** Document types managed through custom singleton/list views above, so they
 *  should not also appear in the Studio's default "new document" menus. */
export const singletonTypes = new Set<string>([SINGLETON_ID]);
