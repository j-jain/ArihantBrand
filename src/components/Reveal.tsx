"use client";

import {
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap, useGSAP, DUR, EASE } from "@/lib/gsap";

type RevealTag =
  | "div"
  | "section"
  | "article"
  | "li"
  | "span"
  | "ul"
  | "p";
type RevealVariant = "rise" | "fade" | "clip";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  as?: RevealTag;
  className?: string;
  style?: CSSProperties;
  /** Motion flavour. Mobile runs its own shorter, shallower version of each
   *  variant rather than collapsing all three into one fade. */
  variant?: RevealVariant;
}

/** Scroll-reveal primitive. Renders fully visible on the server and first paint;
 *  the hidden→visible state is applied only after mount (in a layout effect,
 *  before paint) and only to elements below the fold, so content is never
 *  stranded, above-fold content never flashes, and reduced-motion users see it
 *  static. Public API is unchanged from the previous motion version; `variant`
 *  is additive. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  as = "div",
  className,
  style,
  variant = "rise",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
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
          if (reduced) return; // leave fully visible

          // Skip anything already on screen at mount so it neither flashes nor
          // hides after the server paint; only below-fold elements animate in.
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) return;

          // Mobile triggers a touch later: a phone viewport is short, so
          // "top 88%" fires while the block is still well below the thumb.
          const st = {
            trigger: el,
            start: mobile ? "top 92%" : "top 88%",
            once: true,
          } as const;

          // On a phone the three variants used to collapse into one identical
          // fade, which is most of why the old build read as a scaled-down
          // desktop: sixty sections, one move. They stay three distinct moves
          // here, just shorter and shallower than their desktop counterparts.
          if (mobile) {
            if (variant === "clip") {
              // Wipe up from the bottom edge — used on imagery and quotes.
              gsap.fromTo(
                el,
                { autoAlpha: 0, clipPath: "inset(0 0 42% 0)", y: 14 },
                {
                  autoAlpha: 1,
                  clipPath: "inset(0 0 0% 0)",
                  y: 0,
                  duration: 0.55,
                  delay,
                  ease: EASE,
                  scrollTrigger: st,
                  // A resting inset(0) still clips to the border box and would
                  // slice focus rings off edge-flush children. Drop it.
                  onComplete: () => gsap.set(el, { clearProps: "clipPath" }),
                },
              );
            } else if (variant === "fade") {
              // The quiet one: opacity only, for headings that shouldn't move.
              gsap.from(el, {
                autoAlpha: 0,
                duration: 0.45,
                delay,
                ease: EASE,
                scrollTrigger: st,
              });
            } else {
              // Rise, with a whisper of scale so it reads as approaching
              // rather than sliding.
              gsap.from(el, {
                autoAlpha: 0,
                y: 22,
                scale: 0.985,
                duration: 0.5,
                delay,
                ease: EASE,
                scrollTrigger: st,
              });
            }
            return;
          }

          if (variant === "fade") {
            gsap.from(el, {
              autoAlpha: 0,
              y: 0,
              duration: DUR,
              delay,
              ease: EASE,
              scrollTrigger: st,
            });
          } else if (variant === "clip") {
            gsap.fromTo(
              el,
              { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", y: 20 },
              {
                autoAlpha: 1,
                clipPath: "inset(0 0 0% 0)",
                y: 0,
                duration: DUR,
                delay,
                ease: EASE,
                scrollTrigger: st,
                // `inset(0)` still clips to the border box, so a lingering
                // clip-path slices focus rings (outline-offset) off any child
                // that sits flush against this wrapper's edge. Drop it once the
                // wipe is done.
                onComplete: () => gsap.set(el, { clearProps: "clipPath" }),
              },
            );
          } else {
            gsap.from(el, {
              autoAlpha: 0,
              y,
              duration: DUR,
              delay,
              ease: EASE,
              scrollTrigger: st,
            });
          }
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [variant, delay, y] },
  );

  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
