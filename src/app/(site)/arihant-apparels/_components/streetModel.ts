/**
 * Geometry for the storefront street (change round 6). Pure, run on the
 * server, so the served SVG is the finished street and the client only
 * animates it. Three zones, left to right:
 *
 *   the fair stall        | a street of 12 multi-brand | a shop-in-shop
 *   the warehouse         | stores, in three rows      | corner, in detail
 *
 * HONESTY: an illustrative path, not a record. No store is named, no town is
 * shown, and three stores stay unlit so the street never claims "everywhere".
 */

export const VB_W = 960;
export const VB_H = 560;

/* ---------------- the warehouse ---------------- */

export const WH = { x: 20, w: 180, top: 360, base: 520 };
export const WH_DOOR = { x: 70, w: 80, top: 440 };

/* ---------------- the fair stall ---------------- */

export const FAIR = { x: 30, w: 160, top: 140, base: 290 };

/* ---------------- the street ---------------- */

export const STORE = { w: 100, h: 108 };
export const COLS = 4;
export const ROWS = 3;
export const STREET_X = 250;
export const COL_PITCH = 112;
export const ROW_BASE = [170, 345, 520];
/** The lane the cartons take up from the warehouse road to each row. */
export const LANE_X = 226;
export const STREET_END = STREET_X + (COLS - 1) * COL_PITCH + STORE.w + 14;

export const storeX = (col: number) => STREET_X + col * COL_PITCH;
export const storeTop = (row: number) => ROW_BASE[row] - STORE.h;

export type StoreStage = 1 | 2 | null;

export interface StoreSpec {
  id: string;
  row: number;
  col: number;
  /** Which stage lights it: 1 the anchors, 2 the fair, null never. */
  stage: StoreStage;
  /** Gets a shop-in-shop counter in stage three. */
  sis?: boolean;
  /** The store the detail panel opens from. */
  opens?: boolean;
}

/** Twelve stores: three anchors (one per row), six more from the fair, and
 *  three that stay unlit. */
const PLAN: (StoreStage | "sis" | "open")[][] = [
  [2, null, 1, "open"],
  [1, "sis", 2, null],
  [2, 2, null, 1],
];

export const STORES: StoreSpec[] = PLAN.flatMap((row, r) =>
  row.map((cell, c) => ({
    id: `r${r}c${c}`,
    row: r,
    col: c,
    stage: cell === "sis" || cell === "open" ? 2 : cell,
    sis: cell === "sis" || cell === "open",
    opens: cell === "open",
  })),
);

/** Anchors in stage one are seeded in this order (nearest row first). */
export const ANCHOR_ORDER = ["r2c3", "r1c0", "r0c2"];

/** The carton's road from the warehouse door to a store's front. */
export function cartonRoute(row: number, col: number): [number, number][] {
  const doorX = WH.x + WH.w + 4;
  const ground = WH.base;
  const front = storeX(col) + STORE.w / 2;
  const base = ROW_BASE[row];
  if (row === ROWS - 1) return [[doorX, ground], [front, ground]];
  return [
    [doorX, ground],
    [LANE_X, ground],
    [LANE_X, base],
    [front, base],
  ];
}

/** The order slip's arc from the fair stall's counter to a store's fascia. */
export function slipArc(row: number, col: number) {
  const x0 = FAIR.x + FAIR.w / 2;
  const y0 = FAIR.top + 70;
  const x1 = storeX(col) + STORE.w / 2;
  const y1 = storeTop(row) + 20;
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - 70;
  return { x0, y0, cx, cy, x1, y1 };
}

/* ---------------- the shop-in-shop detail ---------------- */

export const INSET = { x: 726, y: 64, w: 220, h: 340 };
export const SIS_BAY = { x: 762, y: 156, w: 148, h: 220 };

/** Awning stripes across a store front. */
export const STRIPES = [0, 1, 2, 3, 4];
