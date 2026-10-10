export interface NavItem {
  label: string;
  href: string;
}

/** Top-level nav after "Businesses". Contact is not listed: the header's one
 *  button ("Talk to us") carries /contact since change round 9, and a second
 *  link to the same page would be the duplicate the earlier rounds removed. */
export const primaryNav: NavItem[] = [
  { label: "Brands", href: "/brands" },
  { label: "Recognition", href: "/recognition" },
  { label: "Trade Notes", href: "/blog" },
  { label: "About", href: "/about" },
];
