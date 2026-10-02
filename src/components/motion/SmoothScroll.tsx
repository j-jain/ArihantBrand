"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, setBaseLagSmoothing } from "@/lib/gsap";
import Lenis from "lenis";

/** Site-wide smooth scroll, driven by Lenis and synced to the GSAP ticker so
 *  ScrollTrigger stays in step. Renders nothing.
 *
 *  Deliberately opt-in: it bails out entirely for reduced-motion users, for
 *  coarse pointers (touch — where the OS momentum is already good and Lenis
 *  fights it), and for narrow viewports. In those cases native scrolling is
 *  left untouched, so content is never gated behind the smoothing layer. */
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReduced || !finePointer || window.innerWidth < 768) return;

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Off whenever no hero intro holds it (see holdLagSmoothing in lib/gsap).
    setBaseLagSmoothing(0);

    // Delegated same-page anchor scrolling: let Lenis animate to the target and
    // clear the sticky header, but only when the target actually exists.
    const onAnchorClick = (event: MouseEvent) => {
      // A component that already handled the click (the retail store atlas
      // focusing an entry that is on screen) has said "do not scroll".
      if (event.defaultPrevented) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      if (!document.querySelector(hash)) return;
      event.preventDefault();
      lenis.scrollTo(hash, { offset: -88 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(raf);
      setBaseLagSmoothing(500);
      lenis.destroy();
    };
  }, []);

  return null;
}
