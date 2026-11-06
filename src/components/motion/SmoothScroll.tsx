"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, setBaseLagSmoothing } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

/** Site-wide smooth scroll, driven by Lenis and synced to the GSAP ticker so
 *  ScrollTrigger stays in step. Renders nothing.
 *
 *  Deliberately opt-in: it bails out entirely for reduced-motion users, for
 *  coarse pointers (touch — where the OS momentum is already good and Lenis
 *  fights it), and for narrow viewports. In those cases native scrolling is
 *  left untouched, so content is never gated behind the smoothing layer.
 *  Since the performance pass Lenis is only fetched past that check, so a
 *  phone or a touch screen never downloads it. */
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReduced || !finePointer || window.innerWidth < 768) return;

    let lenis: Lenis | null = null;
    let cancelled = false;
    const raf = (time: number) => lenis?.raf(time * 1000);

    // Delegated same-page anchor scrolling: let Lenis animate to the target and
    // clear the sticky header, but only when the target actually exists.
    const onAnchorClick = (event: MouseEvent) => {
      // A component that already handled the click (the retail store atlas
      // focusing an entry that is on screen) has said "do not scroll".
      if (event.defaultPrevented || !lenis) return;
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

    void import("lenis").then(({ default: LenisClass }) => {
      if (cancelled) return;
      // A lerp, not a duration (change round 10): a duration restarted a 1.05s
      // expo-out on every wheel tick, so each notch began from rest; the lerp
      // carries the velocity from one tick into the next, one continuous
      // movement that eases out when the hand stops. 0.13 since the
      // performance pass (0.085 before): the page still glides, but settles
      // in about half the time, so it no longer trails the hand.
      lenis = new LenisClass({
        lerp: 0.13,
        smoothWheel: true,
        wheelMultiplier: 1,
        syncTouch: false,
      });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      // Off whenever no hero intro holds it (see holdLagSmoothing in lib/gsap).
      setBaseLagSmoothing(0);
      document.addEventListener("click", onAnchorClick);
    });

    return () => {
      cancelled = true;
      if (!lenis) return;
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(raf);
      setBaseLagSmoothing(500);
      setLenis(null);
      lenis.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
