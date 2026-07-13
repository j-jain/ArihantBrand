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

/** Top-level nav after "Businesses". */
export const primaryNav: NavItem[] = [
  { label: "Brands", href: "/brands" },
  { label: "Partner With Us", href: "/partner" },
  { label: "About", href: "/about" },
  { label: "Trade Notes", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
