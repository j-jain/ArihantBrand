"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, setBaseLagSmoothing } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";
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

    // A lerp, not a duration (change round 10): a duration restarted a 1.05s
    // expo-out on every wheel tick, so each notch began from rest; the lerp
    // carries the velocity from one tick into the next, one continuous
    // movement that eases out when the hand stops.
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
    });
    setLenis(lenis);

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
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      // Keep the focus move a native jump would have made (change round 9):
      // the skip link to #main was scrolling the page but leaving focus on
      // the link, so a keyboard reader tabbed through the header again.
      lenis.scrollTo(hash, {
        offset: -88,
        onComplete: () => {
          if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) return;
          target.focus({ preventScroll: true });
        },
      });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(raf);
      setBaseLagSmoothing(500);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
