"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, DUR, EASE, REVEAL, RISE, STAGGER, onScreenAtMount } from "@/lib/gsap";
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
          // A reload at the foot of a page used to hide the band and replay
          // it (change round 9): the same guard every other reveal has.
          if (onScreenAtMount(root)) return;

          gsap.from(reveals, {
            autoAlpha: 0,
            y: mobile ? RISE / 2 : RISE,
            duration: mobile ? REVEAL.durMobile : DUR,
            ease: EASE,
            stagger: STAGGER,
            scrollTrigger: { trigger: root, start: REVEAL.band, once: true, fastScrollEnd: true },
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
