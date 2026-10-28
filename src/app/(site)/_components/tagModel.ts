/**
 * The home swing tags' geometry, light and physics (BusinessTags, refined
 * 28 October 2026). Pure: no DOM and no GSAP, so the server paints the rest
 * pose from the same numbers the client animates, and a plain node script can
 * drive the sway at any frame rate. Styles in src/app/tags.css.
 *
 * Lengths are rem unless a name says otherwise. The cord is drawn in units of
 * a sixteenth of a rem, so its viewBox matches its box and nothing stretches.
 */

/* ---------------- the rest pose ---------------- */

/** Tags on a real rail never hang square: each is turned a little on its
 *  cord (yaw, degrees) and hangs a little lower or higher than its
 *  neighbours (extra cord, rem). A tag squares up when it is pointed at. */
export const REST_POSE = [
  { yaw: -7, drop: 0 },
  { yaw: 5, drop: 0.6 },
  { yaw: -4, drop: 0.25 },
] as const;

export const restPose = (i: number) => REST_POSE[i % REST_POSE.length];

/** The longest extra cord: every tag gives back the difference under it, so
 *  all three cards stay one height while they hang at different drops. */
export const MAX_DROP = Math.max(...REST_POSE.map((p) => p.drop));

/* ---------------- the cord ---------------- */

export const CORD = {
  /** Drawing units per rem. */
  unit: 16,
  /** Width of the cord's box, in units. */
  w: 12,
  /** The rod's half height, in units: the rail tube is 0.62rem. */
  rod: 5,
  /** Room drawn above the rod's centre line for the knot, in units. */
  head: 8,
  /** Where the knot's legs meet and the twist begins, in units. */
  twistTop: 10,
  /** Rail centre to the card's top edge with no extra drop, rem. */
  base: 3.25,
  /** Each strand's swing out from the cord's centre line, in units. */
  amp: 1.7,
  /** Turns per rem of cord at rest, and the extra a turned card winds in. */
  density: 0.44,
  wind: 0.78,
  /** Share of the cord the wind spreads over as it climbs from the card. */
  spread: 0.45,
  /** The strands close in over this last share of the cord, into the hole. */
  close: 0.16,
  steps: 64,
} as const;

/** The card's eyelet centre below its top edge, rem. */
export const EYE = 1.4;

/** The cord from the rail's centre line to the card's top edge, rem. */
export const cordLength = (i: number) => CORD.base + restPose(i).drop;

export interface CordShape {
  /** Rail centre to the card's top edge when taut, rem. */
  length: number;
  /** How far the turned card has wound the cord, 0 to 1. */
  wind: number;
  /** How far the card is held above its rest, rem. Above zero the cord is
   *  slack and bows to one side; below zero it is stretched a hair. */
  lift?: number;
  /** Which side a slack cord bows to: 1 or -1. */
  bow?: number;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** The viewBox the cord is drawn in, for a cord of this length. */
export function cordBox(length: number): { viewBox: string; height: number } {
  const h = CORD.head + length * CORD.unit;
  return { viewBox: `0 ${-CORD.head} ${CORD.w} ${h}`, height: h / CORD.unit };
}

/**
 * The cord as two paths: the stretches of strand facing the viewer (`front`,
 * which also carries the knot) and the stretches behind (`back`), so the two
 * plies visibly cross.
 *
 * The knot is a hitch round the rod: two wraps across the tube's face, their
 * legs meeting just under it where the twist starts. The twist runs down to
 * the card's top edge and closes into the eyelet. A turned card winds more
 * turns in, and the wind climbs from the card up the cord rather than
 * appearing everywhere at once. A card held above its rest leaves the cord
 * slack: it bows by the amount that keeps its length.
 */
export function cordPaths({ length, wind, lift = 0, bow = 1 }: CordShape): { front: string; back: string } {
  const U = CORD.unit;
  const mid = CORD.w / 2;
  const top = CORD.twistTop;
  const taut = length * U - top;
  const chord = taut - lift * U;
  // A half-sine bow of height B over the chord adds about (pi B)^2 / (4 chord)
  // to its length; this B gives the slack back exactly.
  const sag = lift > 0 && chord > 0 ? (2 / Math.PI) * Math.sqrt(chord * (taut - chord)) : 0;
  const turnsPerUnit = 1 / U;

  // The knot: two wraps across the rod and the legs into the twist.
  const wrap = 1.6;
  let front =
    `M ${mid - wrap} ${-CORD.rod - 1.2} L ${mid - wrap} ${CORD.rod}` +
    ` Q ${mid - wrap} ${top - 2} ${mid} ${top}` +
    ` M ${mid + wrap} ${-CORD.rod - 1.2} L ${mid + wrap} ${CORD.rod}` +
    ` Q ${mid + wrap} ${top - 2} ${mid} ${top}`;
  let back = "";

  // Phase per strand, integrated down the cord's own length.
  const n = CORD.steps;
  const phase = [0, Math.PI];
  for (let s = 0; s < 2; s++) {
    let theta = phase[s];
    let side: boolean | null = null;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      if (i > 0) {
        // Local turns per unit: the wind reaches the bottom of the cord
        // first and climbs, spread over CORD.spread of its length.
        const w = clamp01((wind * (1 + CORD.spread) - (1 - u)) / CORD.spread);
        const density = CORD.density + CORD.wind * w;
        theta += 2 * Math.PI * density * turnsPerUnit * (taut / n);
      }
      const y = top + u * chord;
      const closing = clamp01((u - (1 - CORD.close)) / CORD.close);
      const amp = CORD.amp * (1 - closing * closing);
      const x = mid + bow * sag * Math.sin(Math.PI * u) + amp * Math.sin(theta);
      const facing = Math.cos(theta) >= 0;
      const pt = `${x.toFixed(2)} ${y.toFixed(2)}`;
      if (facing !== side) {
        // A new run starts on the side the strand has crossed to; the
        // previous run takes this point too, so the strand never breaks.
        if (side !== null) {
          if (side) front += ` L ${pt}`;
          else back += ` L ${pt}`;
        }
        if (facing) front += ` M ${pt}`;
        else back += ` M ${pt}`;
        side = facing;
      } else if (facing) front += ` L ${pt}`;
      else back += ` L ${pt}`;
    }
  }
  return { front: front.trim(), back: back.trim() };
}

