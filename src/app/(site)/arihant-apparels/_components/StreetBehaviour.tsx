"use client";

import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ANCHOR_ORDER, STORE, STORES, cartonRoute, slipArc, storeTop, storeX } from "./streetModel";

const RM = "(prefers-reduced-motion: reduce)";
const MOB = "(prefers-reduced-motion: no-preference) and (max-width: 767px)";
const DESK = "(prefers-reduced-motion: no-preference) and (min-width: 768px)";

/** The timeline in viewports of scroll (desktop): a 0.3 run-in while the
 *  drawing comes up and the street is drawn, then three stages of 0.6 each,
 *  matching the stage panels' 60svh. A stage starts as its panel's top
 *  reaches 65% of the screen, so its text sits mid-screen during its hold. */
const TOTAL = 2.1;
const STAGES: [number, number, number][] = [
  [0.3, 0.78, 0.9],
  [0.9, 1.4, 1.5],
  [1.5, 1.96, TOTAL],
];
const EDGE = 0.02;
const SHORT_PHONE = 600;

/**
 * Motion for the storefront street (change round 6). Nothing pins: the
 * drawing holds (CSS sticky) beside the three stage texts, and ONE timeline
 * is scrubbed by the scroll across them (`scrub: 0.5`), so the street fills,
 * holds and empties again exactly with the reader.
 *
 * Reduced motion and no-JS: nothing runs; the finished street and all three
 * stages stand in the flow.
 */
