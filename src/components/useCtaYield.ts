"use client";

import { useEffect, useState } from "react";

/** Sections that already put the same ask in front of the reader. While one of
 *  these is on screen the floating affordances stand down, so a visitor never
 *  sees the page's own CTA and a floating duplicate of it at the same time. */
export const RIVAL_CTA = ".drench-band, #inquiry, .action-bar-yield";

/** True once the reader is past the hero (~90vh). */
export function usePastHero(): boolean {
  const [pastHero, setPastHero] = useState(false);

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

  return pastHero;
}

/** True while any of the page's own CTA sections is in view. Counts
 *  intersections rather than tracking a single element, so it stays correct on
 *  pages carrying several.
 *
 *  The host lives in the persistent layout, so a client-side navigation does
 *  not remount it. Pass the route as `routeKey` and the bands are looked up
 *  again on every page; without it they are looked up once, on mount.
 *  `selector` widens what counts as a rival (the phone dock adds the footer,
 *  which carries every contact line itself). */
export function useRivalCtaOnScreen(routeKey?: string, selector: string = RIVAL_CTA): boolean {
  const [onScreen, setOnScreen] = useState(false);
  const [seenKey, setSeenKey] = useState(routeKey);
  if (routeKey !== seenKey) {
    setSeenKey(routeKey);
    setOnScreen(false);
  }

  useEffect(() => {
    const targets = document.querySelectorAll(selector);
    if (targets.length === 0) return;

    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setOnScreen(visible.size > 0);
      },
      { threshold: 0 },
    );
    targets.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, [routeKey, selector]);

  return onScreen;
}
