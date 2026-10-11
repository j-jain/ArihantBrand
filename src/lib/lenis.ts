"use client";

import type Lenis from "lenis";

/* One handle on the page's Lenis instance (change round 10), so components
 * that must hold or move the scroll can do it through the smoothing layer
 * when it runs and natively when it does not (reduced motion, touch, phones,
 * where SmoothScroll never mounts one). SmoothScroll sets it; nothing else
 * constructs a Lenis. */

let current: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  current = lenis;
}

export function getLenis(): Lenis | null {
  return current;
}

/** Scroll the page to a document y. Through Lenis when it runs (one curve
 *  with the wheel), else the browser's own smooth scroll. */
export function scrollToY(top: number, opts: { immediate?: boolean } = {}): void {
  if (current) {
    current.scrollTo(top, { immediate: opts.immediate ?? false });
    return;
  }
  window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
}

/** Hold the page still while a dialog or sheet is open (Lenis keeps
 *  listening to the wheel otherwise and scrolls the page under it). */
export function holdScroll(): void {
  current?.stop();
}

export function releaseScroll(): void {
  current?.start();
}