export function StreetBehaviour({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const svg = root.querySelector<SVGSVGElement>(".ga-fig");
      const list = root.querySelector<HTMLElement>(".ga-stages");
      const items = Array.from(root.querySelectorAll<HTMLElement>(".ga-stage"));
      if (!svg || !list || items.length !== 3) return;
      const fills = items.map((li) => li.querySelector<HTMLElement>(".ga-stage__fill")!);

      const mm = gsap.matchMedia(ref);

      mm.add({ reduced: RM, mobile: MOB, desktop: DESK }, (ctx) => {
        const { reduced, mobile } = ctx.conditions as Record<string, boolean>;
        if (reduced) return;
        if (mobile && window.innerHeight < SHORT_PHONE) return;

        root.setAttribute("data-ga", "");
        let current = -1;

        const sync = (time: number) => {
          STAGES.forEach(([a, , z], i) => {
            const v = Math.min(1, Math.max(0, (time - a) / (z - a)));
            fills[i].style.transform = `scaleX(${v.toFixed(4)})`;
          });
          let idx = time < STAGES[0][0] ? -1 : STAGES.findIndex(([, , z], i) => i === 2 || time < z);
          if (current >= 0 && idx >= 0 && idx !== current) {
            const boundary = idx > current ? STAGES[current][2] : STAGES[idx][2];
            if (Math.abs(time - boundary) < EDGE) idx = current;
          }
          if (idx === current) return;
          current = idx;
          items.forEach((li, i) => {
            li.toggleAttribute("data-active", i === idx);
            if (i === idx) li.setAttribute("aria-current", "step");
            else li.removeAttribute("aria-current");
          });
        };

        const tl = buildTimeline(svg, () => sync(tl.time()));

        // The stage panels and the sticky layout only exist with JS, so
        // everything below this section has to re-measure once.
        ScrollTrigger.refresh();
        const scrub = ScrollTrigger.create({
          trigger: list,
          start: mobile ? "top 92%" : "top 95%",
          endTrigger: items[2],
          end: mobile ? "bottom 72%" : "bottom 65%",
          scrub: 0.5,
          animation: tl,
        });
        sync(tl.time());

        return () => {
          scrub.kill();
          tl.kill();
          fills.forEach((f) => f.style.removeProperty("transform"));
          items.forEach((li) => {
            li.removeAttribute("data-active");
            li.removeAttribute("aria-current");
          });
          root.removeAttribute("data-ga");
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The street, as one scrubbed timeline                                 */
/* ------------------------------------------------------------------ */

function buildTimeline(svg: SVGSVGElement, onUpdate: () => void) {
  const all = (sel: string, from: ParentNode = svg) => Array.from(from.querySelectorAll<SVGElement>(sel));
  const one = (sel: string, from: ParentNode = svg) => from.querySelector<SVGElement>(sel);
  const store = (id: string) => one(`.ga-store[data-store="${id}"]`);

  const tl = gsap.timeline({ paused: true, onUpdate });
  const OUT = "power3.out";
  const IN_OUT = "power2.inOut";

  const draw = (targets: Element | Element[] | null, at: number, duration: number, stagger = 0) => {
    if (!targets || (Array.isArray(targets) && !targets.length)) return;
    tl.fromTo(
      targets,
      { strokeDasharray: "1 1", strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration, ease: IN_OUT, stagger },
      at,
    );
  };
  const appear = (targets: Element | Element[] | null, at: number, duration = 0.05, vars: gsap.TweenVars = {}) => {
    if (!targets || (Array.isArray(targets) && !targets.length)) return;
    tl.from(targets, { opacity: 0, duration, ease: OUT, ...vars }, at);
  };

  /** A store takes the label: its front draws solid over the ghost, the
   *  fascia and awning fill, the window dresses, the tag swings on. */
  const light = (el: Element | null, at: number) => {
    if (!el) return;
    const lit = one(".ga-store__lit", el);
    if (!lit) return;
    tl.from(lit, { opacity: 0, duration: 0.02 }, at);
    draw(all(".ga-store__lit > .ga-ink", el), at, 0.06);
    tl.from(one(".ga-fascia", el), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.05, ease: OUT }, at + 0.02);
    tl.from(all(".ga-stripe", el), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.04, ease: OUT, stagger: 0.008 }, at + 0.04);
    appear(one(".ga-awning > .ga-ink", el), at + 0.05, 0.03);
    draw(all(".ga-window .ga-ink, .ga-door", el), at + 0.05, 0.05);
    appear(all(".ga-window .ga-garment", el), at + 0.08, 0.04, { y: -4, stagger: 0.008 });
    const tag = one(".ga-tag", el);
    if (tag) tl.from(tag, { opacity: 0, rotation: -28, transformOrigin: "50% 0%", duration: 0.07, ease: OUT }, at + 0.08);
    tl.to(one(".ga-store__ghost", el), { opacity: 0, duration: 0.04 }, at + 0.02);
  };

  /* ================= base: the street before the label ================= */
  tl.addLabel("base", 0);
  draw(all(".ga-ground"), 0, 0.12, 0.02);
  // The lane is a dotted line, so it fades in rather than drawing.
  appear(one(".ga-lane"), 0.06, 0.08);
  draw(one(".ga-warehouse > .ga-ink"), 0, 0.12);
  tl.from(one(".ga-warehouse .ga-fascia"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.06, ease: OUT }, 0.08);
  appear(one(".ga-shutter"), 0.1, 0.06, { y: 6 });
  appear(one(".ga-stockpile"), 0.12, 0.05, { y: -6 });
  const whTag = one(".ga-tag--wh");
  if (whTag) tl.from(whTag, { opacity: 0, rotation: -28, transformOrigin: "50% 0%", duration: 0.06, ease: OUT }, 0.15);
  // The ghost street fades in row by row, nearest the warehouse first.
  const ghosts = all(".ga-store__ghost");
  [2, 1, 0].forEach((row, i) => {
    const rowGhosts = ghosts.filter((g) => (g.parentElement?.getAttribute("data-store") ?? "").startsWith(`r${row}`));
    // fromTo, not from: a lit store's ghost rests hidden under its front in
    // the served drawing, but before the label arrives every store is one.
    tl.fromTo(
      rowGhosts,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.06, ease: OUT, stagger: 0.01 },
      0.04 + i * 0.04,
    );
  });

  /* ================= s1: seed the anchors ================= */
  let t = STAGES[0][0];
  tl.addLabel("s1", t);
  ANCHOR_ORDER.forEach((id, j) => {
    const spec = STORES.find((s) => s.id === id)!;
    const carton = one(`.ga-carton[data-to="${id}"]`);
    const route = cartonRoute(spec.row, spec.col);
    const at = t + 0.02 + j * 0.09;
    const travel = 0.16;
    if (carton) {
      tl.set(carton, { x: route[0][0], y: route[0][1], opacity: 1 }, at);
      // Along the road, up the lane, along the row: segment times by length.
      const legs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]));
      const sum = legs.reduce((a, b) => a + b, 0) || 1;
      let at2 = at;
      route.slice(1).forEach((p, i) => {
        const d = (legs[i] / sum) * travel;
        tl.to(carton, { x: p[0], y: p[1], duration: d, ease: i === legs.length - 1 ? OUT : "none" }, at2);
        at2 += d;
      });
      tl.to(carton, { opacity: 0, y: route[route.length - 1][1] - 6, duration: 0.03 }, at + travel);
    }
    light(store(id), at + travel - 0.01);
  });

  /* ================= s2: widen at the fair ================= */
  t = STAGES[1][0];
  tl.addLabel("s2", t);
  draw(one(".ga-fair__frame"), t, 0.08);
  tl.from(one(".ga-canopy"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.06, ease: OUT }, t + 0.04);
  draw(one(".ga-bunting"), t + 0.05, 0.07);
  tl.from(all(".ga-pennant"), { opacity: 0, y: -8, duration: 0.04, ease: OUT, stagger: 0.008 }, t + 0.08);
  appear(one(".ga-fair__rail"), t + 0.09, 0.05, { y: -5 });
  appear(one(".ga-counter"), t + 0.06, 0.05, { scaleY: 0, transformOrigin: "50% 100%" });
  appear(all(".ga-crowd > g"), t + 0.12, 0.05, { y: 8, stagger: 0.02 });

  // Order slips fly from the stall's counter to the stores they open.
  const fairStores = STORES.filter((s) => s.stage === 2).sort(
    (a, b) => a.row - b.row || a.col - b.col,
  );
  fairStores.forEach((s, k) => {
    const slip = one(`.ga-slip[data-to="${s.id}"]`);
    const a = slipArc(s.row, s.col);
    const at = t + 0.17 + k * 0.045;
    const fly = 0.11;
    if (slip) {
      const xs: number[] = [];
      const ys: number[] = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const v = 1 - u;
        xs.push(v * v * a.x0 + 2 * v * u * a.cx + u * u * a.x1);
        ys.push(v * v * a.y0 + 2 * v * u * a.cy + u * u * a.y1);
      }
      tl.set(slip, { x: xs[0], y: ys[0], opacity: 1, rotation: -10 }, at);
      tl.to(slip, { keyframes: { x: xs, y: ys, easeEach: "none" }, rotation: 8, duration: fly, ease: IN_OUT }, at);
      tl.to(slip, { opacity: 0, scale: 0.6, duration: 0.025 }, at + fly);
    }
    light(store(s.id), at + fly - 0.01);
  });

  /* ================= s3: shop-in-shop counters ================= */
  t = STAGES[2][0];
  tl.addLabel("s3", t);
  all(".ga-store__sis").forEach((badge, i) => {
    tl.from(badge, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%", duration: 0.05, ease: OUT }, t + 0.02 + i * 0.05);
  });
  const opener = STORES.find((s) => s.opens)!;
  const ocx = storeX(opener.col) + STORE.w / 2;
  const ocy = storeTop(opener.row) + STORE.h / 2;
  draw(one(".ga-zoom__line"), t + 0.08, 0.08);
  const inset = one(".ga-inset");
  if (inset) {
    tl.fromTo(
      inset,
      { scale: 0.14, opacity: 0, svgOrigin: `${ocx} ${ocy}` },
      { scale: 1, opacity: 1, duration: 0.12, ease: OUT },
      t + 0.1,
    );
  }
  appear(one(".ga-inset__caption"), t + 0.18, 0.05, { y: 4 });
  draw(one(".ga-inset__room"), t + 0.2, 0.06);
  appear(one(".ga-inset__others"), t + 0.22, 0.05);
  draw(one(".ga-bay__frame"), t + 0.24, 0.07);
  tl.from(one(".ga-bay__fascia"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.05, ease: OUT }, t + 0.28);
  appear(one(".ga-bay .ga-badge"), t + 0.31, 0.03, { scale: 0.3, transformOrigin: "50% 50%" });
  const bayTag = one(".ga-tag--bay");
  if (bayTag) tl.from(bayTag, { opacity: 0, rotation: -28, transformOrigin: "50% 0%", duration: 0.05, ease: OUT }, t + 0.32);
  all(".ga-bay__rail").forEach((rail, r) => {
    const at = t + 0.3 + r * 0.05;
    draw(one(".ga-ink", rail), at, 0.04);
    tl.from(all(".ga-bay__garment", rail), { opacity: 0, y: -10, duration: 0.04, ease: OUT, stagger: 0.008 }, at + 0.03);
  });
  appear(one(".ga-bay__plinth"), t + 0.38, 0.04, { scaleX: 0, transformOrigin: "50% 50%" });
  tl.set({}, {}, TOTAL);
  return tl;
}
