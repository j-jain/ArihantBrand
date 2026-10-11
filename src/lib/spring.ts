/**
 * Springs as a motion material (change round 10).
 *
 * A damped harmonic oscillator's unit step, sampled into an easing curve so
 * GSAP (CustomEase) and CSS (`linear()`) can play the same physics. Nothing
 * here touches the DOM or GSAP: `springCurve` is pure arithmetic, identical
 * on the server and the client, so a token's duration can be exported from
 * `src/lib/gsap.ts` without a window. The curve is registered as a CustomEase
 * there, inside the client-only block.
 *
 * `zeta` is the damping ratio (1 is critically damped, under 1 overshoots
 * and settles; the house springs sit between 0.3 and 0.8), `omega` the
 * natural frequency in radians per second, which sets how fast the whole
 * thing happens. The curve ends when the motion is within a thousandth of
 * rest, so a tween that takes `duration` from here settles visibly, never
 * cut off mid-swing and never idling at 1 for half a second.
 */

export interface SpringOptions {
  /** Damping ratio, 0 < zeta < 1 for a settle with overshoot. */
  zeta: number;
  /** Natural frequency, rad/s. */
  omega: number;
  /** Initial velocity as a share of the travel per second (0 at rest). */
  velocity?: number;
  /** Samples along the curve (the last lands exactly on 1). */
  samples?: number;
}

export interface SpringCurve {
  /** [t, x] pairs with t and x normalised: t from 0 to 1, x ending on 1. */
  points: [number, number][];
  /** Seconds the spring takes to settle within a thousandth of rest. */
  duration: number;
}

/** Position at time t of a unit step with the given spring, from rest. */
function stepAt(t: number, zeta: number, omega: number, v0: number): number {
  if (zeta >= 1) {
    // Critically damped (or over): x = 1 - (1 + (omega - v0) t) e^{-omega t}
    const e = Math.exp(-omega * t);
    return 1 - (1 + (omega - v0) * t) * e;
  }
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const e = Math.exp(-zeta * omega * t);
  // x(t) = 1 - e^{-ζωt}( cos(ωd t) + ((ζω - v0)/ωd) sin(ωd t) )
  return 1 - e * (Math.cos(wd * t) + ((zeta * omega - v0) / wd) * Math.sin(wd * t));
}

/** Time after which the envelope stays within `tol` of rest. */
function settleTime(zeta: number, omega: number, tol = 0.001): number {
  if (zeta >= 1) {
    // Solve (1 + omega t) e^{-omega t} = tol by a few Newton steps.
    let t = 6 / omega;
    for (let i = 0; i < 8; i++) {
      const e = Math.exp(-omega * t);
      const f = (1 + omega * t) * e - tol;
      const df = -omega * omega * t * e;
      t -= f / df;
    }
    return t;
  }
  const amp = 1 / Math.sqrt(1 - zeta * zeta);
  return Math.log(amp / tol) / (zeta * omega);
}

export function springCurve({ zeta, omega, velocity = 0, samples = 64 }: SpringOptions): SpringCurve {
  const duration = settleTime(zeta, omega);
  const points: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const x = i === samples ? 1 : stepAt(u * duration, zeta, omega, velocity);
    points.push([u, x]);
  }
  return { points, duration: Math.round(duration * 1000) / 1000 };
}

/** The curve as SVG path data for `CustomEase.create(id, path)`: a polyline
 *  from 0,0 to 1,1 (CustomEase parses L segments through its own path
 *  utilities and may overshoot above 1, like back and elastic do). */
export function springPath(curve: SpringCurve): string {
  return (
    "M0,0 " +
    curve.points
      .slice(1)
      .map(([t, x]) => `L${t.toFixed(4)},${x.toFixed(4)}`)
      .join(" ")
  );
}

/** The curve as a CSS `linear()` easing, for transitions that should share
 *  the physics (globals.css tokens are generated from this once). */
export function springLinear(curve: SpringCurve, stops = 32): string {
  const pts = curve.points;
  const out: string[] = [];
  for (let i = 0; i <= stops; i++) {
    const idx = Math.round((i / stops) * (pts.length - 1));
    const [t, x] = pts[idx];
    out.push(i === 0 ? "0" : i === stops ? "1" : `${x.toFixed(3)} ${(t * 100).toFixed(1)}%`);
  }
  return `linear(${out.join(", ")})`;
}
