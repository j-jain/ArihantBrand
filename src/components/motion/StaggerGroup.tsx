"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, DUR, EASE } from "@/lib/gsap";

type GroupTag = "div" | "ul" | "ol" | "section";
type FromDir = "up" | "left" | "right" | "scale";

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  as?: GroupTag;
  /** Direction the direct children enter from (desktop). Vary per section so the
   *  page never reads as one fade-up repeated. */
  from?: FromDir;
  stagger?: number;
  start?: string;
}

function directionVars(from: FromDir) {
  switch (from) {
    case "left":
      return { autoAlpha: 0, x: -34 };
    case "right":
      return { autoAlpha: 0, x: 34 };
    case "scale":
      return { autoAlpha: 0, scale: 0.94, y: 14 };
    default:
      return { autoAlpha: 0, y: 30 };
  }
}

/** Reveals its direct children in a staggered sequence when the group scrolls
 *  into view. Direction is configurable so different sections animate
 *  differently. Never strands content: children already on screen at mount stay
 *  visible; reduced-motion is a no-op; mobile uses a short uniform fade. */
export function StaggerGroup({
  children,
  className,
  as = "div",
  from = "up",
  stagger = 0.1,
  start = "top 82%",
}: StaggerGroupProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>(root.children);
      if (!items.length) return;

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

          const rect = root.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) return;

          gsap.from(items, {
            ...(mobile ? { autoAlpha: 0, y: 14 } : directionVars(from)),
            duration: mobile ? 0.42 : DUR,
            ease: EASE,
            stagger: mobile ? 0.06 : stagger,
            scrollTrigger: { trigger: root, start, once: true },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [from, stagger, start] },
  );

  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
