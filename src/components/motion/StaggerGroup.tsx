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
  /** Mobile (<=767px) only: reveal each row with a left-to-right wipe so the
   *  hairline rules appear to be ruled in, one after another. Used on the
   *  ledger-shaped lists (stat rails, systems, SIS scope, team, steps) that
   *  carry this site's trade-book identity. Desktop is unaffected. */
  mLedger?: boolean;
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

/** Mobile counterpart: the same direction, roughly half the travel, so a group
 *  still reads as "these arrived from the left" without the swing feeling
 *  cartoonish at phone scale. */
function mobileDirectionVars(from: FromDir) {
  switch (from) {
    case "left":
      return { autoAlpha: 0, x: -18 };
    case "right":
      return { autoAlpha: 0, x: 18 };
    case "scale":
      return { autoAlpha: 0, scale: 0.96, y: 10 };
    default:
      return { autoAlpha: 0, y: 18 };
  }
}

/** Inside a horizontal snap rail, translating children grows the scrollable
 *  overflow area and makes the rail twitch mid-reveal. Scale only ever shrinks
 *  a box, so it is safe there; opacity always is. */
const RAIL_VARS = { autoAlpha: 0, scale: 0.96 } as const;

/** Reveals its direct children in a staggered sequence when the group scrolls
 *  into view. Direction is configurable so different sections animate
 *  differently. Never strands content: children already on screen at mount stay
 *  visible; reduced-motion is a no-op; mobile keeps the direction at about half
 *  the travel, and falls back to scale + opacity inside a snap rail. */
export function StaggerGroup({
  children,
  className,
  as = "div",
  from = "up",
  stagger = 0.1,
  start = "top 82%",
  mLedger = false,
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

          // `.m-rail` only becomes a scroll container inside the mobile media
          // query, so the class is inert on desktop and this branch is too.
          const isRail = mobile && root.classList.contains("m-rail");

          // Ledger wipe: each row is ruled in from the left, hairline and all.
          // One property on one element, so it stays cheap on a handset.
          if (mobile && mLedger && !isRail) {
            gsap.fromTo(
              items,
              { clipPath: "inset(0 100% 0 0)", autoAlpha: 0 },
              {
                clipPath: "inset(0 0% 0 0)",
                autoAlpha: 1,
                duration: 0.5,
                ease: EASE,
                stagger: 0.08,
                scrollTrigger: { trigger: root, start: "top 90%", once: true },
                // A resting inset(0) still clips to the border box and would
                // slice focus rings off any control flush with a row edge.
                onComplete: () =>
                  gsap.set(items, { clearProps: "clipPath" }),
              },
            );
            return;
          }

          gsap.from(items, {
            ...(isRail
              ? RAIL_VARS
              : mobile
                ? mobileDirectionVars(from)
                : directionVars(from)),
            duration: mobile ? 0.46 : DUR,
            ease: EASE,
            stagger: mobile ? 0.07 : stagger,
            scrollTrigger: {
              trigger: root,
              start: mobile ? "top 90%" : start,
              once: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [from, stagger, start, mLedger] },
  );

  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
