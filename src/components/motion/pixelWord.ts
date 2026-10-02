"use client";

import { gsap } from "@/lib/gsap";
import { PIXEL } from "@/lib/pixel";

/**
 * "Pixels forming the word" for the home hero's emphasised word (change
 * round 3, rebuilt in round 4). The site's one pixel-formation moment; its
 * finish comes from src/lib/pixel.ts.
 *
 * What it looks like: a cloud of square pixels rides up with the word's own
 * line as the headline rises out of its mask. The squares hop cell to cell on
 * the word's grid (never drifting between cells), arrive in a left-to-right
 * sweep, and set in full colour as each one lands, until the word stands as a
 * solid mosaic. Then the real word appears underneath and the squares drop
 * away in a stepped dither, so the hand-over never shows a soft double image.
 *
 * How it stays honest and robust:
 *  - The real word never leaves the h1. While the pixels play, an attribute
 *    on the h1 and a CSS variable fade the <em> by OPACITY only, so the word
 *    stays in the accessibility tree; SplitText rebuilds the h1's children on
 *    revert, but keeps the h1's own attributes, which is why the state lives
 *    there.
 *  - The canvas is a sibling of the h1 (inside the HeroIntro root), never a
 *    child, so the line masks cannot clip it and the revert cannot wipe it.
 *  - Geometry is sampled once, before the split, in the word's own font, each
 *    character placed where the browser put it, so the mosaic lands exactly on
 *    the glyphs. Any doubt (fonts not ready, the word wrapped, forced colours,
 *    an unsupported canvas) and it simply does not run: the word is already
 *    there, upright and in colour.
 *  - One master clock drives every pixel from a single draw call per frame;
 *    there are no per-particle tweens.
 */

interface Cfg {
  /** Smallest grid pitch, in CSS px. */
  pitch: number;
  /** The pitch otherwise follows the type: font size / perEm. */
  perEm: number;
  /** Each square's own travel time. */
  u: number;
  /** Arrival spread across the word, left to right. */
  sweep: number;
  /** Random slack on top of the sweep, so columns do not land as a wall. */
  jitter: number;
  /** The cloud arrives in three steps over this long. */
  appear: number;
  /** The finished mosaic holds this long before it hands over. */
  hold: number;
  /** Stepped dither from the mosaic to the real word. */
  dissolve: number;
  dissolveSteps: number;
  /** Cloud size, as a multiple of the font size. */
  amp: number;
  /** Most squares allowed (the grid coarsens above it). */
  cap: number;
}

const DESKTOP: Cfg = {
  pitch: 4,
  perEm: 18,
  u: 0.56,
  sweep: 0.3,
  jitter: 0.08,
  appear: 0.12,
  hold: 0.06,
  dissolve: 0.24,
  dissolveSteps: 4,
  amp: 0.9,
  cap: 1200,
};

const PHONE: Cfg = {
  pitch: 3,
  perEm: 14,
  u: 0.42,
  sweep: 0.2,
  jitter: 0.06,
  appear: 0.1,
  hold: 0.04,
  dissolve: 0.18,
  dissolveSteps: 3,
  amp: 0.75,
  cap: 500,
};

/** Alpha of a square still in flight: a light tint of the word's colour on
 *  paper, so the word visibly sets as each square lands at full strength. */
const FLIGHT_ALPHA = 0.4;

