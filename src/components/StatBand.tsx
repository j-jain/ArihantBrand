"use client";

import type { CSSProperties } from "react";
import type { Stat } from "@/content/types";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "./cn";
import { CountUp } from "./CountUp";

interface StatBandProps {
  stats: Stat[];
  onDark?: boolean;
  /** Hero variant: one row at every width, smaller figures, no left padding on
   *  the first cell so the numbers line up under the headline. */
  compact?: boolean;
}

/** Horizontal stat band with hairline separators. Counts up once on first
 *  in-view; static when reduced motion is set. Final value is always in the
 *  DOM so the band reserves its space (no CLS). */
export function StatBand({ stats, onDark = false, compact = false }: StatBandProps) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>("-60px");
  const reduce = usePrefersReducedMotion();
  const run = inView && !reduce;

  return (
    <div
      ref={ref}
      className={cn("stat-band", compact && "stat-band--compact")}
      style={{ "--stat-count": stats.length } as CSSProperties}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="stat-item">
          <p className={cn("t-stat", onDark ? "text-on-charcoal" : "text-ink")}>
            <span className="stat-figure">
              <CountUp
                value={stat.value}
                hasSuffix={Boolean(stat.suffix)}
                run={run}
              />
              {stat.suffix ? (
                <span className="stat-suffix">{stat.suffix}</span>
              ) : null}
            </span>
          </p>
          <p
            className={cn(
              "t-small mt-2",
              onDark ? "text-on-charcoal-soft" : "text-ink-soft",
            )}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
