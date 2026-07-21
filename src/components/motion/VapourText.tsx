"use client";

import { useRef, type ElementType } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";
import { cn } from "../cn";

interface VapourTextProps {
  text: string;
  className?: string;
  as?: ElementType;
}

interface Particle {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  sa: number;
  phase: number;
  p: number;
}

interface LineBox {
  text: string;
  /** Offsets relative to the element's own border box, in CSS pixels. */
  left: number;
  top: number;
  height: number;
}

/** Recover the browser's own line breaking rather than re-wrapping the string.
 *  Each word is measured with a Range; consecutive words sharing a line-box top
 *  form one line. This keeps the particle cloud identical to the settled text
 *  whatever `text-wrap` (balance/pretty), hyphenation or tracking does, which a
 *  greedy `measureText` loop cannot. Returns [] if the element is not a single
 *  text node, in which case the caller leaves the real text visible. */
function readLineBoxes(el: HTMLElement): LineBox[] {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) {
    return [];
  }
  const full = node.textContent ?? "";
  if (!full.trim()) return [];

  const box = el.getBoundingClientRect();
  const range = document.createRange();
  const lines: LineBox[] = [];
  let start = -1;
  let end = -1;
  let top = 0;
  let left = 0;
  let height = 0;

  const flush = () => {
    if (start < 0) return;
    lines.push({
      text: full.slice(start, end),
      left: left - box.left,
      top: top - box.top,
      height,
    });
    start = -1;
  };

  for (const match of full.matchAll(/\S+/g)) {
    const from = match.index;
    const to = from + match[0].length;
    range.setStart(node, from);
    range.setEnd(node, to);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    if (start < 0 || Math.abs(rect.top - top) > 1) {
      flush();
      start = from;
      top = rect.top;
      left = rect.left;
      height = rect.height;
    } else {
      left = Math.min(left, rect.left);
      height = Math.max(height, rect.height);
    }
    end = to;
  }
  flush();
  range.detach();
  return lines;
}

/** A heading (or any text) that, on first scroll into view, settles out of a
 *  drifting cloud of vapour: the real text is momentarily hidden, its glyphs
 *  are sampled into particles that converge from a dispersed state, then the
 *  real text crossfades back and the canvas is released. The sample reads the
 *  browser's own line boxes and waits for webfonts, so the cloud always carries
 *  the same line breaks as the settled heading and nothing reflows. It is a pure
 *  progressive enhancement — the server always renders real, styled text, and
 *  mobile / coarse-pointer / reduced-motion / no-WebGL simply keep that text.
 *  Everything (canvas, particles, listeners) is torn down on completion and on
 *  unmount. */
