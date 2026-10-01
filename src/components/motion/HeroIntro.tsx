"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, EASE } from "@/lib/gsap";
import { playPixelWord, preparePixelWord } from "./pixelWord";

interface HeroIntroProps {
  children: ReactNode;
  className?: string;
  /** Build the headline's emphasised word (its <em>) out of square pixels as
   *  its line rises (change round 3; the home hero only). Plays once per page
   *  load; reduced motion, forced colours or any measuring doubt leave the
   *  word as rendered. */
  pixelEmphasis?: boolean;
}

/** Hero headline choreography. It splits the `[data-hero-title]` element into
 *  lines (after webfonts settle, so breaks are correct) and rises them out of a
 *  mask, while every `[data-hero-reveal]` element (lead, CTAs, media, trade nav)
 *  rises in on its own self-completing tween. Mobile runs the same masked line
 *  rise at a quicker, shallower cadence; reduced-motion leaves everything
 *  visible.
 *
 *  The reveal tweens are `gsap.from()` created synchronously, so they always
 *  settle to the visible state even if the async font split never runs — the
 *  hero can never be stranded hidden. */
export function HeroIntro({ children, className, pixelEmphasis = false }: HeroIntroProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Set on the pixel timeline's first tick, so a React StrictMode discard (a
  // run that never ticks) still lets the effect play once.
  const pixelPlayed = useRef(false);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const title = root.querySelector<HTMLElement>("[data-hero-title]");
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-hero-reveal]",
        root,
      );

      const mm = gsap.matchMedia(ref);
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
          desktop:
            "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        },
        (ctx) => {
          const { reduced, mobile } = ctx.conditions as {
            reduced: boolean;
            mobile: boolean;
            desktop: boolean;
          };
          if (reduced) return;

          // Reveals: self-completing, synchronous — never gated on fonts.
          if (reveals.length) {
            gsap.from(reveals, {
              autoAlpha: 0,
              y: mobile ? 12 : 22,
              duration: mobile ? 0.5 : 0.7,
              ease: EASE,
              stagger: mobile ? 0.08 : 0.1,
              delay: mobile ? 0.05 : 0.15,
            });
          }

          // Mask-and-rise the split title once webfonts settle. The title is
          // set visible before splitting, so a split failure still leaves a
          // readable headline.
          //
          // Mobile runs the same move, tuned quicker and shallower: a phone
          // headline breaks into 2-4 short lines, so a slow desktop cadence
          // reads as a stall, and the mask has less distance to travel. This
          // is the one place SplitText is worth its cost on a handset — it is
          // the first thing the reader sees, and a flat block fade is exactly
          // what made the old mobile build feel like a shrunken desktop.
          if (!title) return;
          const L = mobile ? { y: 106, dur: 0.62, st: 0.07 } : { y: 112, dur: 0.9, st: 0.1 };
          let split: SplitText | null = null;
          let pixels: { snap: () => void } | null = null;
          let alive = true;
          const runSplit = () => {
            // A stale fonts.ready callback (unmount, StrictMode) no-ops.
            if (!alive || !title.isConnected) return;
            // Measure and sample BEFORE splitting: SplitText clones the <em>
            // into the line and revert() rebuilds the h1's children.
            const word =
              pixelEmphasis && !pixelPlayed.current
                ? title.querySelector<HTMLElement>("em")
                : null;
            const prep = word ? preparePixelWord({ root, title, word, mobile }) : null;
            try {
              split = SplitText.create(title, {
                type: "lines",
                mask: "lines",
                linesClass: "hero-line",
                aria: "auto",
              });
              gsap.from(split.lines, {
                yPercent: L.y,
                duration: L.dur,
                stagger: L.st,
                ease: EASE,
                onComplete: () => {
                  // Restore the clean, unsplit headline once the reveal lands;
                  // null the ref so the matchMedia cleanup can't revert twice.
                  split?.revert();
                  split = null;
                },
              });
              if (prep) {
                // The pixels land as the word's own line finishes rising.
                // SplitText leaves an EMPTY <em> clone ahead of the real one
                // in the line, so test every <em>, not just the first.
                const line = split.lines.findIndex((l) =>
                  Array.from(l.querySelectorAll("em")).some((e) => e.textContent?.trim()),
                );
                pixels = playPixelWord(prep, {
                  delay: Math.max(0, line) * L.st,
                  onStart: () => {
                    pixelPlayed.current = true;
                  },
                  onDone: () => {
                    pixels = null;
                  },
                });
              }
            } catch {
              /* headline stays visible and unsplit */
              pixels?.snap();
              pixels = null;
            }
          };
          if (document.fonts?.status === "loaded") runSplit();
          else document.fonts.ready.then(runSplit);

          return () => {
            alive = false;
            pixels?.snap();
            pixels = null;
            split?.revert();
            split = null;
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
