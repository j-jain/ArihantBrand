/**
 * Where a WhatsApp tap lands, and what it says when it opens.
 *
 * This lives outside the component tree because BOTH sides need it: the
 * client FAB and action bar resolve it per route, and server components (the
 * home hero's brand-list link, the brand-list gate's fallback) need the same
 * answer without pulling a "use client" module into a server render.
 */

export interface WhatsAppRoute {
  /** Route prefix this rule matches, e.g. "/arihant-retail". */
  prefix: string;
  /** Digits with country code. */
  whatsapp: string;
  /** Message the chat opens with. */
  prefill: string;
}

/**
 * Where a page's WhatsApp tap should land. Distribution enquiries reach the
 * Marketing desk; store and franchise enquiries reach Arihant Retail.
 *
 * Retailer-facing prefills are bilingual (change brief, X5). A shopkeeper in a
 * district town is far likelier to write the follow-up in Hindi than in
 * English, and a message that opens in the language they will answer in is the
 * difference between a reply and a read receipt. The pages aimed at national
 * brand managers and franchise investors stay in English, because that is the
 * language those conversations are already held in.
 *
 * This is deliberately NOT a site translation. A real Hindi or Assamese
 * edition means maintaining a second copy of every string on the site and is
 * its own project; this is the brief's own stated fallback.
 */
export const DEFAULT_WA_ROUTES: WhatsAppRoute[] = [
  {
    prefix: "/arihant-marketing",
    whatsapp: "919435045528",
    prefill:
      "नमस्ते Arihant Marketing, मुझे आपके ब्रांड और टर्म्स की जानकारी चाहिए. (Hello, I would like to know about your brands and terms.)",
  },
  {
    prefix: "/arihant-apparels",
    whatsapp: "919435045528",
    prefill:
      "नमस्ते Arihant Apparels, मुझे आपके ब्रांड और टर्म्स की जानकारी चाहिए. (Hello, I would like to know about your brands and terms.)",
  },
  {
    prefix: "/arihant-retail",
    whatsapp: "919435569704",
    prefill: "Hello Arihant Retail, I would like to know about your stores.",
  },
  {
    prefix: "/partner",
    whatsapp: "919435569704",
    prefill: "Hello Arihant Retail, I am interested in owning a managed store.",
  },
  {
    prefix: "/brands",
    whatsapp: "919435045528",
    prefill:
      "नमस्ते Arihant, कृपया अपनी ब्रांड लिस्ट भेजिए. (Hello, please send me your brand list.)",
  },
];

/** Resolve the WhatsApp target for a path. Exported so the mobile action bar
 *  can route by exactly the same rules. */
export function whatsappFor(
  pathname: string,
  fallback: string,
  routes: WhatsAppRoute[] = DEFAULT_WA_ROUTES,
): { href: string; whatsapp: string } {
  const match = routes.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`),
  );
  const whatsapp = match?.whatsapp ?? fallback;
  const prefill =
    match?.prefill ?? "Hello Arihant, I would like to talk to someone about stocking your brands.";
  return {
    whatsapp,
    href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(prefill)}`,
  };
}
