"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface StackItem {
  title: string;
  text: string;
}

interface CardsStackProps {
  items: StackItem[];
  /** The section heading. Rendered in the rail beside the deck on desktop and
   *  above it on a phone; it sits INSIDE the pinned element, so it must not
   *  wrap the deck in a transformed ancestor (a Reveal around the heading is
   *  fine, a Reveal around this component is not). */
  heading: ReactNode;
}

/* Timeline units are viewport heights: scroll maps linearly onto the deck. */
const ENTER = { desktop: 0.55, mobile: 0.5 }; // per incoming card
const DWELL = { desktop: 0.5, mobile: 0.4 }; // gathered deck holds still
const FADE = 0.3; // fraction of a card's segment spent fading in
const START_SCALE = 0.96; // an incoming card grows from 0.96 to 1 as it lands
const LIFT_MIN = 2.5; // an incoming card starts at least 2.5x its overlap below its slot
const SCALE_STEP = 0.035; // settle-back per card resting on top
const MAX_DEPTH = 3;
/** How much of each card stays visible above the one that lands on it, in
 *  rem (the site scales through the root font size). Change round 8: a sliver
 *  of edge, so the deck reads as cards stacked on cards. It used to be the
 *  card's whole heading strip, which read as a list. */
const PEEK_REM = { desktop: 0.9, mobile: 0.65 };
/** The least a deck card stands, in rem: the round 8 copy is short, and a
 *  card only as tall as two lines read as a strip, not a card. */
const CARD_MIN_REM = { desktop: 14, mobile: 10 };
const HYSTERESIS = 4; // px, so a deck right at the fit limit does not flicker
const FLIP_DELAY = 200; // ms before switching between deck and static column

const RM = "(prefers-reduced-motion: reduce)";
const MOB = "(prefers-reduced-motion: no-preference) and (max-width: 767px)";
const DESK = "(prefers-reduced-motion: no-preference) and (min-width: 768px)";

/** "Why us?" as a pinned deck of cards (change round 3).
 *
 *  The server renders a plain, readable column: that is also what no-JS,
 *  reduced motion and any viewport too short for the gathered deck get. In the
 *  motion branches JS switches the deck into stage mode (`data-deck`): the
 *  section (desktop) or the deck column (phone) pins and holds one viewport
 *  tall, card 1 rests in place, and cards 2 to 4 slide up one at a time and
 *  land a sliver below the card before (PEEK_REM), covering it all but its top
 *  edge, like cards stacked on a table (change round 8; until then each card
 *  kept its whole heading in view). A card beneath settles back (a scale about
 *  its top edge, so the edges narrow going back, and a tint toward
 *  paper-shade) only once an incoming card actually overlaps it. After a dwell the pin releases and the rail and the gathered
 *  deck scroll away together as one rigid piece: nothing is sticky per card, so
 *  nothing can cross over or un-stack on the way out.
 *
 *  The timeline tweens unitless proxies ({p, o} per card); one `render()`
 *  turns them plus the measured geometry into each card's y, scale, opacity
 *  and depth, so no two tweens ever fight over a card's transform. The pin's
 *  geometry is CSS (svh) and its distance is a multiple of the viewport, so
 *  re-measuring cards never moves a trigger and never needs a global refresh;
 *  the only refresh happens when the fit result flips. */
