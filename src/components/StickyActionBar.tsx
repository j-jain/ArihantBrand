"use client";

import { usePathname } from "next/navigation";
import type { UnitContact } from "@/content/types";
import { trackClass } from "./Analytics";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import { RIVAL_CTA, usePastHero, useRivalCtaOnScreen } from "./useCtaYield";
import { whatsappFor } from "@/lib/whatsapp";

const DOCK_RIVALS = `${RIVAL_CTA}, footer`;

interface StickyActionBarProps {
  /** Full tel: target, e.g. "+919435045528". The fallback when no unit's
   *  printed phone matches the page's WhatsApp desk. */
  tel: string;
  /** WhatsApp digits with country code, e.g. "919435045528". */
  whatsapp: string;
  /** The unit contacts (change round 9): Call dials the desk the page's
   *  WhatsApp already reaches, so a reader on the retail pages rings Arihant
   *  Retail, not the distribution line. */
  contacts?: UnitContact[];
  inquiryHref?: string;
}

/** Mobile-only bar with Call / WhatsApp / Inquire. Slides up once the reader
 *  is past the hero (~90vh), and back down whenever a CTA band or the inquiry
 *  form is in view. It duplicates actions available elsewhere, so it is a pure
 *  enhancement — no content depends on it. The WhatsApp cell routes by page,
 *  by exactly the same rules as the desktop FAB. */
export function StickyActionBar({
  tel,
  whatsapp,
  contacts,
  inquiryHref = "/contact#inquiry",
}: StickyActionBarProps) {
  const pathname = usePathname();
  const pastHero = usePastHero();
  // Keyed by route: the bar outlives page navigations, the CTA bands do not.
  // The footer counts as a rival here: it carries every contact line.
  const rivalOnScreen = useRivalCtaOnScreen(pathname, DOCK_RIVALS);

  const visible = pastHero && !rivalOnScreen;
  const routed = whatsappFor(pathname, whatsapp);
  // The desk's printed phone, where one is printed; else the site default.
  const desk = contacts?.find((c) => c.whatsapp === routed.whatsapp)?.phones[0]?.phone;
  const callHref = desk ? `tel:+91${desk}` : `tel:${tel}`;

  return (
    <div
      className="action-bar grid grid-cols-3 md:hidden"
      data-visible={visible || undefined}
      aria-hidden={!visible}
    >
      <a
        className={`action-bar__btn ${trackClass("CTA call bar")}`}
        href={callHref}
        aria-label="Call Arihant"
        tabIndex={visible ? undefined : -1}
      >
        <PhoneIcon />
        Call
      </a>
      <a
        className={`action-bar__btn action-bar__btn--whatsapp ${trackClass("CTA WhatsApp bar")}`}
        href={routed.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message Arihant on WhatsApp"
        tabIndex={visible ? undefined : -1}
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
      <a
        className="action-bar__btn action-bar__btn--primary"
        href={inquiryHref}
        aria-label="Send an inquiry"
        tabIndex={visible ? undefined : -1}
      >
        Inquire
      </a>
    </div>
  );
}