/* ---------------- the die ---------------- */

/** The tag's die cut, rem: the chamfered head, the rounded foot, and the two
 *  notches where the stub's perforation runs. */
export const DIE = {
  chamferX: 3.3,
  chamferY: 1.3,
  foot: 0.55,
  notch: 0.36,
  /** The stub under the perforation, rem from the foot. */
  stub: 5.6,
} as const;

/** The focus ring's width inside the die, rem. */
export const RING = 0.19;

const r4 = (x: number) => Number(x.toFixed(4));
const fromLeft = (x: number) => (x === 0 ? "0%" : `${r4(x)}rem`);
const fromRight = (x: number) => (x === 0 ? "100%" : `calc(100% - ${r4(x)}rem)`);
const fromTop = fromLeft;
const fromFoot = fromRight;

/** The die's outline moved `inset` rem inwards, clockwise from the middle of
 *  its top edge, as CSS polygon points. */
function dieLoop(inset: number): string[] {
  const { chamferX: cx, chamferY: cy, foot, notch, stub } = DIE;
  const i = inset;
  const len = Math.hypot(cx, cy);
  // Where the inset top edge meets the inset chamfer, and the inset chamfer
  // meets the inset side (the chamfer line moved i along its inward normal).
  const headX = cx + (i * cy) / len - (i * (1 - cx / len) * cx) / cy;
  const shoulderY = (i * cx) / len + ((cx + (i * cy) / len - i) * cy) / cx;
  // The notch is a semicircle centred on the die's own edge; inset, it grows
  // by i and is cut off by the inset side.
  const rn = notch + i;
  const reach = Math.acos(i / rn);
  const notchPts = (right: boolean, down: boolean): string[] => {
    const pts: string[] = [];
    const steps = 6;
    for (let k = 0; k <= steps; k++) {
      const t = -reach + (2 * reach * k) / steps;
      const a = down ? t : -t;
      const dx = rn * Math.cos(a);
      const dy = stub - rn * Math.sin(a);
      pts.push(`${right ? fromRight(dx) : fromLeft(dx)} ${fromFoot(dy)}`);
    }
    return pts;
  };
  // The foot's rounded corners, concentric with the die's.
  const rf = Math.max(foot - i, 0);
  const footPts = (right: boolean): string[] => {
    const pts: string[] = [];
    const steps = 4;
    for (let k = 0; k <= steps; k++) {
      const a = ((right ? k : steps - k) / steps) * (Math.PI / 2);
      const dx = foot - rf * Math.cos(a);
      const dy = foot - rf * Math.sin(a);
      pts.push(`${right ? fromRight(dx) : fromLeft(dx)} ${fromFoot(dy)}`);
    }
    return pts;
  };
  return [
    `50% ${fromTop(i)}`,
    `${fromRight(headX)} ${fromTop(i)}`,
    `${fromRight(i)} ${fromTop(shoulderY)}`,
    ...notchPts(true, true),
    ...footPts(true),
    ...footPts(false),
    ...notchPts(false, false),
    `${fromLeft(i)} ${fromTop(shoulderY)}`,
    `${fromLeft(headX)} ${fromTop(i)}`,
    `50% ${fromTop(i)}`,
  ];
}

/** The die as a clip-path. */
export const tagDie = (): string => `polygon(${dieLoop(0).join(", ")})`;

/** The focus ring: the band between the die and the die moved RING inwards,
 *  one even-odd polygon whose two loops meet at the top centre, where the
 *  cord's strand covers the seam. */
export const tagRing = (): string => `polygon(evenodd, ${[...dieLoop(0), ...dieLoop(RING)].join(", ")})`;

/* ---------------- light ---------------- */

