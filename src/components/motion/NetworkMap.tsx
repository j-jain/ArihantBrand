import { project } from "@/lib/ne-grid";
import { NE_MAP_DOTS } from "./ne-map-dots";
import { NetworkMapMotion } from "./NetworkMapMotion";

/* The projection lives in src/lib/ne-grid.ts, shared with the retail store
 * atlas, so the two maps can never disagree about where a town sits. */

const round = (n: number) => Math.round(n * 10) / 10;

const HUB = { name: "Guwahati", lon: 91.75, lat: 26.14 };

/* The seven states the copy names, one reach arc each (Assam gets two: the
   hub itself and Dibrugarh up the valley). Gangtok came out in change round
   9: every sentence on the site says "seven states", and Sikkim is not one
   of them. */
const SPOKES = [
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

/** The whole dot field as ONE path (performance pass): every dot a
 *  zero-length, round-capped stroke, which draws the same 1.4-radius disc as
 *  the 615 `<circle>`s it replaces (stroke-width 2.8 in motion.css), with
 *  relative moves between them. One node instead of 615 on every page, no
 *  per-dot transparency group, and nothing for React to hydrate. */
const DOTS_D = NE_MAP_DOTS.map(([x, y], i) => {
  if (i === 0) return `M${x} ${y}h0`;
  const [px, py] = NE_MAP_DOTS[i - 1];
  return `m${round(x - px)} ${round(y - py)}h0`;
}).join("");

/** A dotted map of Northeast India in the footer: a Guwahati hub with slow reach
 *  arcs drawing out to eight cities and back. Decorative and honest — only the
 *  hub is labelled, and it claims nothing beyond a shape and a starting point.
 *
 *  Server-rendered since the performance pass: the drawing is plain markup,
 *  and NetworkMapMotion (client) only animates it. The static (SSR / no-JS)
 *  render shows the arcs at rest as calm solid strokes at 0.35 opacity; the
 *  animation only enhances. All hidden/dash state is applied from JS, so
 *  nothing is stranded if scripts never run. */
export function NetworkMap() {
  return (
    <NetworkMapMotion>
      <svg
        className="nm-svg"
        viewBox="0 0 640 520"
        role="img"
        aria-label="Distribution reach from Guwahati across Northeast India"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path className="nm-dots" d={DOTS_D} />

        <g className="nm-arcs">
          {ARCS.map((arc) => (
            <path key={arc.name} className="nm-arc" d={arc.d} />
          ))}
        </g>

        {/* One spark per arc, parked on the hub at opacity 0: plain SVG in the
            served markup, moved and lit only by the desktop loop. */}
        <g className="nm-sparks">
          {ARCS.map((arc) => (
            <circle
              key={`spark-${arc.name}`}
              className="nm-spark"
              cx={round(HX)}
              cy={round(HY)}
              r={2.5}
              opacity={0}
              style={{ fill: "var(--vermillion)" }}
            />
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
    </NetworkMapMotion>
  );
}
