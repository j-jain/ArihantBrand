"use client";

import { gsap } from "@/lib/gsap";
import { PIXEL } from "@/lib/pixel";

/**
 * "Pixels forming the word" for the home hero's emphasised word (change
 * round 3). One of exactly two pixel-formation moments on the site (the other
 * is the Arihant Retail store atlas); both share src/lib/pixel.ts.
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
  /** Grid pitch in CSS px. */
  step: number;
  /** Gap between squares, in device px, given the DPR. */
  gapDev: (dpr: number) => number;
  /** Total travel time; every particle has landed at T (spread + u === T). */
  T: number;
  /** Each particle's own travel time. */
  u: number;
  /** Spread of start delays across the word (left to right sweep). */
  spread: number;
  /** Final stretch over which the gaps close into a solid mosaic. */
  close: number;
  /** Cloud fade-in at the start. */
  appear: number;
  /** Canvas-to-real-word crossfade. */
  fade: number;
  /** Cloud size, as a multiple of the font size. */
  amp: number;
  /** Most particles allowed (the grid coarsens above it). */
  cap: number;
}

const DESKTOP: Cfg = {
  step: 3,
  gapDev: () => 1,
  T: 0.95,
  u: 0.62,
  spread: 0.33,
  close: 0.12,
  appear: 0.15,
  fade: 0.28,
  amp: 1.0,
  cap: 3000,
};

const PHONE: Cfg = {
  step: 3,
  gapDev: (d) => Math.max(1, Math.round(0.75 * d)),
  T: 0.7,
  u: 0.48,
  spread: 0.22,
  close: 0.1,
  appear: 0.15,
  fade: 0.2,
  amp: 0.8,
  cap: 1200,
};

export interface PixelWordPrep {
  root: HTMLElement;
  title: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cfg: Cfg;
  mobile: boolean;
  n: number;
  W: number;
  H: number;
  step: number;
  size: number;
  tx: Float32Array;
  ty: Float32Array;
  sx: Float32Array;
  sy: Float32Array;
  d: Float32Array;
  a0: Float32Array;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Measures and samples the word. Makes no DOM writes; returns null whenever
 *  the effect should not run, which leaves the word exactly as rendered. */
export function preparePixelWord({
  root,
  title,
  word,
  mobile,
}: {
  root: HTMLElement;
  title: HTMLElement;
  word: HTMLElement;
  mobile: boolean;
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

  // Canvas box (viewport px): the word plus room for the cloud, clipped to the
  // hero <section>, which hides its overflow.
  const clip = (root.closest("section") ?? root).getBoundingClientRect();
  const padX = Math.ceil(0.8 * fs * cfg.amp) + 4;
  const padT = Math.ceil(0.45 * fs * cfg.amp) + 4;
  const padB = Math.ceil(1.3 * fs * cfg.amp) + 4;
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

  // 2) A grid in DEVICE px, so squares and gaps are whole device pixels;
  //    sample each cell's centre.
  let step = Math.max(2, Math.round(cfg.step * dpr));
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
  const size = Math.max(1, step - cfg.gapDev(dpr));

  // 3) Scatter: a loose cloud mostly BELOW the word that rises into it, the
  //    same direction as the masked line rise, so the headline reads as one
  //    upward motion. A few pixels start just above so it is not a curtain.
  const A = fs * dpr * cfg.amp;
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const sx = new Float32Array(n);
  const sy = new Float32Array(n);
  const d = new Float32Array(n);
  const a0 = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    tx[i] = t[2 * i];
    ty[i] = t[2 * i + 1];
    const dx = (Math.random() - 0.5) * 1.5 * A;
    const dy =
      Math.random() < 0.85
        ? (0.2 + 0.8 * Math.random() ** 0.8) * A
        : -(0.1 + 0.25 * Math.random()) * A;
    sx[i] = clamp(tx[i] + dx, 0, W - size);
    sy[i] = clamp(ty[i] + dy, 0, H - size);
    d[i] = cfg.spread * (0.65 * (tx[i] / W) + 0.35 * Math.random()); // left-to-right sweep
    a0[i] = 0.25 + 0.35 * Math.random();
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

  return { root, title, canvas, ctx, cfg, mobile, n, W, H, step, size, tx, ty, sx, sy, d, a0 };
}

/** Mounts the canvas, hides the real word by opacity, plays, crossfades back
 *  to the real word and removes everything. `snap()` jumps to the final state
 *  at any moment (resize, breakpoint change, unmount). */
export function playPixelWord(
  p: PixelWordPrep,
  {
    delay,
    onStart,
    onDone,
  }: { delay: number; onStart?: () => void; onDone?: () => void },
): { snap: () => void } {
  const st = { t: 0 };
  let torn = false;
  const w0 = window.innerWidth;
  const h0 = window.innerHeight;
  let tl: gsap.core.Timeline | null = null;

  const draw = (time: number) => {
    const { ctx, n, W, H, cfg } = p;
    ctx.clearRect(0, 0, W, H);
    const appear = Math.min(1, time / cfg.appear);
    const close = smoothstep(cfg.T - cfg.close, cfg.T, time);
    const s = Math.round(p.size + (p.step - p.size) * close); // gaps close: a solid mosaic
    for (let i = 0; i < n; i++) {
      const k = clamp01((time - p.d[i]) / cfg.u);
      const e = 1 - (1 - k) ** 4; // easeOutQuart, the site's EASE family
      ctx.globalAlpha = appear * (p.a0[i] + (1 - p.a0[i]) * Math.min(1, k * 1.6));
      ctx.fillRect(
        Math.round(p.sx[i] + (p.tx[i] - p.sx[i]) * e),
        Math.round(p.sy[i] + (p.ty[i] - p.sy[i]) * e),
        s,
        s,
      );
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
    draw(0); // the first frame is blank (appear = 0), drawn before paint
    tl = gsap.timeline({ onStart, onComplete: teardown });
    tl.to(st, { t: p.cfg.T, duration: p.cfg.T, ease: "none", onUpdate: () => draw(st.t) }, delay)
      .to(p.canvas, { opacity: 0, duration: p.cfg.fade, ease: "power1.inOut" }, delay + p.cfg.T)
      .to(
        p.title,
        { "--hero-emphasis-o": 1, duration: p.cfg.fade, ease: "power1.inOut" },
        delay + p.cfg.T,
      );
    window.addEventListener("resize", onResize, { passive: true });
  } catch {
    teardown();
  }

  return { snap: teardown };
}

/** Re-exported so the hero and the atlas read one vocabulary. */
export { PIXEL };
