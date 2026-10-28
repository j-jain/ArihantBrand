"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { springCurve, springPath } from "./spring";

/* Springs (change round 10): sampled damped oscillators (lib/spring), the
 * one material for anything that lands, hangs or follows. The curves are
 * pure arithmetic, so their durations are known on the server too; the
 * eases themselves are registered in the client-only block below. Replaces
 * every back.out / elastic.out and the springy cubic-beziers the CSS kept. */
const SPRING_CURVE = springCurve({ zeta: 0.62, omega: 12.4 }); // lands: one small overshoot, ~0.93s
const SPRING_SOFT_CURVE = springCurve({ zeta: 0.8, omega: 14.4 }); // follows: barely overshoots, ~0.64s
/** The hung-tag spring's own numbers, for motion that runs the same physics
 *  frame by frame instead of as a tween (the home swing tags' sway). */
export const HANG = { zeta: 0.32, omega: 19.6 } as const;
const SPRING_HANG_CURVE = springCurve(HANG); // a hung tag: three decaying swings, ~1.1s

/* Central GSAP hub. Every animated component imports gsap / ScrollTrigger /
 * SplitText / useGSAP from THIS module, so plugins are registered exactly once
 * and never touched during SSR. All GSAP plugins are free (Webflow acquisition),
 * so SplitText needs no auth token. */
if (typeof window !== "undefined") {
  // Flip (change round 6): the /brands index re-flows its names as a search
  // narrows them. CustomEase (change round 9): the one site ease, below.
  // MotionPath (change round 10): the drawn set pieces fly their tags, slips
  // and cartons along real paths instead of straight lines.
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, MotionPathPlugin, useGSAP);
  // Mobile browsers fire resize when the URL bar shows/hides; ignoring it stops
  // needless ScrollTrigger refreshes (a common source of scroll jank).
  // limitCallbacks (change round 10): a trigger's enter/leave callbacks fire
  // only when its own scroll state changes, not on every scroll event.
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

  // The CSS `--ease` (globals.css), cubic-bezier(0.16, 1, 0.3, 1), registered
  // as a GSAP ease so JS and CSS motion share one curve. It used to be
  // approximated with power3.out, a visibly softer cubic.
  CustomEase.create("site", "0.16,1,0.3,1");
  // The house springs, the same curves globals.css carries as `linear()`.
  CustomEase.create("spring", springPath(SPRING_CURVE));
  CustomEase.create("spring-soft", springPath(SPRING_SOFT_CURVE));
  CustomEase.create("spring-hang", springPath(SPRING_HANG_CURVE));

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
/* `--ease`; DUR_FAST is `--dur-fast` (180ms, the micro-feedback beat),  */
/* DUR_UI is `--dur` (320ms, UI state changes), DUR is `--dur-slow`      */
/* (560ms, reveals) and DUR_SLOW the longer beat the heroes and photo    */
/* masks use. Every once-only scroll reveal starts at the same line, so  */
/* the parts of one section arrive together instead of at five different */
/* scroll positions.                                                     */
/* ------------------------------------------------------------------ */

/** The site ease: cubic-bezier(0.16, 1, 0.3, 1), the CSS `--ease`. */
export const EASE = "site";
/** Masks and photo settles: a sharper expo-out, as the heroes already use. */
export const EASE_MASK = "expo.out";
export const DUR_FAST = 0.18;
export const DUR_UI = 0.32;
export const DUR = 0.56;
export const DUR_SLOW = 0.8;

/** The house springs (change round 10): pass `{ ease, duration }` straight
 *  into a tween, so the motion takes the spring's own settle time. SPRING
 *  for what lands (a pin, a card dealt, a tag turned), SPRING_SOFT for what
 *  follows (a frame returning under the pointer, a panel growing), and
 *  SPRING_HANG for what is hung and swings to rest. */
export const SPRING = { ease: "spring", duration: SPRING_CURVE.duration } as const;
export const SPRING_SOFT = { ease: "spring-soft", duration: SPRING_SOFT_CURVE.duration } as const;
export const SPRING_HANG = { ease: "spring-hang", duration: SPRING_HANG_CURVE.duration } as const;

/** Promote the targets to their own compositor layer for the life of a tween
 *  or timeline (will-change: transform) and drop the hint when it finishes,
 *  so a page never holds layers it is not moving. Chains onto any callbacks
 *  the animation already has. */
export function withWillChange<T extends gsap.core.Animation>(
  targets: gsap.TweenTarget,
  anim: T,
  prop = "transform",
): T {
  const chain = (name: "onStart" | "onComplete" | "onReverseComplete", fn: () => void) => {
    const prev = anim.eventCallback(name) as (() => void) | null;
    anim.eventCallback(name, () => {
      fn();
      prev?.();
    });
  };
  chain("onStart", () => gsap.set(targets, { willChange: prop }));
  chain("onComplete", () => gsap.set(targets, { clearProps: "willChange" }));
  chain("onReverseComplete", () => gsap.set(targets, { clearProps: "willChange" }));
  return anim;
}

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
