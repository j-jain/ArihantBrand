"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, EASE } from "@/lib/gsap";

interface HeroIntroProps {
  children: ReactNode;
  className?: string;
}

/** Hero headline choreography. On desktop it splits the `[data-hero-title]`
 *  element into lines (after webfonts settle, so breaks are correct) and rises
 *  them out of a mask, while every `[data-hero-reveal]` element (lead, CTAs,
 *  media, trade nav) rises in on its own self-completing tween. Mobile does one
 *  short quiet fade with no SplitText (perf); reduced-motion leaves everything
 *  visible.
 *
 *  The reveal tweens are `gsap.from()` created synchronously, so they always
 *  settle to the visible state even if the async font split never runs — the
 *  hero can never be stranded hidden. */
export function HeroIntro({ children, className }: HeroIntroProps) {
  const ref = useRef<HTMLDivElement>(null);

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

          // Mobile: fade the title as one block (no SplitText, for perf).
          if (mobile) {
            if (title) {
              gsap.from(title, {
                autoAlpha: 0,
                y: 14,
                duration: 0.5,
                ease: EASE,
              });
            }
            return;
          }

          // Desktop: mask-and-rise the split title once webfonts settle. The
          // title is set visible before splitting, so a split failure still
          // leaves a readable headline.
          if (!title) return;
          let split: SplitText | null = null;
          const runSplit = () => {
            if (!title.isConnected) return;
            try {
              split = SplitText.create(title, {
                type: "lines",
                mask: "lines",
                linesClass: "hero-line",
                aria: "auto",
              });
              gsap.from(split.lines, {
                yPercent: 118,
                duration: 0.9,
                stagger: 0.12,
                ease: EASE,
              });
            } catch {
              /* headline stays visible and unsplit */
            }
          };
          if (document.fonts?.status === "loaded") runSplit();
          else document.fonts.ready.then(runSplit);

          return () => split?.revert();
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