/* One light from the upper left, in front: a face turned toward it brightens
   a touch, a face turning away darkens. Normalised (-0.5, -0.35, 1). */
const LIGHT_X = -0.5 / Math.hypot(0.5, 0.35, 1);
const LIGHT_Z = 1 / Math.hypot(0.5, 0.35, 1);
/** Ink over a face turned fully away, and paper over one facing the light. */
const DARK_MAX = 0.22;
const GLOW_MAX = 0.06;

function faceLight(nx: number, nz: number): { dark: number; glow: number } {
  const lit = Math.max(0, nx * LIGHT_X + nz * LIGHT_Z) - LIGHT_Z;
  return lit < 0
    ? { dark: Math.min(DARK_MAX, (-lit / LIGHT_Z) * DARK_MAX), glow: 0 }
    : { dark: 0, glow: Math.min(GLOW_MAX, (lit / (1 - LIGHT_Z)) * GLOW_MAX) };
}

/** Each face's shading at a yaw in degrees (rotateY: positive turns the
 *  card's face toward the right). */
export function tagLight(yaw: number) {
  const a = (yaw * Math.PI) / 180;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return { front: faceLight(s, c), back: faceLight(-s, -c) };
}

/** The card's edge as a hairline, seen only as the card passes edge-on. */
export function edgeShow(yaw: number): number {
  const s = Math.abs(Math.sin((yaw * Math.PI) / 180));
  const t = clamp01((s - 0.86) / 0.14);
  return t * t * (3 - 2 * t);
}

/* ---------------- the sway ---------------- */

export interface Mode {
  /** Damping ratio, 0 < zeta < 1. */
  zeta: number;
  /** Natural frequency, rad/s. */
  omega: number;
}

/** One exact step of x'' + 2 zeta omega x' + omega^2 x = 0 over h seconds.
 *  Exact at any step size, so a swing dies away in the same time at 30Hz,
 *  60Hz or 240Hz, and a long stall cannot make it blow up. */
export function stepMode(x: number, v: number, m: Mode, h: number): [number, number] {
  const a = m.zeta * m.omega;
  const wd = m.omega * Math.sqrt(1 - m.zeta * m.zeta);
  const e = Math.exp(-a * h);
  const c = Math.cos(wd * h);
  const s = Math.sin(wd * h);
  return [
    e * ((c + (a * s) / wd) * x + (s / wd) * v),
    e * ((c - (a * s) / wd) * v - ((m.omega * m.omega * s) / wd) * x),
  ];
}

export interface ModeShapes {
  /** The cord's angle about the rail per unit of each mode. */
  cord: readonly [number, number];
  /** The card's turn about its eyelet, relative to the cord, per unit. */
  hinge: readonly [number, number];
  /** The fast mode's frequency over the slow one's. */
  ratio: number;
}

/**
 * How a cord and a hung card share a swing. A massless cord of length
 * `cord` carries a rigid card whose centre hangs `reach` below the eyelet,
 * with radius of gyration `gyration` (any one length unit). Linearised, the
 * pair has two natural modes: a slow swing where the card leads and the cord
 * follows at a smaller angle, and a quick flick where the card turns against
 * the cord. q1 is the card's angle in the slow mode, q2 the cord's in the
 * quick one, so the tag reads as cord plus card, never one stiff stick.
 */
export function modeShapes(cord: number, reach: number, gyration: number): ModeShapes {
  const k2 = gyration * gyration;
  const al = reach / k2;
  const be = 1 / cord;
  const ga = (reach * reach) / (k2 * cord);
  const sum = al + be + ga;
  const disc = Math.sqrt(sum * sum - 4 * al * be);
  const s1 = (sum - disc) / 2;
  const s2 = (sum + disc) / 2;
  const r1 = al / (al - s1);
  const r2 = al / (al - s2);
  return { cord: [1 / r1, 1], hinge: [1 - 1 / r1, r2 - 1], ratio: Math.sqrt(s2 / s1) };
}

export interface Sway {
  q1: number;
  v1: number;
  q2: number;
  v2: number;
}

export const restSway = (): Sway => ({ q1: 0, v1: 0, q2: 0, v2: 0 });

/** Advance a tag's sway by h seconds. */
export function stepSway(s: Sway, slow: Mode, quick: Mode, h: number): void {
  [s.q1, s.v1] = stepMode(s.q1, s.v1, slow, h);
  [s.q2, s.v2] = stepMode(s.q2, s.v2, quick, h);
}

/** True when a tag has as good as stopped (degrees, degrees a second). */
export const swayAtRest = (s: Sway): boolean =>
  Math.abs(s.q1) < 0.01 && Math.abs(s.v1) < 0.06 && Math.abs(s.q2) < 0.01 && Math.abs(s.v2) < 0.12;

/** The cord's angle about the rail and the card's about its eyelet. */
export function swayAngles(s: Sway, m: ModeShapes): { cord: number; hinge: number } {
  return {
    cord: m.cord[0] * s.q1 + m.cord[1] * s.q2,
    hinge: m.hinge[0] * s.q1 + m.hinge[1] * s.q2,
  };
}