export function CardsStack({ items, heading }: CardsStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const rail = root.querySelector<HTMLElement>(".stack-rail");
      const col = root.querySelector<HTMLElement>(".stack-col");
      const deck = root.querySelector<HTMLElement>(".stack");
      const probe = root.querySelector<HTMLElement>(".stack-probe");
      if (!rail || !col || !deck || !probe) return;
      const cards = Array.from(deck.querySelectorAll<HTMLElement>(".stack__card"));
      const n = cards.length;
      if (n < 2) return;
      const parts = cards.map((card) => ({
        title: card.querySelector<HTMLElement>(".stack__title"),
        text: card.querySelector<HTMLElement>(".stack__text"),
      }));

      const mm = gsap.matchMedia(rootRef);

      mm.add({ reduced: RM, mobile: MOB, desktop: DESK }, (ctx) => {
        const { reduced, mobile } = ctx.conditions as Record<string, boolean>;
        if (reduced) return;

        const pinEl = mobile ? col : root;
        const enter = mobile ? ENTER.mobile : ENTER.desktop;
        const dwell = mobile ? DWELL.mobile : DWELL.desktop;
        // Lenis already smooths a fine-pointer desktop; touch gets a light scrub.
        const smooth = !mobile && window.matchMedia("(pointer: fine)").matches;

        const state = cards.map((_, i) => ({ p: i ? 0 : 1, o: i ? 0 : 1 }));
        const g = {
          slot: new Array<number>(n).fill(0),
          H: new Array<number>(n).fill(0),
          ov: new Array<number>(n).fill(0),
          y0: new Array<number>(n).fill(0),
          fits: false,
        };
        let tl: gsap.core.Timeline | null = null;
        let raf = 0;
        let flipTimer = 0;

        /** Card geometry from the cards' own boxes (card width is the same in
         *  both modes, so the numbers do not depend on the mode). */
        const measure = () => {
          const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
          const peek = Math.round((mobile ? PEEK_REM.mobile : PEEK_REM.desktop) * rootPx);
          const cardMin = (mobile ? CARD_MIN_REM.mobile : CARD_MIN_REM.desktop) * rootPx;
          // In deck mode the text sits at the card's foot (margin-top: auto,
          // its gap as padding-top), so its position says nothing about the
          // content's height: add the parts up instead.
          const deckMode = root.hasAttribute("data-deck");
          const strips: number[] = [];
          const nat: number[] = [];
          cards.forEach((card, i) => {
            const cs = getComputedStyle(card);
            const bt = parseFloat(cs.borderTopWidth) || 0;
            const bb = parseFloat(cs.borderBottomWidth) || 0;
            const pb = parseFloat(cs.paddingBottom) || 0;
            const { title, text } = parts[i];
            const titleEnd = title ? title.offsetTop + title.offsetHeight : 0;
            const ts = text ? getComputedStyle(text) : null;
            const textPad = ts ? parseFloat(ts.paddingTop) || 0 : 0;
            const gap = ts ? (deckMode ? textPad : parseFloat(ts.marginTop) || 0) : 0;
            const textH = text ? text.offsetHeight - (deckMode ? textPad : 0) : 0;
            strips[i] = peek;
            nat[i] = Math.ceil(Math.max(bt + titleEnd + gap + textH + pb + bb, cardMin));
          });

          // Coverage rule: each card is at least tall enough to hide the part
          // of the card beneath it that its strip does not show.
          g.H[0] = nat[0];
          g.slot[0] = 0;
          g.ov[0] = 0;
          for (let k = 1; k < n; k++) {
            g.H[k] = Math.max(nat[k], g.H[k - 1] - strips[k - 1]);
            g.slot[k] = g.slot[k - 1] + strips[k - 1];
            g.ov[k] = g.H[k - 1] - strips[k - 1];
          }
          const deckH = g.slot[n - 1] + g.H[n - 1];
          const rowH = mobile ? deckH : Math.max(rail.offsetHeight, deckH);
          const avail = probe.offsetHeight;
          g.fits = rowH <= avail + (tl ? HYSTERESIS : 0);

          deck.style.setProperty("--deck-h", `${deckH}px`);
          cards.forEach((card, k) => {
            card.style.setProperty("--slot", `${g.slot[k]}px`);
            card.style.setProperty("--cover-h", `${g.H[k]}px`);
          });

          if (root.hasAttribute("data-deck")) {
            const stageH = pinEl.offsetHeight;
            const deckTop =
              deck.getBoundingClientRect().top - pinEl.getBoundingClientRect().top;
            for (let k = 0; k < n; k++) {
              // Each incoming card starts at (or below) the bottom of the stage,
              // and far enough down that it is fully opaque before it touches
              // the card it lands on.
              g.y0[k] = k ? Math.max(stageH - deckTop - g.slot[k], LIFT_MIN * g.ov[k]) : 0;
            }
          }
        };

        /** The single writer of every card's transform, opacity and depth.
         *  Plain style writes, not gsap.set(): this runs on every scrub frame,
         *  and each gsap.set() is a Tween that the matchMedia context keeps
         *  until revert, so set() here grew memory with every pass. */
        const render = () => {
          if (!tl) return;
          let above = 0;
          for (let i = n - 1; i >= 0; i--) {
            const { p, o } = state[i];
            const lift = i ? g.y0[i] * (1 - p) : 0;
            const depth = Math.min(above, MAX_DEPTH);
            const scale =
              (i ? START_SCALE + (1 - START_SCALE) * p : 1) * (1 - SCALE_STEP * depth);
            const style = cards[i].style;
            style.transform = `translate3d(0, ${lift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
            style.opacity = String(o);
            style.setProperty("--stack-depth", Math.min(depth, 1).toFixed(3));
            // How far card i has covered card i-1: zero until its top edge
            // crosses card i-1's bottom, so nothing settles back early.
            if (i) {
              above +=
                g.ov[i] > 0 ? gsap.utils.clamp(0, 1, (g.ov[i] - lift) / g.ov[i]) : p;
            }
          }
        };

        const build = () => {
          root.setAttribute("data-deck", "");
          measure();
          cards.forEach((card) => {
            card.style.transformOrigin = "50% 0%";
          });
          tl = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: render,
            scrollTrigger: {
              trigger: pinEl,
              pin: pinEl,
              pinSpacing: true,
              start: () => "bottom bottom",
              end: () =>
                `+=${Math.round(window.innerHeight * (enter * (n - 1) + dwell))}`,
              anticipatePin: 1,
              invalidateOnRefresh: false,
              scrub: smooth ? true : 0.3,
            },
          });
          for (let k = 1; k < n; k++) {
            const at = (k - 1) * enter;
            tl.fromTo(state[k], { p: 0 }, { p: 1, duration: enter, ease: "power2.out" }, at);
            tl.fromTo(state[k], { o: 0 }, { o: 1, duration: enter * FADE }, at);
          }
          tl.to({}, { duration: dwell }, (n - 1) * enter);
          render();
        };

        const teardown = () => {
          if (tl) {
            tl.scrollTrigger?.kill(true);
            tl.kill();
            tl = null;
          }
          cards.forEach((card) => {
            card.style.removeProperty("transform");
            card.style.removeProperty("transform-origin");
            card.style.removeProperty("opacity");
            card.style.removeProperty("--stack-depth");
          });
          root.removeAttribute("data-deck");
          state.forEach((s, i) => {
            s.p = i ? 0 : 1;
            s.o = i ? 0 : 1;
          });
        };

        const reconcile = () => {
          if (g.fits === Boolean(tl)) return;
          window.clearTimeout(flipTimer);
          flipTimer = window.setTimeout(() => {
            measure();
            if (g.fits === Boolean(tl)) return;
            if (g.fits) build();
            else teardown();
            ScrollTrigger.sort();
            ScrollTrigger.refresh();
          }, FLIP_DELAY);
        };

        const update = () => {
          measure();
          render();
          reconcile();
        };

        measure();
        if (g.fits) build();

        // Re-measure when the copy reflows (font swap, a heading reverting
        // from its split, a Studio edit). Observing the text boxes, not the
        // cards, avoids a loop with the --cover-h writes.
        const ro = new ResizeObserver(() => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(update);
        });
        parts.forEach(({ title, text }) => {
          if (title) ro.observe(title);
          if (text) ro.observe(text);
        });
        if (!mobile) ro.observe(rail);
        ScrollTrigger.addEventListener("refresh", update);

        return () => {
          ScrollTrigger.removeEventListener("refresh", update);
          ro.disconnect();
          cancelAnimationFrame(raf);
          window.clearTimeout(flipTimer);
          teardown();
          deck.style.removeProperty("--deck-h");
          cards.forEach((card) => {
            card.style.removeProperty("--slot");
            card.style.removeProperty("--cover-h");
          });
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [items], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="stack-section section-pad">
      <div className="container-site">
        <div className="stack-stage m-flow grid gap-x-12 gap-y-10 md:grid-cols-12">
          <div className="stack-rail md:col-span-5">{heading}</div>
          <div className="stack-col md:col-span-7">
            <div className="stack">
              {items.map((item, i) => (
                <article key={item.title} className="stack__card" style={{ zIndex: i + 1 }}>
                  <h3 className="stack__title">
                    <span className="stack__mark" aria-hidden="true" />
                    {item.title}
                  </h3>
                  <p className="t-body stack__text">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Resolves the CSS fit budget (--deck-avail) to pixels for the fit guard. */}
      <span className="stack-probe" aria-hidden="true" />
    </div>
  );
}
