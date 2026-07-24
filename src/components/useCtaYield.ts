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
 *  pages carrying several. */
export function useRivalCtaOnScreen(): boolean {
  const [onScreen, setOnScreen] = useState(false);

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
        setOnScreen(visible.size > 0);
      },
      { threshold: 0 },
    );
    targets.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, []);

  return onScreen;
}
