"use client";

import { usePathname } from "next/navigation";
import { trackClass } from "./Analytics";
import { WhatsAppIcon } from "./icons";
import { DEFAULT_WA_ROUTES, whatsappFor, type WhatsAppRoute } from "@/lib/whatsapp";
import { usePastHero, useRivalCtaOnScreen } from "./useCtaYield";

interface WhatsAppFabProps {
  /** Digits with country code. Used when no route rule matches. */
  fallback: string;
  /** Route prefix to WhatsApp number, most specific first. */
  routes?: WhatsAppRoute[];
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
      className={`wa-fab hidden md:inline-flex ${trackClass("CTA WhatsApp FAB")}`}
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
