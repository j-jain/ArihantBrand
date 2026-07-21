"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NE_MAP_DOTS } from "./ne-map-dots";

/** Equirectangular projection matching the committed dot field: lon 88.0->97.5E
 *  and lat 21.5->29.5N mapped onto the 640x520 viewBox. */
function project(lon: number, lat: number): [number, number] {
  return [((lon - 88.0) / 9.5) * 640, ((29.5 - lat) / 8.0) * 520];
}

const round = (n: number) => Math.round(n * 10) / 10;

const HUB = { name: "Guwahati", lon: 91.75, lat: 26.14 };

const SPOKES = [
  { name: "Gangtok", lon: 88.61, lat: 27.33 },
  { name: "Itanagar", lon: 93.6, lat: 27.1 },
  { name: "Dibrugarh", lon: 94.9, lat: 27.47 },
  { name: "Kohima", lon: 94.1, lat: 25.67 },
  { name: "Imphal", lon: 93.94, lat: 24.82 },
  { name: "Aizawl", lon: 92.72, lat: 23.73 },
  { name: "Agartala", lon: 91.28, lat: 23.83 },
  { name: "Shillong", lon: 91.88, lat: 25.57 },
];

const [HX, HY] = project(HUB.lon, HUB.lat);

const NODES = SPOKES.map((s) => {
  const [x, y] = project(s.lon, s.lat);
  return { name: s.name, x: round(x), y: round(y) };
});

/** One quadratic bezier per spoke: control point pushed off the chord midpoint
 *  perpendicular by 16% of the chord length, alternating sides for organic
 *  variety. Computed once at module load — pure geometry, no runtime cost. */
const ARCS = NODES.map((n, i) => {
  const mx = (HX + n.x) / 2;
  const my = (HY + n.y) / 2;
  const dx = n.x - HX;
  const dy = n.y - HY;
  const len = Math.hypot(dx, dy) || 1;
  const off = 0.16 * len * (i % 2 === 0 ? 1 : -1);
  const cx = round(mx + (-dy / len) * off);
  const cy = round(my + (dx / len) * off);
  return {
    name: n.name,
    d: `M ${round(HX)} ${round(HY)} Q ${cx} ${cy} ${n.x} ${n.y}`,
  };
});

/** A dotted map of Northeast India in the footer: a Guwahati hub with slow reach
 *  arcs drawing out to eight cities and back. Decorative and honest — only the
 *  hub is labelled, and it claims nothing beyond a shape and a starting point.
 *
 *  The static (SSR / no-JS) render shows the arcs at rest as calm solid strokes
 *  at 0.35 opacity; the animation only enhances on desktop with motion allowed.
 *  All hidden/dash state is applied from JS, so nothing is stranded if scripts
 *  never run, and the whole timeline is paused while the footer is offscreen. */
export function NetworkMap() {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;

      const mm = gsap.matchMedia(ref);
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        () => {
          const arcs = gsap.utils.toArray<SVGPathElement>(
            svg.querySelectorAll(".nm-arc"),
          );
          const nodes = gsap.utils.toArray<SVGRectElement>(
            svg.querySelectorAll(".nm-node"),
          );
          if (!arcs.length) return;

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

          // Only tick while visible; freezes when the footer is scrolled away.
          const io = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) tl.play();
                else tl.pause();
              }
            },
            { threshold: 0 },
          );
          io.observe(svg);

          return () => io.disconnect();
        },
      );

      // Mobile: the reach draws ONCE when the footer comes into view, then
      // rests inked in. A perpetual loop at the very bottom of every page is a
      // battery tax on a handset for an effect nobody is still watching, but a
      // dead map is the wrong last impression too — so it plays exactly once
      // and stops. The rest state matches the CSS default (opacity 0.35), so
      // nothing depends on this having run.
      mm.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
        () => {
          const arcs = gsap.utils.toArray<SVGPathElement>(
            svg.querySelectorAll(".nm-arc"),
          );
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
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      className="nm-svg"
      viewBox="0 0 640 520"
      role="img"
      aria-label="Distribution reach from Guwahati across Northeast India"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="nm-dots">
        {NE_MAP_DOTS.map(([x, y]) => (
          <circle key={`${x},${y}`} cx={x} cy={y} r={1.4} />
        ))}
      </g>

      <g className="nm-arcs">
        {ARCS.map((arc) => (
          <path key={arc.name} className="nm-arc" d={arc.d} />
        ))}
      </g>

      <g className="nm-nodes">
        {NODES.map((n) => (
          <rect
            key={n.name}
            className="nm-node"
            x={n.x - 5}
            y={n.y - 5}
            width={10}
            height={10}
            rx={2}
          />
        ))}
        <rect
          className="nm-hub"
          x={HX - 5}
          y={HY - 5}
          width={10}
          height={10}
          rx={2}
        />
      </g>

      <text
        className="nm-label"
        x={round(HX) - 9}
        y={round(HY)}
        textAnchor="end"
        dominantBaseline="middle"
      >
        GUWAHATI
      </text>
    </svg>
  );
}
