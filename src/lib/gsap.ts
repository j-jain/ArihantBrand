"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

/* Central GSAP hub. Every animated component imports gsap / ScrollTrigger /
 * SplitText / useGSAP from THIS module, so plugins are registered exactly once
 * and never touched during SSR. All GSAP plugins are free (Webflow acquisition),
 * so SplitText needs no auth token. */
if (typeof window !== "undefined") {
  // Flip (change round 6): the /brands index re-flows its names as a search
  // narrows them.
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
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

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };

/* Lag smoothing, shared. SmoothScroll turns it off (Lenis wants a ticker that
 * never fakes time), but the hero intro plays while hydration, image decode
 * and the first ScrollTrigger refresh are still landing; with smoothing off,
 * one long task makes the intro jump straight past its opening frames. The
 * intro holds a tight smoothing window while it plays and lets go after, and
 * whichever runs first, the base setting is restored once nothing holds. */
let baseLag: [number, number] = [500, 33]; // GSAP's own default
let lagHolds = 0;
const applyLag = () => {
  if (lagHolds > 0) gsap.ticker.lagSmoothing(100, 33);
  else gsap.ticker.lagSmoothing(baseLag[0], baseLag[1]);
};

/** The lag smoothing in force whenever no intro holds it (0 turns it off). */
export function setBaseLagSmoothing(threshold: number, adjustedLag = 33) {
  baseLag = [threshold, adjustedLag];
  applyLag();
}

/** Treats any frame gap over 100ms as one frame until the returned release
 *  is called, so a long task delays the motion instead of skipping it. */
export function holdLagSmoothing(): () => void {
  lagHolds++;
  applyLag();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lagHolds--;
    applyLag();
  };
}

/** Canonical motion tokens, mirroring globals.css --ease / --dur-slow so JS and
 *  CSS motion feel identical. cubic-bezier(0.16, 1, 0.3, 1) ≈ power3.out. */
export const EASE = "power3.out";
export const DUR = 0.56;
export const DUR_SLOW = 0.8;