export function VapourText({ text, className, as = "span" }: VapourTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const textEl = root.querySelector<HTMLElement>(".vapour__text");
      const canvas = root.querySelector<HTMLCanvasElement>(".vapour__canvas");
      if (!textEl || !canvas) return;

      const mm = gsap.matchMedia(ref);
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          mobile:
            "(prefers-reduced-motion: no-preference) and (max-width: 1023px)",
          desktop:
            "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
        },
        (ctx) => {
          const { reduced, mobile } = ctx.conditions as {
            reduced: boolean;
            mobile: boolean;
            desktop: boolean;
          };
          if (reduced) return;

          // Mobile / coarse pointer: a quiet whole-block fade if below the fold.
          if (mobile) {
            const rect = root.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) return;
            gsap.from(root, {
              autoAlpha: 0,
              y: 14,
              duration: 0.5,
              ease: EASE,
              scrollTrigger: { trigger: root, start: "top 82%", once: true },
            });
            return;
          }

          const dctx = canvas.getContext("2d");
          if (!dctx) return; // no 2D context — real text stays visible

          let particles: Particle[] = [];
          let running = false;
          let dpr = 1;
          let cssW = 0;
          let cssH = 0;
          let color = "#000";
          let drawing: (() => void) | null = null;
          let finishCall: gsap.core.Tween | null = null;

          const draw = () => {
            if (!drawing) return;
            dctx.clearRect(0, 0, canvas.width, canvas.height);
            const t = performance.now() / 1000;
            for (const pt of particles) {
              const x = pt.sx + (pt.tx - pt.sx) * pt.p;
              const y = pt.sy + (pt.ty - pt.sy) * pt.p;
              const wobble = Math.sin(t * 6 + pt.phase) * 5 * (1 - pt.p);
              dctx.globalAlpha = pt.sa + (1 - pt.sa) * pt.p;
              dctx.fillRect(
                (x + wobble) * dpr,
                (y + wobble * 0.6) * dpr,
                Math.max(1, dpr),
                Math.max(1, dpr),
              );
            }
          };

          /** Vertical offset of the canvas from the element's top, once the
           *  glyph boxes are known: the first line's box usually starts above
           *  the element box (negative half-leading). */
          let originY = 0;

          const measure = () => {
            const rect = textEl.getBoundingClientRect();
            cssW = Math.ceil(rect.width);
            cssH = Math.ceil(rect.height);
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cs = getComputedStyle(textEl);
            color = cs.color || "#000";
            sizeCanvas();
            return cs;
          };

          const sizeCanvas = () => {
            canvas.width = Math.max(1, Math.round(cssW * dpr));
            canvas.height = Math.max(1, Math.round(cssH * dpr));
            canvas.style.width = `${cssW}px`;
            canvas.style.height = `${cssH}px`;
            canvas.style.top = `${originY}px`;
          };

          const build = () => {
            const cs = measure();
            if (cssW < 2 || cssH < 2) return false;

            const lines = readLineBoxes(textEl);
            if (!lines.length) return false;

            // Glyph boxes are taller than the line boxes, so line one usually
            // starts above the element box and the last descends below it.
            // Grow the canvas to their union so no ink is clipped away.
            originY = Math.min(0, ...lines.map((l) => l.top));
            const bottom = Math.max(cssH, ...lines.map((l) => l.top + l.height));
            cssH = Math.ceil(bottom - originY);
            sizeCanvas();

            // Sample the glyphs on an offscreen canvas using the element's own
            // computed font, drawing each real line at its real position.
            const off = document.createElement("canvas");
            off.width = canvas.width;
            off.height = canvas.height;
            const octx = off.getContext("2d");
            if (!octx) return false;
            octx.scale(dpr, dpr);
            const fontSize = parseFloat(cs.fontSize) || 16;
            octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            // Tracking, where the browser supports it on canvas (Chromium).
            const tracked = octx as CanvasRenderingContext2D & {
              letterSpacing?: string;
            };
            if ("letterSpacing" in tracked) tracked.letterSpacing = cs.letterSpacing;
            octx.textBaseline = "alphabetic";
            octx.fillStyle = "#fff";

            for (const line of lines) {
              // Sit the glyphs on the same baseline the browser used: the line
              // box carries half-leading above and below the font's own box.
              const m = octx.measureText(line.text);
              const asc = m.fontBoundingBoxAscent || fontSize * 0.8;
              const desc = m.fontBoundingBoxDescent || fontSize * 0.2;
              const baseline =
                line.top - originY + (line.height - (asc + desc)) / 2 + asc;
              octx.fillText(line.text, line.left, baseline);
            }

            let data: ImageData;
            try {
              data = octx.getImageData(0, 0, off.width, off.height);
            } catch {
              return false;
            }

            const step = 3;
            const next: Particle[] = [];
            for (let y = 0; y < cssH; y += step) {
              for (let x = 0; x < cssW; x += step) {
                const px = Math.floor(x * dpr);
                const py = Math.floor(y * dpr);
                const alpha = data.data[(py * off.width + px) * 4 + 3];
                if (alpha > 128) {
                  const angle = Math.random() * Math.PI * 2;
                  const radius = 40 + Math.random() * 70;
                  next.push({
                    sx: x + Math.cos(angle) * radius,
                    sy: y + Math.sin(angle) * radius,
                    tx: x,
                    ty: y,
                    sa: Math.random() * 0.4,
                    phase: Math.random() * Math.PI * 2,
                    p: 0,
                  });
                }
              }
            }
            particles = next;
            return particles.length > 0;
          };

          const finish = () => {
            gsap.to(textEl, { autoAlpha: 1, duration: 0.3, ease: EASE });
            gsap.to(canvas, {
              autoAlpha: 0,
              duration: 0.3,
              ease: EASE,
              onComplete: () => {
                if (drawing) gsap.ticker.remove(drawing);
                drawing = null;
                particles = [];
                running = false;
                dctx.clearRect(0, 0, canvas.width, canvas.height);
              },
            });
          };

          const start = () => {
            if (running) return;
            running = true;
            if (!build()) {
              running = false;
              return; // sampling failed — real text is already visible
            }
            dctx.fillStyle = color;
            gsap.set(textEl, { autoAlpha: 0 });
            gsap.set(canvas, { autoAlpha: 1 });
            drawing = draw;
            gsap.ticker.add(drawing);

            let maxDelay = 0;
            for (const pt of particles) {
              const delay = (pt.tx / Math.max(cssW, 1)) * 0.4;
              if (delay > maxDelay) maxDelay = delay;
              gsap.to(pt, { p: 1, duration: 1.5, ease: EASE, delay });
            }
            finishCall = gsap.delayedCall(1.5 + maxDelay + 0.05, finish);
          };

          // Never sample against the fallback font: its metrics wrap differently
          // from Besley, which would show a different line count than the text
          // the reader ends up with.
          const startWhenReady = () => {
            if (document.fonts?.status === "loaded") start();
            else document.fonts.ready.then(() => root.isConnected && start());
          };

          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top 78%",
            once: true,
            onEnter: startWhenReady,
          });

          // Re-measure the (still un-started) overlay if the box changes.
          let observer: ResizeObserver | null = null;
          if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => {
              if (!running) measure();
            });
            observer.observe(textEl);
          }

          return () => {
            trigger.kill();
            observer?.disconnect();
            finishCall?.kill();
            if (drawing) gsap.ticker.remove(drawing);
            drawing = null;
            gsap.killTweensOf(particles);
            gsap.killTweensOf(textEl);
            gsap.killTweensOf(canvas);
            particles = [];
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [text] },
  );

  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={cn("vapour", className)}>
      <span className="vapour__text">{text}</span>
      <canvas className="vapour__canvas" aria-hidden="true" />
    </Tag>
  );
}
