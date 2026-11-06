"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { buildWhenNear, pauseOffscreen, whenNear } from "@/lib/offscreen";

/** The footer map's motion, split from NetworkMap in the performance pass so
 *  the drawing itself is server markup (nothing of it is hydrated, and the
 *  dot data never ships to the browser). This wrapper draws no box of its own
 *  (display: contents) and only animates the svg it is handed.
 *
 *  Desktop: the slow reach loop, built only when the footer comes near (the
 *  MotionPath plugin its sparks ride on loads then, not with every page) and
 *  paused whenever the footer is off screen. Phones: the reach draws once as
 *  the footer comes into view, then rests inked in. Reduced motion: nothing. */
export function NetworkMapMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const svg = ref.current?.querySelector<SVGSVGElement>(".nm-svg");
      if (!svg) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        let ctx: gsap.Context | null = null;
        let stopPause = () => {};
        let alive = true;
        const cancel = whenNear(svg, () => {
          void import("gsap/MotionPathPlugin").then(({ MotionPathPlugin }) => {
            if (!alive) return;
            gsap.registerPlugin(MotionPathPlugin);
            ctx = gsap.context(() => {
              const tl = buildLoop(svg);
              if (tl) stopPause = pauseOffscreen(svg, tl);
            });
          });
        });
        return () => {
          alive = false;
          cancel();
          stopPause();
          ctx?.revert();
        };
      });

      // Mobile: the reach draws ONCE when the footer comes into view, then
      // rests inked in. A perpetual loop at the very bottom of every page is a
      // battery tax on a handset for an effect nobody is still watching, but a
      // dead map is the wrong last impression too — so it plays exactly once
      // and stops. The rest state matches the CSS default (opacity 0.35), so
      // nothing depends on this having run.
      mm.add("(prefers-reduced-motion: no-preference) and (max-width: 767px)", () =>
        buildWhenNear(svg, () => {
          const arcs = gsap.utils.toArray<SVGPathElement>(svg.querySelectorAll(".nm-arc"));
          if (!arcs.length) return;

          const tl = gsap.timeline({ paused: true });
          arcs.forEach((arc, i) => {
            const len = arc.getTotalLength();
            gsap.set(arc, {
              strokeDasharray: len,
              strokeDashoffset: len,
              opacity: 0.35,
            });
            tl.to(
              arc,
              {
                strokeDashoffset: 0,
                opacity: 0.7,
                duration: 1.1,
                ease: "power2.inOut",
              },
              i * 0.16,
            );
          });

          const io = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                tl.play();
                io.disconnect();
              }
            },
            { threshold: 0.25 },
          );
          io.observe(svg);
          return () => io.disconnect();
        }),
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}

/** The desktop reach loop: each arc draws hub -> city with a spark riding its
 *  head, the city's node pulses, the arc holds and retracts. Returned paused;
 *  pauseOffscreen plays it while the footer is on screen. */
function buildLoop(svg: SVGSVGElement): gsap.core.Timeline | null {
  const arcs = gsap.utils.toArray<SVGPathElement>(svg.querySelectorAll(".nm-arc"));
  const nodes = gsap.utils.toArray<SVGRectElement>(svg.querySelectorAll(".nm-node"));
  const sparks = gsap.utils.toArray<SVGCircleElement>(svg.querySelectorAll(".nm-spark"));
  if (!arcs.length) return null;

  // The spark is lit for the first 10% of the 1.5s draw and put out
  // over the last 15%, so it is gone before the node pulses.
  const SPARK_IN = 0.15;
  const SPARK_OUT = 0.225;

  const tl = gsap.timeline({ repeat: -1, paused: true });

  arcs.forEach((arc, i) => {
    const len = arc.getTotalLength();
    const start = i * 0.9;

    // Hidden start state, set from JS only (never CSS): dash the stroke
    // to its own length and offset it fully so it can draw in.
    gsap.set(arc, {
      strokeDasharray: len,
      strokeDashoffset: len,
      opacity: 0.35,
    });

    // Draw hub -> city while rising to full strength.
    tl.to(
      arc,
      {
        strokeDashoffset: 0,
        opacity: 0.85,
        duration: 1.5,
        ease: "power2.inOut",
      },
      start,
    );

    // A spark leads the draw (change round 10): a point of the arc's
    // own red rides the path from the hub to the city on the same
    // clock and ease as the dash. It rests at opacity 0 in the served
    // markup, so without scripts there is no spark at all.
    const spark = sparks[i];
    if (spark) {
      tl.to(
        spark,
        {
          motionPath: { path: arc, align: arc, alignOrigin: [0.5, 0.5] },
          duration: 1.5,
          ease: "power2.inOut",
        },
        start,
      )
        .fromTo(spark, { opacity: 0 }, { opacity: 1, duration: SPARK_IN, ease: "none" }, start)
        .to(spark, { opacity: 0, duration: SPARK_OUT, ease: "none" }, start + 1.5 - SPARK_OUT);
    }

    // The destination node pulses once as its arc completes.
    const node = nodes[i];
    if (node) {
      tl.to(
        node,
        {
          scale: 1.4,
          transformOrigin: "50% 50%",
          duration: 0.25,
          ease: "power2.out",
        },
        start + 1.5,
      ).to(
        node,
        {
          scale: 1,
          transformOrigin: "50% 50%",
          duration: 0.25,
          ease: "power2.in",
        },
        start + 1.75,
      );
    }

    // Hold ~2s, then dim back to rest and retract the dash so the next
    // loop redraws cleanly (seamless — no snap at the repeat boundary).
    tl.to(
      arc,
      {
        opacity: 0.35,
        strokeDashoffset: len,
        duration: 0.6,
        ease: "power1.inOut",
      },
      start + 3.5,
    );
  });

  return tl;
}
