"use client";

import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import {
  BOARDS,
  COIN,
  DEPTH,
  REP,
  REP_ENTER,
  SHIRT,
  STATUS,
  STRUCK,
  TAG,
  THIN,
  VB_W,
  portfolioTags,
  slotCx,
  statusY,
} from "./railModel";

const RM = "(prefers-reduced-motion: reduce)";
const MOB = "(prefers-reduced-motion: no-preference) and (max-width: 767px)";
const DESK = "(prefers-reduced-motion: no-preference) and (min-width: 768px)";

/** The timeline is laid out in its own units: TOTAL of them, the first PRE
 *  played before the pin (the counter starts filling as the section comes
 *  up). SCROLL_PER_UNIT sets the pace: viewports of scroll per unit. At 2.2
 *  each step takes about 2.5 viewports and the pin about 8.5 (change round
 *  6 went 1 -> 1.6; round 7 to 2.2, when the client was still scrolling past
 *  the motion). PRE x SCROLL_PER_UNIT must stay at or under 1: the run-in
 *  starts as the section's top enters the screen. */
const TOTAL = 4.3;
const PRE = 0.45;
const SCROLL_PER_UNIT = 2.2;
const PIN_VH = (TOTAL - PRE) * SCROLL_PER_UNIT;
/** Phone scrub smoothing, in seconds: a glide, not a lag. */
const SCRUB = 0.7;
/** Desktop follows the scroll with a speed limit instead of a plain scrub
 *  (change round 7): the drawing eases toward where the scroll says it should
 *  be (FOLLOW, a time constant in seconds) but never plays faster than
 *  MAX_RATE timeline units a second. A hard flick of the wheel still moves
 *  the page at once; the drawing then plays every step's motion through, at
 *  about a second a step, instead of jumping to the end of it. */
const FOLLOW = 0.22;
const MAX_RATE = 0.9;

/** Each step: [start, end of its motion, end of its hold]. */
const STEPS: [number, number, number][] = [
  [0, 0.85, 1.15],
  [1.15, 1.95, 2.3],
  [2.3, 3.1, 3.45],
  [3.45, 4.0, TOTAL],
];
/** Where a step's title button lands the reader: inside that step's hold. */
const LAND = [0.98, 2.1, 3.25, 4.06];
/** The last stretch: every part comes back to full strength, a summary. */
const SUMMARY = 4.12;
/** Opacity of the parts that belong to the steps already told. */
const DIM = 0.3;

/** Hysteresis round a step boundary, in timeline units. */
const EDGE = 0.03;
const FIT_SLACK = 6;
const SHORT_PHONE = 600;
const FLIP_DELAY = 200;

type Mode = "pin" | "flow";

/**
 * Motion for the counter rail (change round 6). The whole stage holds while
 * it plays. The drawing on the right is ONE timeline driven by the scroll, so
 * it advances, holds and reverses with the reader: on desktop through a
 * speed-limited follower (see MAX_RATE), on a phone through a plain scrub.
 * Every step is a stretch of motion followed by a hold, so each state rests
 * long enough to read.
 *
 *  desktop, fits:  the section pins for PIN_VH viewports, after the PRE run-in,
 *                  the drawing following the scroll at no more than MAX_RATE.
 *  desktop, short: no pin; the steps' own scroll drives the drawing (only a
 *                  window under about 560px tall, since round 7).
 *  phone:          no pin; the drawing holds under the header (sticky) while
 *                  the steps scroll beneath it, driving the same timeline.
 *  reduced / no-JS: nothing runs; the finished drawing and all text stand.
 */
