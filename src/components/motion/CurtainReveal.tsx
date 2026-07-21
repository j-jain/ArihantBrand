"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, EASE } from "@/lib/gsap";

interface CurtainRevealProps {
  children: ReactNode;
  className?: string;
}

/** Wraps a band and reveals it once with a top-to-bottom clip wipe when it
 *  scrolls into view (desktop). Mobile does a short whole-block fade; reduced
 *  motion leaves it visible and static. The clipped (hidden) start state is
 *  applied only from JS, so the band is never stranded if scripts don't run. */
export function CurtainReveal({ children, className }: CurtainRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

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

          // Skip anything already on screen at mount so it neither flashes nor
          // hides after the server paint.
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) return;

          if (mobile) {
            gsap.from(el, {
              autoAlpha: 0,
              y: 14,
              duration: 0.45,
              ease: EASE,
              scrollTrigger: { trigger: el, start: "top 80%", once: true },
            });
            return;
          }

          gsap.fromTo(
            el,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.9,
              ease: EASE,
              scrollTrigger: { trigger: el, start: "top 75%", once: true },
              // `inset(0)` still clips to the border box: left in place it would
              // slice the focus rings off any control flush with the band edge.
              onComplete: () => gsap.set(el, { clearProps: "clipPath" }),
            },
          );
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
