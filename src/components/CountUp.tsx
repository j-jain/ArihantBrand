"use client";

import { useEffect, useRef } from "react";

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
 *  stat bands and, since change round 9, the home hero's figures. The count
 *  writes the text node directly (change round 10): a React render per frame
 *  was the one thing on the page re-rendering sixty times a second. */
export function CountUp({
  value,
  hasSuffix,
  run,
}: {
  value: number;
  hasSuffix: boolean;
  run: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!run || startedRef.current || !el) return;
    startedRef.current = true;
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    el.textContent = formatBody(0, hasSuffix);
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out-quart
      // Settle back to the canonical formatted final on the last frame.
      el.textContent = formatBody(t < 1 ? Math.round(value * eased) : value, hasSuffix);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = formatBody(value, hasSuffix);
    };
  }, [run, value, hasSuffix]);

  return <span ref={ref}>{formatBody(value, hasSuffix)}</span>;
}
