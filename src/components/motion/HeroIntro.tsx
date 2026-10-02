"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, EASE, holdLagSmoothing } from "@/lib/gsap";
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

/** Longest the intro waits for webfonts before it plays anyway. next/font
 *  preloads both families, so this almost never binds. */
const FONT_WAIT_MS = 800;

/** Hero headline choreography: one orchestrated load (change round 4).
 *
 *  The hero is held hidden from the first paint by the intro gate (an inline
 *  head script in app/layout.tsx sets html[data-intro]; motion.css hides the
 *  hero under it, with a 3s failsafe). On hydration this sets every from-state
 *  synchronously, inside the layout effect, and only then lifts the gate, so
 *  the finished hero is never painted and then reset. Once webfonts settle it
 *  splits `[data-hero-title]` into lines (so breaks are correct) and plays ONE
 *  timeline: the lines rise out of their masks while every `[data-hero-reveal]`
 *  element (lead, CTAs, media, trade nav) rises in, and the pixel word rides
 *  its line. Mobile runs the same choreography quicker and shallower;
 *  reduced motion leaves everything visible.
 *
 *  If JS arrives after the failsafe has already shown the hero, the intro does
 *  not run at all: replaying a hero the reader has been looking at is exactly
 *  the flash this exists to prevent. */
export function HeroIntro({ children, className, pixelEmphasis = false }: HeroIntroProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Set on the pixel timeline's first tick, so a React StrictMode discard (a
  // run that never ticks) still lets the effect play once.
  const pixelPlayed = useRef(false);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const html = document.documentElement;
      const title = root.querySelector<HTMLElement>("[data-hero-title]");
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-hero-reveal]",
        root,
      );
      // Every path ends by lifting the pre-paint gate.
      const release = () => html.removeAttribute("data-intro");

      const probe = title ?? reveals[0];
      if (
        html.hasAttribute("data-intro") &&
        probe &&
        getComputedStyle(probe).visibility === "visible"
      ) {
        release(); // the failsafe already showed it: leave it be
        return;
      }

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
          if (reduced) {
            release();
            return;
          }

          // 1) Every from-state, synchronously, before this frame paints. A
          //    from() inside a paused timeline still renders its start state
          //    at once. The title stays hidden until it is split.
          const tl = gsap.timeline({ paused: true });
          if (reveals.length) {
            tl.from(
              reveals,
              {
                autoAlpha: 0,
                y: mobile ? 12 : 22,
                duration: mobile ? 0.5 : 0.7,
                ease: EASE,
                stagger: mobile ? 0.08 : 0.1,
              },
              mobile ? 0.05 : 0.15,
            );
          }
          if (title) gsap.set(title, { autoAlpha: 0 });
          release();

          const releaseLag = holdLagSmoothing();
          tl.eventCallback("onComplete", releaseLag);

          // 2) Once webfonts settle: split, add the rise and the pixels to the
          //    same timeline, show the title (its lines now masked), play.
          //
          //    Mobile runs the same move, tuned quicker and shallower: a phone
          //    headline breaks into 2-4 short lines, so a slow desktop cadence
          //    reads as a stall, and the mask has less distance to travel.
          const L = mobile ? { y: 106, dur: 0.62, st: 0.07 } : { y: 112, dur: 0.9, st: 0.1 };
          let split: SplitText | null = null;
          let pixels: { snap: () => void } | null = null;
          let alive = true;
          let started = false;
          let timer = 0;
          let raf = 0;
          // Wrapped in the matchMedia context, so tweens made later (after
          // fonts.ready) are still reverted with everything else.
          const start = ctx.add("start", () => {
            if (!alive || started) return;
            started = true;
            window.clearTimeout(timer);
            if (title?.isConnected) {
              // Measure and sample BEFORE splitting: SplitText clones the <em>
              // into the line and revert() rebuilds the h1's children.
              const word =
                pixelEmphasis && !pixelPlayed.current
                  ? title.querySelector<HTMLElement>("em")
                  : null;
              const prep = word
                ? preparePixelWord({ root, title, word, mobile, rise: L.y / 100 })
                : null;
              try {
                split = SplitText.create(title, {
                  type: "lines",
                  mask: "lines",
                  linesClass: "hero-line",
                  aria: "auto",
                });
                tl.from(
                  split.lines,
                  {
                    yPercent: L.y,
                    duration: L.dur,
                    stagger: L.st,
                    ease: EASE,
                    onComplete: () => {
                      // Restore the clean, unsplit headline once the reveal
                      // lands; null the ref so cleanup can't revert twice.
                      split?.revert();
                      split = null;
                    },
                  },
                  0,
                );
                if (prep) {
                  // SplitText leaves an EMPTY <em> clone ahead of the real one
                  // in the line, so test every <em>, not just the first.
                  const index = split.lines.findIndex((l) =>
                    Array.from(l.querySelectorAll("em")).some((e) => e.textContent?.trim()),
                  );
                  const run = playPixelWord(prep, {
                    line: (split.lines[Math.max(0, index)] as HTMLElement | undefined) ?? null,
                    delay: Math.max(0, index) * L.st,
                    onStart: () => {
                      pixelPlayed.current = true;
                    },
                    onDone: () => {
                      pixels = null;
                    },
                  });
                  pixels = run;
                  if (run.timeline) tl.add(run.timeline, 0);
                }
              } catch {
                /* headline stays visible and unsplit */
                pixels?.snap();
                pixels = null;
              }
              gsap.set(title, { autoAlpha: 1 });
            }
            // One frame on, so the first tick does not land inside the
            // hydration commit.
            raf = requestAnimationFrame(() => tl.play());
          }) as () => void;

          if (document.fonts?.status === "loaded") start();
          else {
            document.fonts?.ready.then(start);
            timer = window.setTimeout(start, FONT_WAIT_MS);
          }

          return () => {
            alive = false;
            window.clearTimeout(timer);
            cancelAnimationFrame(raf);
            releaseLag();
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
    <div ref={ref} className={className} data-hero-intro="">
      {children}
    </div>
  );
}