export function CounterRailBehaviour({
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
      const section = root?.parentElement;
      if (!root || !section) return;
      const svg = root.querySelector<SVGSVGElement>(".rail-fig");
      const probe = root.querySelector<HTMLElement>(".rail-probe");
      const stage = root.querySelector<HTMLElement>(".rail__stage");
      const head = root.querySelector<HTMLElement>(".rail__head");
      const copy = root.querySelector<HTMLElement>(".rail__copy");
      const list = root.querySelector<HTMLElement>(".rail-steps");
      const items = Array.from(root.querySelectorAll<HTMLElement>(".rail-step"));
      const details = Array.from(root.querySelectorAll<HTMLElement>(".rail-detail__text"));
      if (!svg || !probe || !stage || !head || !copy || !list || items.length !== 4) return;
      const fills = items.map((li) => li.querySelector<HTMLElement>(".rail-step__fill")!);
      const buttons = items.map((li) => li.querySelector<HTMLButtonElement>("[data-step-go]")!);

      const mm = gsap.matchMedia(ref);

      mm.add({ reduced: RM, mobile: MOB, desktop: DESK }, (ctx) => {
        const { reduced, mobile } = ctx.conditions as Record<string, boolean>;
        if (reduced) return;
        if (mobile && window.innerHeight < SHORT_PHONE) return;

        let current = -1;
        let mode: Mode | null = null;
        let pin: ScrollTrigger | null = null;
        let scrub: ScrollTrigger | null = null;
        let flipTimer = 0;
        /** Where the scroll says the drawing should be (desktop follower). */
        let target = 0;

        /** The single writer of the left column's state: the active step,
         *  its numeral, the slot's text and the rules' fill. Plain style and
         *  attribute writes: this runs on every scrubbed frame. */
        const sync = (time: number) => {
          STEPS.forEach(([a, , z], i) => {
            const v = Math.min(1, Math.max(0, (time - a) / (z - a)));
            fills[i].style.transform = `scaleX(${v.toFixed(4)})`;
          });
          let idx = STEPS.findIndex(([, , z], i) => i === STEPS.length - 1 || time < z);
          if (current >= 0 && idx !== current) {
            const boundary = idx > current ? STEPS[current][2] : STEPS[idx][2];
            if (Math.abs(time - boundary) < EDGE) idx = current;
          }
          if (idx === current) return;
          current = idx;
          items.forEach((li, i) => {
            li.toggleAttribute("data-active", i === idx);
            if (i === idx) li.setAttribute("aria-current", "step");
            else li.removeAttribute("aria-current");
          });
          details.forEach((p, i) => p.toggleAttribute("data-on", i === idx));
        };

        const tl = buildTimeline(svg, mobile, () => sync(tl.time()));

        /* ---------------- fit guard (desktop) ---------------- */

        /** Measured in the pinned layout: the heading row's height (which the
         *  plate is sized against, as --rail-head-h) and whether the left
         *  column fits the height left beneath it. */
        const fitsPinned = () => {
          root.setAttribute("data-rail", "");
          const headH = head.offsetHeight;
          root.style.setProperty("--rail-head-h", `${headH}px`);
          const gap = parseFloat(getComputedStyle(stage).rowGap) || 0;
          const room = probe.offsetHeight - headH - gap;
          const ok = copy.offsetHeight <= room + (mode === "pin" ? FIT_SLACK : 0);
          if (mode !== "pin") root.removeAttribute("data-rail");
          return ok;
        };

        /* ---------------- driving the drawing ---------------- */

        /** A phone keeps its plain scrub; desktop records the scroll's
         *  target and lets `follow` play the drawing toward it. */
        const drive = (vars: ScrollTrigger.Vars) =>
          mobile
            ? ScrollTrigger.create({ ...vars, scrub: SCRUB, animation: tl })
            : ScrollTrigger.create({
                ...vars,
                onUpdate: (self) => {
                  target = self.progress * TOTAL;
                },
              });

        const follow = (_time: number, deltaMs: number) => {
          const now = tl.time();
          const gap = target - now;
          if (Math.abs(gap) < 0.0005) return;
          // A frame after a hidden tab can be seconds long; never let one
          // frame carry the drawing more than a tenth of a second's worth.
          const dt = Math.min(deltaMs / 1000, 0.1);
          let step = gap * (1 - Math.exp(-dt / FOLLOW));
          const cap = MAX_RATE * dt;
          step = Math.max(-cap, Math.min(cap, step));
          tl.time(Math.abs(gap - step) < 0.0005 ? target : now + step);
        };
        if (!mobile) gsap.ticker.add(follow);

        /* ---------------- modes ---------------- */

        const buildPin = () => {
          mode = "pin";
          root.setAttribute("data-rail", "");
          pin = ScrollTrigger.create({
            trigger: root,
            pin: true,
            pinSpacing: true,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * PIN_VH)}`,
            anticipatePin: 1,
          });
          scrub = drive({
            trigger: section,
            // The section's top this far down the viewport is exactly the
            // run-in's scroll before the pin starts.
            start: `top ${Math.round(PRE * SCROLL_PER_UNIT * 100)}%`,
            end: () => `+=${Math.round(window.innerHeight * TOTAL * SCROLL_PER_UNIT)}`,
          });
        };

        const buildFlow = () => {
          mode = "flow";
          if (mobile) root.setAttribute("data-rail-sticky", "");
          scrub = drive({
            trigger: list,
            start: mobile ? "top 78%" : "top 70%",
            end: mobile ? "bottom 62%" : "bottom 55%",
          });
        };

        const teardown = () => {
          pin?.kill(true);
          pin = null;
          scrub?.kill();
          scrub = null;
          fills.forEach((f) => f.style.removeProperty("transform"));
          items.forEach((li) => {
            li.removeAttribute("data-active");
            li.removeAttribute("aria-current");
          });
          details.forEach((p) => p.removeAttribute("data-on"));
          root.removeAttribute("data-rail");
          root.removeAttribute("data-rail-sticky");
          root.style.removeProperty("--rail-head-h");
          current = -1;
          mode = null;
        };

        const build = () => {
          if (!mobile && fitsPinned()) buildPin();
          else buildFlow();
          ScrollTrigger.refresh();
          // Arriving mid-section (a reload, a jump link) shows the drawing
          // where the scroll is, rather than playing up to it.
          if (!mobile && scrub) {
            target = scrub.progress * TOTAL;
            tl.time(target);
          }
          sync(tl.time());
        };

        build();

        /* ---------------- step buttons ---------------- */

        const onGo = (i: number) => () => {
          if (!scrub) return;
          const top = scrub.start + (LAND[i] / TOTAL) * (scrub.end - scrub.start);
          window.scrollTo({ top: Math.round(top), behavior: "smooth" });
        };
        const handlers = buttons.map((b, i) => {
          const h = onGo(i);
          b.addEventListener("click", h);
          return h;
        });

        /* ---------------- re-fit on resize (desktop) ---------------- */

        const onResize = () => {
          if (mobile) return;
          window.clearTimeout(flipTimer);
          flipTimer = window.setTimeout(() => {
            const want: Mode = fitsPinned() ? "pin" : "flow";
            if (want === mode) return;
            teardown();
            build();
          }, FLIP_DELAY);
        };
        window.addEventListener("resize", onResize);

        return () => {
          if (!mobile) gsap.ticker.remove(follow);
          window.removeEventListener("resize", onResize);
          window.clearTimeout(flipTimer);
          buttons.forEach((b, i) => b.removeEventListener("click", handlers[i]));
          teardown();
          tl.kill();
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
/* The drawing, as one scrubbed timeline (units: viewports of scroll)   */
/* ------------------------------------------------------------------ */

function buildTimeline(svg: SVGSVGElement, mobile: boolean, onUpdate: () => void) {
  const all = (sel: string) => Array.from(svg.querySelectorAll<SVGElement>(sel));
  const one = (sel: string) => svg.querySelector<SVGElement>(sel);
  const num = (el: Element, k: string) => Number(el.getAttribute(`data-${k}`));
  const grp = (i: number) => one(`.rail-grp[data-grp="${i}"]`);

  const tl = gsap.timeline({ paused: true, onUpdate });
  // Scrubbed motion reads best with decisive, non-bouncing curves.
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
  const appear = (targets: Element | Element[] | null, at: number, duration = 0.08, vars: gsap.TweenVars = {}) => {
    if (!targets || (Array.isArray(targets) && !targets.length)) return;
    tl.from(targets, { opacity: 0, duration, ease: OUT, ...vars }, at);
  };

  /* ================= 01 Map the counter ================= */
  tl.addLabel("s1", 0);
  draw(all(".rail-frame, .rail-floor"), 0, 0.3);
  tl.from(all(".rail-board"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.24, ease: OUT, stagger: 0.05 }, 0.05);
  draw(all(".rail-divider"), 0.12, 0.2, 0.02);
  appear(all(".rail-ticket"), 0.2, 0.12, { stagger: 0.006 });
  // The empty forms the later steps fill, ruled up with the store.
  draw(all(".rail-form__rule"), 0.22, 0.2, 0.04);
  appear(one(".rail-form__ledger"), 0.3, 0.14);
  appear(one(".rail-label--strong"), 0.04, 0.12, { x: -8 });
  appear(all(".rail-tag"), 0.06, 0.14, { x: -10, stagger: 0.012 });

  // A tag flies from the portfolio to each slot it was chosen for, then
  // that slot's stack rises under it.
  const sources = portfolioTags();
  const flights = all(".rail-flight");
  const shirts = all(".rail-shirt");
  flights.forEach((flight, j) => {
    const shelf = num(flight, "shelf");
    const slot = num(flight, "slot");
    const src = sources[(j * 5) % sources.length];
    const at = 0.3 + j * 0.034;
    const tx = slotCx(slot) - TAG.w / 2;
    const ty = BOARDS[shelf] - DEPTH[shelf][slot] * SHIRT.step - TAG.h - 12;
    tl.set(flight, { x: src.x, y: src.y, opacity: 1 }, at);
    tl.to(flight, { x: tx, y: ty, duration: 0.12, ease: IN_OUT }, at);
    tl.to(flight, { opacity: 0, y: ty + 10, duration: 0.05, ease: "power1.in" }, at + 0.12);
    const stack = shirts
      .filter((s) => num(s, "shelf") === shelf && num(s, "slot") === slot)
      .sort((a, b) => num(a, "k") - num(b, "k"));
    tl.from(stack, { y: 10, opacity: 0, duration: 0.06, ease: OUT, stagger: 0.014 }, at + 0.11);
  });

  // One tag is turned away: it comes to rest struck through, in the slot
  // left empty on purpose.
  const struck = one(".rail-struck");
  if (struck) {
    const src = sources[3];
    tl.fromTo(
      struck,
      { x: src.x, y: src.y, opacity: 0 },
      { x: STRUCK.x, y: STRUCK.y, opacity: 1, duration: 0.14, ease: IN_OUT },
      0.62,
    );
    draw(one(".rail-tag__strike"), 0.77, 0.06);
  }
  appear(one(".rail-callout--deep .rail-label"), 0.7, 0.1, { y: 6 });
  draw(one(".rail-leader"), 0.74, 0.1);
  appear(one(".rail-leader__dot"), 0.82, 0.04, { scale: 0, transformOrigin: "50% 50%" });
  appear(one(".rail-callout--sit .rail-label"), 0.78, 0.08, { y: 6 });

  /* ================= 02 Stand in the store ================= */
  let t = STEPS[1][0];
  tl.addLabel("s2", t);
  tl.to(grp(0), { opacity: DIM, duration: 0.1, ease: "power1.out" }, t);
  // Customers buy: the middle stack on the lower shelf sells through.
  const sells = shirts.filter((s) => s.hasAttribute("data-sells")).sort((a, b) => num(b, "k") - num(a, "k"));
  tl.to(sells, { y: -14, opacity: 0, duration: 0.07, ease: "power2.in", stagger: 0.05 }, t + 0.02);

  // The rep walks in from the aisle.
  const rep = one(".rail-rep");
  if (rep) {
    tl.fromTo(rep, { x: REP_ENTER, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: OUT }, t + 0.06);
    if (!mobile) {
      tl.fromTo(
        rep,
        { y: 0 },
        { keyframes: { y: [0, -3, 0, -3, 0, -2, 0] }, duration: 0.3, ease: "none" },
        t + 0.06,
      );
    }
  }
  appear(one(".rail-dial__track"), t + 0.3, 0.06);
  draw(one(".rail-dial__arc"), t + 0.32, 0.16);
  appear(all(".rail-dial__head, .rail-dial__pin"), t + 0.46, 0.04);
  appear(one(".rail-dial .rail-label"), t + 0.34, 0.08, { x: -6 });
  all(".rail-chip").forEach((chip, i) => {
    tl.from(
      chip,
      { opacity: 0, x: 26, y: 8, duration: 0.09, ease: OUT },
      t + 0.48 + i * 0.07,
    );
  });
  appear(one(".rail-noted"), t + 0.66, 0.05, { scale: 0, transformOrigin: "50% 50%" });

  /* ================= 03 Supply, settle, resolve ================= */
  t = STEPS[2][0];
  tl.addLabel("s3", t);
  tl.to(grp(1), { opacity: DIM, duration: 0.1, ease: "power1.out" }, t);

  // The carton comes down the aisle to the stack that sold through, and the
  // stack is whole again.
  const carton = one(".rail-carton");
  const cx = slotCx(THIN.slot) - 22;
  const cy = BOARDS[THIN.shelf] - THIN.keep * SHIRT.step - 44;
  if (carton) {
    tl.set(carton, { x: VB_W + 30, y: cy, opacity: 1 }, t + 0.02);
    tl.to(carton, { x: cx, duration: 0.24, ease: OUT }, t + 0.02);
    tl.to(carton, { opacity: 0, y: cy + 8, duration: 0.05, ease: "power1.in" }, t + 0.3);
  }
  tl.fromTo(
    sells.slice().reverse(),
    { y: -14, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.06, ease: OUT, stagger: 0.04, immediateRender: false },
    t + 0.28,
  );
  const rows = all(".rail-status");
  const row = (i: number, at: number) => {
    const r = rows[i];
    if (!r) return;
    appear(r.querySelector(".rail-status__icon"), at, 0.06, { scale: 0.6, transformOrigin: "50% 50%" });
    appear(r.querySelector(".rail-label"), at + 0.03, 0.07, { x: -8 });
    draw(r.querySelector(".rail-tick"), at + 0.1, 0.05);
  };
  row(0, t + 0.33);

  // The credit note leaves the rep's clipboard and files itself.
  const slip = one(".rail-slip");
  if (slip) {
    tl.set(slip, { x: REP.x - 42, y: REP.head + 46, opacity: 1, scale: 1 }, t + 0.36);
    tl.to(slip, { x: STATUS.x0 + 2, y: statusY(1) + 1, scale: 0.85, duration: 0.18, ease: IN_OUT }, t + 0.36);
    tl.to(slip, { opacity: 0, duration: 0.03 }, t + 0.54);
  }
  row(1, t + 0.52);

  // A grievance goes up on a stack and comes down in one beat.
  const flag = one(".rail-flag");
  if (flag) {
    tl.fromTo(
      flag,
      { opacity: 0, scaleY: 0.2, transformOrigin: "0% 100%" },
      { opacity: 1, scaleY: 1, duration: 0.06, ease: OUT },
      t + 0.6,
    );
    tl.to(flag, { opacity: 0, scaleX: 0.1, duration: 0.04, ease: "power2.in" }, t + 0.7);
  }
  draw(one(".rail-tick--flag"), t + 0.72, 0.05);
  row(2, t + 0.7);

  /* ================= 04 Settle the books ================= */
  t = STEPS[3][0];
  tl.addLabel("s4", t);
  tl.to([grp(2), one(".rail-base")], { opacity: (i) => (i ? 0.45 : DIM), duration: 0.1, ease: "power1.out" }, t);
  const ledger = one(".rail-ledger");
  appear(ledger, t, 0.14, { y: 24 });
  tl.to(one(".rail-form__ledger"), { opacity: 0, duration: 0.08 }, t + 0.02);
  all(".rail-ledger__row").forEach((r, i) => {
    const at = t + 0.12 + i * 0.09;
    appear(r.querySelector(".rail-label"), at, 0.06, { x: -6 });
    tl.from(r.querySelector(".rail-ledger__bar"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.1, ease: OUT }, at + 0.02);
    draw(r.querySelector(".rail-tick"), at + 0.08, 0.05);
    draw(r.querySelector(".rail-ledger__rule"), at, 0.1);
  });
  draw(one(".rail-double"), t + 0.33, 0.1);
  appear(one(".rail-label--foot"), t + 0.4, 0.06);

  // Capital keeps rotating: the coin lands and the ring turns with the
  // scroll from here to the end of the section.
  appear(one(".rail-coin"), t + 0.22, 0.08, { scale: 0.6, transformOrigin: "50% 50%" });
  appear(one(".rail-coin__mark"), t + 0.26, 0.06);
  draw(one(".rail-ring__arc"), t + 0.28, 0.14);
  appear(one(".rail-ring__head"), t + 0.4, 0.03);
  appear(one(".rail-capital .rail-label"), t + 0.34, 0.08, { y: 6 });
  const ring = one(".rail-ring");
  if (ring) {
    tl.fromTo(
      ring,
      { rotation: -150, svgOrigin: `${COIN.cx} ${COIN.cy}` },
      { rotation: 210, ease: "none", duration: TOTAL - (t + 0.28) },
      t + 0.28,
    );
  }

  /* ================= summary: the whole counter at once ================= */
  tl.to(
    [grp(0), grp(1), grp(2), one(".rail-base")],
    { opacity: 1, duration: TOTAL - SUMMARY, ease: "power1.inOut" },
    SUMMARY,
  );
  tl.set({}, {}, TOTAL);
  return tl;
}
