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

/** Sections that already put the same ask in front of the reader. While one of
 *  these is on screen the bar stands down, so a phone visitor never sees the
 *  page's own CTA and a floating duplicate of it at the same time. */
const RIVAL_CTA = ".drench-band, #inquiry, .action-bar-yield";

/** Mobile-only bar with Call / WhatsApp / Inquire. Slides up once the reader
 *  is past the hero (~90vh), and back down whenever a CTA band or the inquiry
 *  form is in view. It duplicates actions available elsewhere, so it is a pure
 *  enhancement — no content depends on it. */
export function StickyActionBar({
  tel,
  whatsapp,
  inquiryHref = "/contact#inquiry",
}: StickyActionBarProps) {
  const [pastHero, setPastHero] = useState(false);
  const [ctaOnScreen, setCtaOnScreen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setPastHero(window.scrollY > window.innerHeight * 0.9);
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

  // Yield to the page's own calls to action. Counting intersections rather than
  // tracking a single element keeps this correct on pages with several.
  useEffect(() => {
    const targets = document.querySelectorAll(RIVAL_CTA);
    if (targets.length === 0) return;

    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setCtaOnScreen(visible.size > 0);
      },
      { threshold: 0 },
    );
    targets.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, []);

  const visible = pastHero && !ctaOnScreen;

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
