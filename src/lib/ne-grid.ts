import { NE_MAP_DOTS } from "@/components/motion/ne-map-dots";

/**
 * The Northeast dot field as a grid of cells (change round 3).
 *
 * The committed dot field (`ne-map-dots.ts`) samples the region on a 13px
 * pitch, every dot sitting at 6.5 + 13n. Read as a grid, each dot is one cell,
 * and that is the shared geography two components draw from:
 *
 *  - the footer NetworkMap (round dots, vermillion reach arcs, a loop), which
 *    only needs `project`;
 *  - the Arihant Retail store atlas (square pixels, stitched routes, one build
 *    then still), which reads land cells, rasterised arcs and ring buckets.
 *
 * Pure module: no DOM, no React, safe on the server. Nothing here is a
 * business figure. It is geometry, never printed, and lives outside facts.ts
 * for that reason.
 */

/** Grid pitch of the dot field, in viewBox units. */
export const NE_PITCH = 13;
/** Offset of the first dot centre from the viewBox origin. */
export const NE_OFFSET = 6.5;

/** One grid cell: column and row of the dot field. */
export type Cell = readonly [col: number, row: number];

/** Equirectangular projection matching the committed dot field: lon 88.0->97.5E
 *  and lat 21.5->29.5N mapped onto the 640x520 viewBox. */
export function project(lon: number, lat: number): [number, number] {
  return [((lon - 88.0) / 9.5) * 640, ((29.5 - lat) / 8.0) * 520];
}

/** The cell a longitude/latitude falls in (nearest dot). Town-level by
 *  construction: one cell is roughly 20km across. */
export function cellOf(lon: number, lat: number): Cell {
  const [x, y] = project(lon, lat);
  return [Math.round((x - NE_OFFSET) / NE_PITCH), Math.round((y - NE_OFFSET) / NE_PITCH)];
}

const key = (c: number, r: number) => `${c},${r}`;

/** Every land cell of the dot field, as "c,r" keys. */
export const NE_LAND: ReadonlySet<string> = new Set(
  NE_MAP_DOTS.map(([x, y]) =>
    key(Math.round((x - NE_OFFSET) / NE_PITCH), Math.round((y - NE_OFFSET) / NE_PITCH)),
  ),
);

export function isLand(c: number, r: number): boolean {
  return NE_LAND.has(key(c, r));
}

/**
 * A quadratic arc between two cell centres, rasterised to the cells it passes
 * through. The control point follows NetworkMap's rule: pushed off the chord
 * midpoint along its normal by `bend` times the chord length, except that a
 * chord shorter than `minLen` cells runs straight (a short arc bowed by a
 * fraction of a cell only reads as a wobble).
 *
 * Cells come back de-duplicated, in order from `from` to `to`, with both
 * endpoints excluded (the pins sit there).
 */
export function rasterArc(
  from: Cell,
  to: Cell,
  bend: number,
  minLen = 7,
  samples = 200,
): Cell[] {
  const x0 = from[0] + 0.5;
  const y0 = from[1] + 0.5;
  const x2 = to[0] + 0.5;
  const y2 = to[1] + 0.5;
  const dx = x2 - x0;
  const dy = y2 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const off = len < minLen ? 0 : bend * len;
  const cx = (x0 + x2) / 2 + (-dy / len) * off;
  const cy = (y0 + y2) / 2 + (dx / len) * off;

  const ends = new Set([key(from[0], from[1]), key(to[0], to[1])]);
  const seen = new Set<string>();
  const cells: Cell[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x2;
    const y = u * u * y0 + 2 * u * t * cy + t * t * y2;
    const c = Math.floor(x);
    const r = Math.floor(y);
    const k = key(c, r);
    if (ends.has(k) || seen.has(k)) continue;
    seen.add(k);
    cells.push([c, r]);
  }
  return cells;
}

/** Group cells into rings by rounded distance from `hub`, nearest ring first.
 *  Empty distances are skipped, so the result is dense. */
export function ringBuckets(cells: Iterable<Cell>, hub: Cell): Cell[][] {
  const rings = new Map<number, Cell[]>();
  for (const cell of cells) {
    const d = Math.round(Math.hypot(cell[0] - hub[0], cell[1] - hub[1]));
    const ring = rings.get(d);
    if (ring) ring.push(cell);
    else rings.set(d, [cell]);
  }
  return [...rings.entries()].sort((a, b) => a[0] - b[0]).map(([, ring]) => ring);
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** One SVG path of square pixels, one square per cell, each `size` of a cell
 *  and centred in it. Coordinates are in cells (one user unit per cell). */
export function squaresPath(cells: Iterable<Cell>, size: number): string {
  const inset = (1 - size) / 2;
  const s = fmt(size);
  let d = "";
  for (const [c, r] of cells) {
    d += `M${fmt(c + inset)} ${fmt(r + inset)}h${s}v${s}h-${s}z`;
  }
  return d;
}
