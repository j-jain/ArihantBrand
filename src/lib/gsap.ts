"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

/* Central GSAP hub. Every animated component imports gsap / ScrollTrigger /
 * SplitText / useGSAP from THIS module, so plugins are registered exactly once
 * and never touched during SSR. All GSAP plugins are free (Webflow acquisition),
 * so SplitText needs no auth token. */
if (typeof window !== "undefined") {
  // Flip (change round 6): the /brands index re-flows its names as a search
  // narrows them. CustomEase (change round 9): the one site ease, below.
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, useGSAP);
  // Mobile browsers fire resize when the URL bar shows/hides; ignoring it stops
  // needless ScrollTrigger refreshes (a common source of scroll jank).
  ScrollTrigger.config({ ignoreMobileResize: true });

  // The CSS `--ease` (globals.css), cubic-bezier(0.16, 1, 0.3, 1), registered
  // as a GSAP ease so JS and CSS motion share one curve. It used to be
  // approximated with power3.out, a visibly softer cubic.
  CustomEase.create("site", "0.16,1,0.3,1");

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

/* ------------------------------------------------------------------ */
/* Motion tokens (change round 9): one vocabulary for every reveal.     */
/*                                                                      */
/* They mirror the CSS tokens in globals.css: EASE is the same curve as  */
/* `--ease`; DUR_FAST, DUR and DUR_SLOW are `--dur` (320ms), `--dur-slow`*/
/* (560ms) and the longer beat the heroes and photo masks use. Every     */
/* once-only scroll reveal starts at the same line, so the parts of one  */
/* section arrive together instead of at five different scroll positions.*/
/* ------------------------------------------------------------------ */

/** The site ease: cubic-bezier(0.16, 1, 0.3, 1), the CSS `--ease`. */
export const EASE = "site";
/** Masks and photo settles: a sharper expo-out, as the heroes already use. */
export const EASE_MASK = "expo.out";
export const DUR_FAST = 0.32;
export const DUR = 0.56;
export const DUR_SLOW = 0.8;

export const REVEAL = {
  /** Content reveals (headings, leads, rows, items) from 768px up. */
  start: "top 85%",
  /** A phone viewport is short, so content fires a touch later. */
  startMobile: "top 90%",
  /** Full-bleed bands (the curtain wipe, the drench band). */
  band: "top 80%",
  /** The "already on screen at mount" guard: an element whose top sits above
   *  this share of the viewport neither hides nor replays. */
  seen: 0.9,
  durMobile: 0.46,
  /** Word rises (SplitText) in section headings. */
  words: 0.7,
  wordStagger: 0.045,
  staggerMobile: 0.07,
} as const;

/** One rise distance for every "arrives from below" reveal, in px. */
export const RISE = 22;
/** One stagger between the children of a group. */
export const STAGGER = 0.08;

/** True when the element is on screen (or above the fold) at mount, so a
 *  reveal must leave it visible: the server paint already showed it, and
 *  hiding it now would flash. One rule for every primitive. */
export function onScreenAtMount(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * REVEAL.seen && rect.bottom > 0;
}
