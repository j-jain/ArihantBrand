"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Stat } from "@/content/types";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "./cn";

interface StatBandProps {
  stats: Stat[];
  onDark?: boolean;
}

/** Format a stat's numeric body en-IN. Four-digit bare numbers in a plausible
 *  year range are left ungrouped ("2013", not "2,013"); everything else groups
 *  (24,000). The suffix is rendered separately so it can be scaled down. */
function formatBody(n: number, hasSuffix: boolean): string {
  const isYear = !hasSuffix && Number.isInteger(n) && n >= 1900 && n <= 2999;
  return isYear ? String(n) : new Intl.NumberFormat("en-IN").format(n);
}

function CountUp({
  value,
  hasSuffix,
  run,
}: {
  value: number;
  hasSuffix: boolean;
  run: boolean;
}) {
  // null → render the final value (SSR + no-JS + reduced motion are safe).
  const [n, setN] = useState<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!run || startedRef.current) return;
    startedRef.current = true;
    setN(0);
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out-quart
      if (t < 1) {
        setN(Math.round(value * eased));
        raf = requestAnimationFrame(tick);
      } else {
        setN(null); // settle back to the canonical formatted final
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);

  return <>{formatBody(n ?? value, hasSuffix)}</>;
}

/** Horizontal stat band with hairline separators. Counts up once on first
 *  in-view; static when reduced motion is set. Final value is always in the
 *  DOM so the band reserves its space (no CLS). */
export function StatBand({ stats, onDark = false }: StatBandProps) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>("-60px");
  const reduce = usePrefersReducedMotion();
  const run = inView && !reduce;

  return (
    <div
      ref={ref}
      className="stat-band"
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