export interface PixelWordPrep {
  root: HTMLElement;
  title: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cfg: Cfg;
  mobile: boolean;
  dpr: number;
  n: number;
  W: number;
  H: number;
  step: number;
  /** Square size in flight (device px); a landed square fills its cell. */
  small: number;
  /** All squares have landed at T. */
  T: number;
  tx: Float32Array;
  ty: Float32Array;
  ox: Float32Array;
  oy: Float32Array;
  d: Float32Array;
  rank: Float32Array;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const easeOut = gsap.parseEase(PIXEL.ease);

/** Measures and samples the word. Makes no DOM writes; returns null whenever
 *  the effect should not run, which leaves the word exactly as rendered.
 *  `rise` is how far the word's line starts below its mask, as a fraction of
 *  the line's height (the headline's yPercent / 100). */
export function preparePixelWord({
  root,
  title,
  word,
  mobile,
  rise,
}: {
  root: HTMLElement;
  title: HTMLElement;
  word: HTMLElement;
  mobile: boolean;
  rise: number;
}): PixelWordPrep | null {
  if (window.matchMedia("(forced-colors: active)").matches) return null;
  if (typeof TextMetrics === "undefined" || !("fontBoundingBoxAscent" in TextMetrics.prototype)) {
    return null;
  }
  if (getComputedStyle(root).position === "static") return null;
  const text = word.textContent ?? "";
  if (!text.trim()) return null;
  const rects = word.getClientRects();
  if (rects.length !== 1) return null; // the emphasis wrapped across lines: leave it
  const r = rects[0];
  if (r.width < 4 || r.bottom <= 0 || r.top >= window.innerHeight) return null; // restored scroll
  const cs = getComputedStyle(word);
  const fs = parseFloat(cs.fontSize);
  // document.fonts.check with the full fallback list reports false; the
  // primary family alone is the honest question.
  const primary = cs.fontFamily.split(",")[0].trim();
  if (!document.fonts.check(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${primary}`, text)) {
    return null;
  }

  const cfg = mobile ? PHONE : DESKTOP;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pitch = Math.max(cfg.pitch, Math.round(fs / cfg.perEm));
  const lh = parseFloat(cs.lineHeight) || fs * 1.1;

  // Canvas box (viewport px): the word, the cloud round it, and the distance
  // its line travels on the way up, clipped to the hero <section>, which
  // hides its overflow.
  const clip = (root.closest("section") ?? root).getBoundingClientRect();
  const padX = Math.ceil(0.4 * fs * cfg.amp) + pitch;
  const padT = Math.ceil(0.3 * fs * cfg.amp) + pitch;
  const padB = Math.ceil(rise * (lh + 0.14 * fs) + 1.05 * fs * cfg.amp) + pitch;
  const snap = (v: number) => Math.round(v * dpr) / dpr; // device-aligned origin
  const left = snap(Math.max(r.left - padX, clip.left));
  const top = snap(Math.max(r.top - padT, clip.top));
  const W = Math.round((Math.min(r.right + padX, clip.right) - left) * dpr);
  const H = Math.round((Math.min(r.bottom + padB, clip.bottom) - top) * dpr);
  if (W < 8 || H < 8) return null;

  // 1) Glyph coverage in the word's own font, each character where the
  //    browser placed it, so kerning and tracking match exactly.
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const o = off.getContext("2d", { willReadFrequently: true });
  if (!o) return null;
  o.setTransform(dpr, 0, 0, dpr, 0, 0);
  o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  o.textBaseline = "alphabetic";
  o.fillStyle = "#000";
  const asc = o.measureText(text).fontBoundingBoxAscent; // inline box top + ascent = baseline
  const node = word.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE && word.childNodes.length === 1) {
    const range = document.createRange();
    let i = 0;
    for (const ch of text) {
      range.setStart(node, i);
      range.setEnd(node, i + ch.length);
      i += ch.length;
      if (!ch.trim()) continue;
      const b = range.getBoundingClientRect();
      o.fillText(ch, b.left - left, b.top - top + asc);
    }
  } else {
    if ("letterSpacing" in o) {
      (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing;
    }
    o.fillText(text, r.left - left, r.top - top + asc);
  }
  let data: Uint8ClampedArray;
  try {
    data = o.getImageData(0, 0, W, H).data;
  } catch {
    return null;
  }

  // 2) A grid in DEVICE px, so squares are whole device pixels; sample each
  //    cell's centre.
  let step = Math.max(2, Math.round(pitch * dpr));
  let t: number[] = [];
  for (let k = 0; k < 4; k++, step++) {
    t = [];
    const h = step >> 1;
    for (let gy = 0; gy + h < H; gy += step) {
      for (let gx = 0; gx + h < W; gx += step) {
        if (data[((gy + h) * W + gx + h) * 4 + 3] > 128) t.push(gx, gy);
      }
    }
    if (t.length / 2 <= cfg.cap) break;
  }
  const n = t.length / 2;
  if (n < 20) return null;
  const small = Math.max(1, Math.round(step * PIXEL.fill));

  // 3) Scatter: a cloud mostly BELOW the word, so it rises into place in the
  //    same direction as the line, and the headline reads as one upward
  //    motion. A few squares start just above so it is not a curtain. Offsets
  //    are whole cells, so a square always sits on the word's own grid.
  const A = fs * dpr * cfg.amp;
  const wordL = (r.left - left) * dpr;
  const wordW = Math.max(1, r.width * dpr);
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const ox = new Float32Array(n);
  const oy = new Float32Array(n);
  const d = new Float32Array(n);
  const rank = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    tx[i] = t[2 * i];
    ty[i] = t[2 * i + 1];
    const dx = (Math.random() - 0.5) * 0.7 * A;
    const dy =
      Math.random() < 0.8
        ? (0.15 + 0.85 * Math.random() ** 0.9) * A
        : -(0.05 + 0.2 * Math.random()) * A;
    ox[i] = Math.round(dx / step) * step;
    oy[i] = Math.round(dy / step) * step;
    const xn = clamp01((tx[i] - wordL) / wordW);
    d[i] = cfg.sweep * xn + cfg.jitter * Math.random(); // left-to-right sweep
    rank[i] = Math.random(); // the order the dither drops this square
  }

  // 4) The visible canvas: built, positioned, but not yet mounted.
  const canvas = document.createElement("canvas");
  canvas.className = "hero-pixels";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  canvas.width = W;
  canvas.height = H;
  const rb = root.getBoundingClientRect();
  Object.assign(canvas.style, {
    left: `${left - rb.left - root.clientLeft}px`,
    top: `${top - rb.top - root.clientTop}px`,
    width: `${W / dpr}px`,
    height: `${H / dpr}px`,
  });
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // Canvas must accept the computed colour (oklch/lab resolve to lab()).
  ctx.fillStyle = "#010203";
  ctx.fillStyle = cs.color;
  if (ctx.fillStyle === "#010203") return null;

  const T = cfg.sweep + cfg.jitter + cfg.u;
  return {
    root, title, canvas, ctx, cfg, mobile, dpr, n, W, H, step, small, T,
    tx, ty, ox, oy, d, rank,
  };
}

/** Mounts the canvas, hides the real word by opacity, and returns the effect
 *  as a timeline for the caller to place in its own (it does not start on its
 *  own if the caller adds it to a paused parent). `line` is the word's split
 *  line, whose live rise the pixels ride. `snap()` jumps to the final state at
 *  any moment (resize, breakpoint change, unmount). */
export function playPixelWord(
  p: PixelWordPrep,
  {
    line,
    delay,
    onStart,
    onDone,
  }: { line: HTMLElement | null; delay: number; onStart?: () => void; onDone?: () => void },
): { snap: () => void; timeline: gsap.core.Timeline | null } {
  const st = { t: 0 };
  let torn = false;
  const w0 = window.innerWidth;
  const h0 = window.innerHeight;
  let tl: gsap.core.Timeline | null = null;
  const { cfg, T } = p;
  const handover = T + cfg.hold;
  const total = handover + cfg.dissolve;
  const lineH = line?.offsetHeight ?? 0;

  const draw = (time: number) => {
    const { ctx, n, W, H, step, small } = p;
    ctx.clearRect(0, 0, W, H);
    // The cloud arrives in steps, like everything else here.
    const appear = Math.floor(clamp01(time / cfg.appear) * 3) / 3;
    if (appear <= 0) return;
    // Squares ride their line: its live rise, in device px.
    const yp = line ? Number(gsap.getProperty(line, "yPercent")) || 0 : 0;
    const lift = Math.round((yp / 100) * lineH * p.dpr);
    // After the hand-over the squares drop away in a stepped dither.
    const gone =
      time <= handover
        ? 0
        : Math.ceil(clamp01((time - handover) / cfg.dissolve) * cfg.dissolveSteps) /
          cfg.dissolveSteps;
    const inset = (step - small) / 2;
    for (let i = 0; i < n; i++) {
      if (p.rank[i] < gone) continue;
      const k = clamp01((time - p.d[i]) / cfg.u);
      if (k >= 1) {
        ctx.globalAlpha = 1;
        ctx.fillRect(p.tx[i], p.ty[i] + lift, step, step);
        continue;
      }
      // Hop cell to cell: the remaining offset is rounded to whole cells.
      const rest = 1 - easeOut(k);
      const x = p.tx[i] + Math.round((p.ox[i] * rest) / step) * step;
      const y = p.ty[i] + Math.round((p.oy[i] * rest) / step) * step + lift;
      ctx.globalAlpha = appear * (FLIGHT_ALPHA + 0.2 * k);
      ctx.fillRect(x + inset, y + inset, small, small);
    }
    ctx.globalAlpha = 1;
  };

  const onResize = () => {
    // Geometry is stale once the width (or, on desktop, the height) changes.
    if (window.innerWidth !== w0 || (!p.mobile && window.innerHeight !== h0)) teardown();
  };

  function teardown() {
    if (torn) return;
    torn = true;
    tl?.kill();
    window.removeEventListener("resize", onResize);
    p.canvas.remove();
    p.canvas.width = 0;
    p.canvas.height = 0;
    p.title.removeAttribute("data-hero-emphasis");
    p.title.style.removeProperty("--hero-emphasis-o");
    onDone?.();
  }

  try {
    p.title.setAttribute("data-hero-emphasis", "pixels");
    p.title.style.setProperty("--hero-emphasis-o", "0");
    p.root.appendChild(p.canvas);
    draw(0); // the first frame is blank (the cloud has not arrived), drawn before paint
    tl = gsap.timeline({ onStart, onComplete: teardown });
    tl.to(st, { t: total, duration: total, ease: "none", onUpdate: () => draw(st.t) }, delay)
      // The real word appears under the finished mosaic, then the squares
      // drop away to reveal it: no crossfade, no double image.
      .set(p.title, { "--hero-emphasis-o": 1 }, delay + handover);
    window.addEventListener("resize", onResize, { passive: true });
  } catch {
    teardown();
  }

  return { snap: teardown, timeline: torn ? null : tl };
}
