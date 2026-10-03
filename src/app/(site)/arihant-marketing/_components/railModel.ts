/**
 * Geometry for the counter rail plate (change round 6). Pure, run on the
 * server, so the served SVG is the finished drawing and the client only
 * animates it. One plate, four zones, each drawn to say what its step says:
 *
 *   portfolio tags | the store's shelving unit      | the rep, the cycle,
 *   (step 1)       | (steps 1 to 3 act on it)       | the three chips (step 2)
 *   ---------------+--------------------------------+---------------------
 *   supply, credit note, grievance (step 3)         | the ledger, capital (4)
 *
 * Illustrative only: stack heights are drawing, never data, and no figure on
 * the page comes from this file.
 */

export const VB_W = 720;
export const VB_H = 600;

/* ---------------- the portfolio: two columns of swing tags ---------------- */

export const TAG = { w: 34, h: 18 };
export const PORTFOLIO = { x: 16, y: 74, colGap: 42, rowGap: 36, rows: 6 };
/** Tag tones, drawn from the palette: ink, the unit maroon, stone, paper. */
export const TONES = ["ink", "maroon", "stone", "paper"] as const;
export type Tone = (typeof TONES)[number];

export const portfolioTags = () =>
  Array.from({ length: PORTFOLIO.rows * 2 }, (_, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    return {
      i,
      x: PORTFOLIO.x + col * PORTFOLIO.colGap,
      y: PORTFOLIO.y + row * PORTFOLIO.rowGap,
      tone: TONES[(row + col * 2) % TONES.length],
      // The last rows fade: the portfolio runs on past the plate.
      fade: row >= PORTFOLIO.rows - 2 ? (row === PORTFOLIO.rows - 1 ? 0.28 : 0.55) : 1,
    };
  });

/** A swing tag drawn at (x, y): a notched end, an eyelet, a name line. */
export const tagPath = (x: number, y: number) =>
  `M ${x + 8} ${y} H ${x + TAG.w} V ${y + TAG.h} H ${x + 8} L ${x} ${y + TAG.h / 2} Z`;

/* ---------------- the shelving unit ---------------- */

export const FX0 = 116;
export const FX1 = 516;
export const FTOP = 46;
export const SLOT_W = (FX1 - FX0) / 5;
export const BOARDS = [178, 318]; // top of each shelf board
export const BOARD_H = 7;
export const FLOOR = 350;
export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const slotX = (slot: number) => FX0 + slot * SLOT_W;
export const slotCx = (slot: number) => slotX(slot) + SLOT_W / 2;

/** Folded-shirt stacks per shelf and size: deep where the customer shops,
 *  shallow at the ends, and one slot left empty on purpose. */
export const DEPTH: number[][] = [
  [1, 4, 5, 3, 1],
  [2, 4, 3, 2, 0],
];
/** Shelf tones: the top shelf in ink, the lower in the unit maroon. */
export const SHELF_TONE: Tone[] = ["ink", "maroon"];

/** The stack that sells through in step two and is refilled in step three. */
export const THIN = { shelf: 1, slot: 2, keep: 1 } as const;
/** The empty slot: the size that would only sit. */
export const EMPTY = { shelf: 1, slot: 4 } as const;
/** Where the grievance flag goes up in step three (a top-shelf stack). */
export const FLAG = { shelf: 0, slot: 3 } as const;

export const SHIRT = { w: 54, h: 12, step: 15 };

/** Top-left of shirt k (0 = bottom of the stack) on a shelf slot. */
export function shirtAt(shelf: number, slot: number, k: number): [number, number] {
  return [slotCx(slot) - SHIRT.w / 2, BOARDS[shelf] - SHIRT.h - 1 - k * SHIRT.step];
}
export const stackTop = (shelf: number, slot: number, depth: number) =>
  BOARDS[shelf] - 1 - depth * SHIRT.step + (SHIRT.step - SHIRT.h);

/** One folded shirt: body, collar notch and two sleeve folds. */
export const shirtFold = (x: number, y: number) =>
  `M ${x + 23} ${y + 0.5} L ${x + 27} ${y + 5} L ${x + 31} ${y + 0.5} M ${x + 10} ${y + 3} V ${y + 10} M ${x + 44} ${y + 3} V ${y + 10}`;

/* ---------------- step one: callouts and the turned-away tag ---------------- */

/** "Depth where your customer shops": over the deepest stack. */
export const DEEP = { x: slotCx(2), labelY: 26, tipY: stackTop(0, 2, DEPTH[0][2]) - 6 };
/** The struck tag that comes to rest in the empty slot. */
export const STRUCK = { x: slotCx(EMPTY.slot) - TAG.w / 2, y: BOARDS[EMPTY.shelf] - TAG.h - 14 };

/* ---------------- step two: the rep ---------------- */

export const DIAL = { cx: 562, cy: 50, r: 13 };
export const CHIP_H = 22;
export const CHIP_X = 548;
export const CHIP_Y = [86, 116, 146];
/** Chip widths from their text, at the plate's 12px label size. */
export const chipW = (text: string) => Math.round(text.length * 6.7 + 26);

export const REP = { x: 640, head: 196 };
export const REP_ENTER = 190; // walks in from this far right

/* ---------------- step three: status rows ---------------- */

export const STATUS = { x0: FX0, x1: 404, y0: 384, row: 46 };
export const statusY = (i: number) => STATUS.y0 + i * STATUS.row;

/* ---------------- step four: the ledger and capital ---------------- */

export const LEDGER = { x: 432, y: 382, w: 172, h: 176 };
export const COIN = { cx: 666, cy: 452, r: 19, ring: 33 };

/** An arc of a circle as a path, for the cycle dial and the capital ring. */
export function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(from);
  const [x1, y1] = p(to);
  const large = to - from > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/** An arrowhead at angle `a` on a circle, pointing along the direction of
 *  travel (clockwise). */
export function arrowHead(cx: number, cy: number, r: number, a: number, size = 5) {
  const x = cx + r * Math.cos(a);
  const y = cy + r * Math.sin(a);
  // Tangent for clockwise travel on screen.
  const tx = -Math.sin(a);
  const ty = Math.cos(a);
  const nx = Math.cos(a);
  const ny = Math.sin(a);
  const bx = x - tx * size;
  const by = y - ty * size;
  return `M ${(bx + nx * size * 0.8).toFixed(1)} ${(by + ny * size * 0.8).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)} L ${(bx - nx * size * 0.8).toFixed(1)} ${(by - ny * size * 0.8).toFixed(1)}`;
}
