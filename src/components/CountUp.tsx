"use client";

import { useEffect, useRef, useState } from "react";

/** Format a stat's numeric body en-IN. Four-digit bare numbers in a plausible
 *  year range are left ungrouped ("2013", not "2,013"); everything else groups
 *  (24,000). A suffix is rendered by the caller so it can be scaled down. */
export function formatBody(n: number, hasSuffix: boolean): string {
  const isYear = !hasSuffix && Number.isInteger(n) && n >= 1900 && n <= 2999;
  return isYear ? String(n) : new Intl.NumberFormat("en-IN").format(n);
}

/** A figure that counts up from zero once `run` turns true (900ms, ease-out
 *  quart, requestAnimationFrame). The final value is what the server renders
 *  and what it settles back to, so the figure is always right with no JS and
 *  under reduced motion (the caller simply never sets `run`). Shared by the
 *  stat bands and, since change round 9, the home hero's figures. */
export function CountUp({
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
