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
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Canonical motion tokens, mirroring globals.css --ease / --dur-slow so JS and
 *  CSS motion feel identical. cubic-bezier(0.16, 1, 0.3, 1) ≈ power3.out. */
export const EASE = "power3.out";
export const DUR = 0.56;
export const DUR_SLOW = 0.8;
