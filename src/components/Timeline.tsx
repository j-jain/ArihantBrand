"use client";

import { useRef } from "react";
import { gsap, useGSAP, DUR, EASE } from "@/lib/gsap";

interface TimelineItem {
  year: string;
  title: string;
  text: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

/** Vertical timeline: a hairline spine, vermillion condensed year markers, and
 *  generous vertical rhythm. On desktop the spine draws in scrubbed to scroll
 *  and the entries rise in on a stagger. Reduced-motion and mobile leave the
 *  spine and every entry fully visible with no motion, so content is never
 *  stranded behind an un-triggered animation. */
export function Timeline({ items }: TimelineProps) {
  const ref = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const ol = ref.current;
      if (!ol) return;
      const spine = ol.querySelector<HTMLElement>(".timeline__spine");
      const entries = gsap.utils.toArray<HTMLElement>(
        ol.querySelectorAll(":scope > li"),
      );

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

          // Spine grows as the timeline scrolls through (desktop only — mobile
          // keeps it static for perf and to avoid scrub jank).
          if (!mobile && spine) {
            gsap.fromTo(
              spine,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                transformOrigin: "top center",
                scrollTrigger: {
                  trigger: ol,
                  start: "top 82%",
                  end: "bottom 65%",
                  scrub: true,
                },
              },
            );
          }

          // Entries rise in once; skip if already on screen at mount so nothing
          // flashes or hides after the server paint.
          const rect = ol.getBoundingClientRect();
          const onScreen =
            rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
          if (!onScreen && entries.length) {
            gsap.from(entries, {
              autoAlpha: 0,
              y: mobile ? 14 : 26,
              duration: mobile ? 0.42 : DUR,
              ease: EASE,
              stagger: mobile ? 0.08 : 0.12,
              scrollTrigger: { trigger: ol, start: "top 80%", once: true },
            });
          }
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <ol ref={ref} className="timeline pl-8">
      <span className="timeline__spine" aria-hidden="true" />
      {items.map((item) => (
        <li key={item.year} className="relative pb-12 last:pb-0">
          <span
            className="absolute -left-8 top-[0.5rem] block h-2.5 w-2.5 -translate-x-1/2 rounded-sm bg-vermillion-deep"
            aria-hidden="true"
          />
          <p
            className="font-sans text-vermillion-deep"
            style={{
              fontWeight: 800,
              fontStretch: "85%",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.02em",
              fontSize: "1.15rem",
            }}
          >
            {item.year}
          </p>
          <h3 className="t-h4 mt-1 text-ink">{item.title}</h3>
          <p className="t-body measure mt-2 text-ink-soft">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}
