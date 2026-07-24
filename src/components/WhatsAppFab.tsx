"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./icons";
import { usePastHero, useRivalCtaOnScreen } from "./useCtaYield";

interface WhatsAppFabProps {
  /** Digits with country code. Used when no route rule matches. */
  fallback: string;
  /** Route prefix to WhatsApp number, most specific first. */
  routes?: { prefix: string; whatsapp: string; prefill: string }[];
}

/** Where a page's WhatsApp tap should land. Distribution enquiries reach the
 *  Marketing desk; store and franchise enquiries reach Arihant Retail. */
export const DEFAULT_WA_ROUTES: NonNullable<WhatsAppFabProps["routes"]> = [
  {
    prefix: "/arihant-marketing",
    whatsapp: "919435045528",
    prefill: "Hello Arihant Marketing, I would like to know about your brands and terms.",
  },
  {
    prefix: "/arihant-apparels",
    whatsapp: "919435045528",
    prefill: "Hello Arihant Apparels, I would like to know about your brands and terms.",
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
];

/** Resolve the WhatsApp target for a path. Exported so the mobile action bar
 *  can route by exactly the same rules. */
export function whatsappFor(
  pathname: string,
  fallback: string,
  routes: NonNullable<WhatsAppFabProps["routes"]> = DEFAULT_WA_ROUTES,
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

/**
 * Desktop-only WhatsApp affordance. Most of this trade opens WhatsApp before
 * it opens a form, and on a laptop there was previously no persistent way to
 * reach one. Phones keep `StickyActionBar` instead, so the two never coexist.
 *
 * It stands down whenever one of the page's own CTA bands is on screen, for
 * the same reason the mobile bar does: never double the ask.
 */
export function WhatsAppFab({ fallback, routes = DEFAULT_WA_ROUTES }: WhatsAppFabProps) {
  const pathname = usePathname();
  const pastHero = usePastHero();
  const rivalOnScreen = useRivalCtaOnScreen();

  const { href } = whatsappFor(pathname, fallback, routes);
  const visible = pastHero && !rivalOnScreen;

  return (
    <a
      className="wa-fab hidden md:inline-flex"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-visible={visible || undefined}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      aria-label="Message Arihant on WhatsApp"
    >
      <WhatsAppIcon width={26} height={26} />
    </a>
  );
}
