"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";

interface TimelineEntry {
  year: string;
  title: string;
  text: string;
}

interface TimelineProps {
  entries?: TimelineEntry[];
  /** @deprecated Legacy alias for {@link TimelineProps.entries}. */
  items?: TimelineEntry[];
}

/** Vertical company timeline. On desktop it becomes a two-column piece: a big
 *  "ghost year" watermark sits sticky on the left and crossfades to the active
 *  entry's year as you scroll, while on the right the spine draws with scroll,
 *  each dot pulses once on activation, titles rise in and a hairline rule draws
 *  under each. The enhanced layout is switched on only from JS (`.tl--enhanced`)
 *  — without scripts, and on mobile / reduced motion, it renders as a plain
 *  static list (year above title, dots visible, no sticky, no scrub), so no
 *  content is ever stranded behind an animation that did not run. */
export function Timeline({ entries, items }: TimelineProps) {
  const data = entries ?? items ?? [];
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const spine = root.querySelector<HTMLElement>(".tl__spine");
      const years = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".tl__year"),
      );
      const entryEls = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".tl__entry"),
      );
      if (!entryEls.length) return;

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

          // ----- Mobile: the spine draws with the thumb, entries ink in -------
          // The single-column list stays exactly as it renders on the server;
          // what changes is that the vertical rule now grows as you scroll it
          // and each entry arrives on its own, so the section reads as a
          // history being written rather than a block that faded in.
          if (mobile) {
            if (spine) {
              gsap.fromTo(
                spine,
                { scaleY: 0 },
                {
                  scaleY: 1,
                  ease: "none",
                  transformOrigin: "top center",
                  scrollTrigger: {
                    trigger: root,
                    start: "top 82%",
                    end: "bottom 72%",
                    scrub: true,
                  },
                },
              );
            }

            entryEls.forEach((entry) => {
              const rect = entry.getBoundingClientRect();
              if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) return;

              const dot = entry.querySelector<HTMLElement>(".tl__dot");
              const rule = entry.querySelector<HTMLElement>(".tl__rule");
              // A paused timeline played by a standalone trigger, not a
              // timeline-owned scrollTrigger: the latter measures itself only
              // a tick later, and a trigger created meanwhile (the drench band
              // below) re-measures it inside its own refresh. After a
              // client-side navigation from a scrolled page, an entry that is
              // already past its start then fires, kills itself mid-loop and
              // the refresh throws, blanking the page (mobile revamp).
              const tl = gsap.timeline({ paused: true });
              ScrollTrigger.create({
                trigger: entry,
                start: "top 88%",
                once: true,
                onEnter: () => tl.play(),
              });
              tl.from(entry, {
                autoAlpha: 0,
                y: 16,
                duration: 0.5,
                ease: EASE,
              });
              if (dot) {
                tl.fromTo(
                  dot,
                  { scale: 0.4 },
                  { scale: 1, duration: 0.42, ease: "back.out(2)" },
                  "<0.05",
                );
              }
              if (rule) {
                // The hairline draws from the spine outward — the same gesture
                // the ledgers elsewhere on mobile use.
                tl.fromTo(
                  rule,
                  { scaleX: 0 },
                  { scaleX: 1, duration: 0.5, ease: EASE },
                  "<0.08",
                );
              }
            });
            return;
          }

          // ----- Desktop: enhanced two-column choreography --------------------
          root.classList.add("tl--enhanced");

          if (spine) {
            gsap.fromTo(
              spine,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                transformOrigin: "top center",
                scrollTrigger: {
                  trigger: root,
                  start: "top 78%",
                  end: "bottom 60%",
                  scrub: true,
                },
              },
            );
          }

          // Ghost-year crossfade: only the active year is inked and visible.
          let activeYear = 0;
          if (years.length) {
            gsap.set(years, { autoAlpha: 0, y: 8 });
            gsap.set(years[0], { autoAlpha: 1, y: 0, color: "var(--ink)" });
          }
          const setActiveYear = (i: number) => {
            if (i === activeYear || !years[i]) return;
            gsap.to(years[activeYear], {
              autoAlpha: 0,
              y: -8,
              color: "var(--line)",
              duration: 0.4,
              ease: EASE,
            });
            gsap.to(years[i], {
              autoAlpha: 1,
              y: 0,
              color: "var(--ink)",
              duration: 0.4,
              ease: EASE,
            });
            activeYear = i;
          };

          entryEls.forEach((entry, i) => {
            const dot = entry.querySelector<HTMLElement>(".tl__dot");
            const title = entry.querySelector<HTMLElement>(".tl__title");
            const rule = entry.querySelector<HTMLElement>(".tl__rule");
            const rect = entry.getBoundingClientRect();
            const onScreen =
              rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

            // First-in reveal (skip if already visible at mount).
            if (!onScreen) {
              const tl = gsap.timeline({
                scrollTrigger: { trigger: entry, start: "top 82%", once: true },
              });
              if (title) {
                tl.from(title, {
                  autoAlpha: 0,
                  y: 18,
                  duration: 0.55,
                  ease: EASE,
                });
              }
              if (dot) {
                tl.fromTo(
                  dot,
                  { scale: 1 },
                  { scale: 1.35, duration: 0.28, ease: EASE, yoyo: true, repeat: 1 },
                  "<",
                );
              }
              if (rule) {
                tl.fromTo(
                  rule,
                  { scaleX: 0 },
                  { scaleX: 1, duration: 0.5, ease: EASE, transformOrigin: "left center" },
                  "<0.1",
                );
              }
            }

            // Drive the ghost year as each entry passes the reading line.
            ScrollTrigger.create({
              trigger: entry,
              start: "top 55%",
              end: "bottom 55%",
              onToggle: (self) => {
                if (self.isActive) setActiveYear(i);
              },
            });
          });

          return () => {
            root.classList.remove("tl--enhanced");
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [data] },
  );

  return (
    <div ref={ref} className="tl">
      <div className="tl__years" aria-hidden="true">
        {data.map((entry, i) => (
          <span key={`year-${entry.year}-${i}`} className="tl__year">
            {entry.year}
          </span>
        ))}
      </div>
      <ol className="tl__list">
        <span className="tl__spine" aria-hidden="true" />
        {data.map((entry, i) => (
          <li key={`${entry.year}-${i}`} className="tl__entry">
            <span className="tl__dot" aria-hidden="true" />
            <p className="tl__entry-year">{entry.year}</p>
            <h3 className="t-h4 tl__title">{entry.title}</h3>
            <span className="tl__rule" aria-hidden="true" />
            <p className="t-body measure tl__text">{entry.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
