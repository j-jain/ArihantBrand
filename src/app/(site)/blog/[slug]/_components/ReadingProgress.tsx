"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** A hairline progress rule for the article body, shown on phones only.
 *
 *  A long read is the one place a phone reader genuinely loses their bearings:
 *  there is no scrollbar, and the page is many screens tall. The rule measures
 *  the article body specifically, not the document, so it reads 100% when the
 *  prose ends rather than when the footer does.
 *
 *  Purely informational and purely additive: it is `md:hidden`, carries
 *  `aria-hidden`, and is set from JS only, so it can never obscure or gate any
 *  content. It scrubs to scroll position with no tween, which is both exact and
 *  free of easing that would lag the thumb. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bar = ref.current;
      if (!bar) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      const mm = gsap.matchMedia();
      mm.add("(max-width: 767px)", () => {
        gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
        const st = ScrollTrigger.create({
          trigger: target,
          start: "top 60%",
          end: "bottom bottom",
          onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
        });
        return () => {
          st.kill();
          gsap.set(bar, { clearProps: "transform" });
        };
      });

      return () => mm.revert();
    },
    { dependencies: [targetId] },
  );

  return (
    <div className="reading-progress md:hidden" aria-hidden="true">
      <div ref={ref} className="reading-progress__bar" />
    </div>
  );
}
