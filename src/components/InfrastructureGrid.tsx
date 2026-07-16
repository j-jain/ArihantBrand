"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";
import { cn } from "./cn";

interface SystemRow {
  title: string;
  text: string;
}

interface InfrastructureGridProps {
  systems: SystemRow[];
  /** Column-placement / layout classes from the parent grid split. */
  className?: string;
}

/** The four "systems" as a hairline-separated ledger list for {@link
 *  InfrastructureSection}. Every row pairs a small vermillion node square, held
 *  in a shared left rail, with a title and body line. On desktop (non-reduced
 *  motion) each node pulses once as its row enters; mobile and reduced motion
 *  render the plain static list, so nothing is stranded behind an animation
 *  that did not run. */
export function InfrastructureGrid({
  systems,
  className,
}: InfrastructureGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const nodes = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".infra__node"),
      );
      if (!nodes.length) return;

      const mm = gsap.matchMedia(ref);
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        () => {
          const pulseTriggers = nodes.map((node) =>
            ScrollTrigger.create({
              trigger: node,
              start: "top 82%",
              once: true,
              onEnter: () =>
                gsap.fromTo(
                  node,
                  { scale: 1 },
                  {
                    scale: 1.45,
                    duration: 0.3,
                    ease: EASE,
                    yoyo: true,
                    repeat: 1,
                    transformOrigin: "50% 50%",
                  },
                ),
            }),
          );

          return () => {
            pulseTriggers.forEach((t) => t.kill());
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [systems] },
  );

  return (
    <div ref={ref} className={cn("infra", className)}>
      <ol className="infra__rows">
        {systems.map((row, index) => (
          <li
            key={row.title}
            className={cn(
              "grid grid-cols-[auto_1fr] gap-x-4 border-t border-line-dark py-6",
              index === systems.length - 1 && "border-b border-line-dark",
            )}
          >
            <span className="infra__node" aria-hidden="true" />
            <div>
              <h3 className="t-h4 infra__title">{row.title}</h3>
              <p className="t-body infra__text">{row.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
