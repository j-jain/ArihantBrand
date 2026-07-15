"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, DUR, EASE } from "@/lib/gsap";
import { cn } from "../cn";

interface DrenchBandProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Full-bleed vermillion closing band (the single drenched red on a page). Uses
 *  --vermillion-drench, which equals --vermillion-deep, so it matches every CTA
 *  button exactly. Children marked `[data-drench-reveal]` rise in on scroll; the
 *  band is fully legible with no motion. White text clears 4.5:1 on the ground. */
export function DrenchBand({ children, className, id }: DrenchBandProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-drench-reveal]",
        root,
      );
      if (!reveals.length) return;

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

          gsap.from(reveals, {
            autoAlpha: 0,
            y: mobile ? 14 : 26,
            duration: mobile ? 0.45 : DUR,
            ease: EASE,
            stagger: 0.1,
            scrollTrigger: { trigger: root, start: "top 80%", once: true },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id={id} className={cn("drench-band", className)}>
      {children}
    </section>
  );
}
