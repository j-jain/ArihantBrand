export interface NavItem {
  label: string;
  href: string;
}

/** Top-level nav after "Businesses". */
export const primaryNav: NavItem[] = [
  { label: "Brands", href: "/brands" },
  { label: "Recognition", href: "/recognition" },
  { label: "Trade Notes", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
