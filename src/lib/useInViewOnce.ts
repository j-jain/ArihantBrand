"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Flip to true the first time the element enters the viewport, then stop
 *  observing. Used by count-ups and lightweight reveals that must not re-run.
 *  Falls back to visible immediately where IntersectionObserver is unavailable. */
export function useInViewOnce<T extends Element = HTMLDivElement>(
  rootMargin = "-60px",
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    // Without IntersectionObserver (very old browsers), skip the observer and
    // leave inView false; consumers degrade gracefully to their static state.
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}
