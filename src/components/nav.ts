export interface NavItem {
  label: string;
  href: string;
}

/** The three business units (shown as a disclosure in the header). */
export const businessLinks: NavItem[] = [
  { label: "Arihant Marketing", href: "/arihant-marketing" },
  { label: "Arihant Apparels", href: "/arihant-apparels" },
  { label: "Arihant Retail", href: "/arihant-retail" },
];

/** Standalone Partner CTA — rendered as the vermillion header/mobile button and
 *  listed in the footer nav; intentionally kept out of primaryNav to avoid a
 *  duplicate desktop link beside the adjacent CTA. */
export const partnerLink: NavItem = { label: "Partner With Us", href: "/partner" };

/** The three ways into the inquiry form, one per funnel. Each deep-links to
 *  /contact with the intent pre-selected, which skips step 1 of the form. The
 *  values match InquiryForm's intent whitelist exactly. */
export const intentLinks: NavItem[] = [
  { label: "Stock our brands", href: "/contact?intent=retailer" },
  { label: "Distribute your brand", href: "/contact?intent=brand" },
  { label: "Own a managed store", href: "/contact?intent=franchise" },
];

/** Footer-only links: real pages that do not earn a slot in the primary bar. */
export const secondaryNav: NavItem[] = [{ label: "Careers", href: "/careers" }];

/** Top-level nav after "Businesses". */
export const primaryNav: NavItem[] = [
  { label: "Brands", href: "/brands" },
  { label: "Recognition", href: "/recognition" },
  { label: "Trade Notes", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
