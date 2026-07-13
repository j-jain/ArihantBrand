"use client";

import { useEffect, useState } from "react";
import { PhoneIcon, WhatsAppIcon } from "./icons";

interface StickyActionBarProps {
  /** Full tel: target, e.g. "+919435045528". */
  tel: string;
  /** WhatsApp digits with country code, e.g. "919435045528". */
  whatsapp: string;
  inquiryHref?: string;
}

/** Mobile-only bar with Call / WhatsApp / Inquire. Slides up once the reader
 *  is past the hero (~90vh). It duplicates actions available elsewhere, so it
 *  is a pure enhancement — no content depends on it. */
export function StickyActionBar({
  tel,
  whatsapp,
  inquiryHref = "/contact#inquiry",
}: StickyActionBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY > window.innerHeight * 0.9);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="action-bar grid grid-cols-3 md:hidden"
      data-visible={visible || undefined}
      aria-hidden={!visible}
    >
      <a
        className="action-bar__btn"
        href={`tel:${tel}`}
        aria-label="Call Arihant"
        tabIndex={visible ? undefined : -1}
      >
        <PhoneIcon />
        Call
      </a>
      <a
        className="action-bar__btn"
        href={`https://wa.me/${whatsapp}`}
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
