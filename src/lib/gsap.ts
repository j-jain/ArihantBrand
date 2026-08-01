"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/* Central GSAP hub. Every animated component imports gsap / ScrollTrigger /
 * SplitText / useGSAP from THIS module, so plugins are registered exactly once
 * and never touched during SSR. All GSAP plugins are free (Webflow acquisition),
 * so SplitText needs no auth token. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Mobile browsers fire resize when the URL bar shows/hides; ignoring it stops
  // needless ScrollTrigger refreshes (a common source of scroll jank).
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Every scroll trigger measures its start and end once, when its component
  // mounts, and nothing recomputed them afterwards. The page is still moving at
  // that point: Besley and Archivo swap in and re-set every heading, SplitText
  // splits each h2 into words and reverts it when the reveal lands, and the
  // images above settle. Each of those shifts everything below it, so triggers
  // further down the page fire against stale offsets. The pillar card stack
  // showed it worst, tucking its cards before the reader had reached them.
  // Re-measure once the page has actually settled.
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  if (document.readyState === "complete") refresh();
  else window.addEventListener("load", refresh, { once: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Canonical motion tokens, mirroring globals.css --ease / --dur-slow so JS and
 *  CSS motion feel identical. cubic-bezier(0.16, 1, 0.3, 1) ≈ power3.out. */
export const EASE = "power3.out";
export const DUR = 0.56;
export const DUR_SLOW = 0.8;
