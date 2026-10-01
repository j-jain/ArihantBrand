"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface StackItem {
  title: string;
  text: string;
}

interface CardsStackProps {
  items: StackItem[];
}

/** A deck of sticky cards laid one on top of the next (change round 2).
 *
 *  Each card pins lower than the card before it by exactly the height of that
 *  card's heading strip (its top padding plus its heading, measured, since the
 *  headings run one to three lines), so when the deck has gathered the whole
 *  heading of every earlier card still shows above the next one: cards placed
 *  on a table, not cards hidden behind each other. CSS carries a uniform-step
 *  fallback (`--stack-step`) for the first paint and for no-JS.
 *
 *  As each new card lands, every card beneath it settles back a little further
 *  (a small scale about its own top edge, and a slight shift of its ground
 *  toward paper-shade), so depth reads from the whole stack rather than only
 *  the card directly behind.
 *
 *  Depth is computed from where each card actually sits, not from guessed
 *  scroll offsets: a card's "landed" progress is how far it has travelled from
 *  the lower part of the viewport to its own sticky line, read from its live
 *  position and its computed `top`. That keeps the effect correct at every
 *  root size, header height and breakpoint without a single hard-coded pixel.
 *
 *  Cards stay opaque throughout, so the card on top always hides the body text
 *  of the cards beneath it. Reduced motion gets a plain gapped column (CSS) and
 *  no listeners; every transform here is applied only from JS. */
export function CardsStack({ items }: CardsStackProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Measure the heading strips and write the cascade as CSS variables. Runs at
  // every width (the phone deck cascades too) and under reduced motion, where
  // the static column simply ignores the variables.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".stack__card"));
    if (cards.length < 2) return;

    let frame = 0;
    const layout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // A card's strip runs from its top edge to halfway between its
        // heading and its body text: the whole heading shows, none of the
        // body does, at whatever size the root and the breakpoint set.
        const strips = cards.map((card) => {
          const title = card.querySelector<HTMLElement>(".stack__title");
          const text = card.querySelector<HTMLElement>(".stack__text");
          if (!title) return 0;
          const titleBottom = title.offsetTop + title.offsetHeight;
          const gap = text ? text.offsetTop - titleBottom : 0;
          return titleBottom + gap * 0.55;
        });
        let offset = 0;
        cards.forEach((card, i) => {
          card.style.setProperty("--stack-offset", `${offset}px`);
          offset += strips[i];
        });
        ScrollTrigger.refresh();
      });
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(root);
    document.fonts?.ready.then(layout);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const cards = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".stack__card"),
      );
      if (cards.length < 2) return;

      const mm = gsap.matchMedia(ref);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const SCALE_STEP = 0.025; // per card resting on top
        const MAX_DEPTH = 3;

        const update = () => {
          const vh = window.innerHeight;
          // How far each card has landed: 0 while it is still low in the
          // viewport, 1 once it sits on its sticky line.
          const landed = cards.map((card) => {
            const top = card.getBoundingClientRect().top;
            const stickyTop = parseFloat(getComputedStyle(card).top) || 0;
            const start = vh * 0.85;
            if (start <= stickyTop) return top <= stickyTop ? 1 : 0;
            return gsap.utils.clamp(0, 1, (start - top) / (start - stickyTop));
          });

          cards.forEach((card, i) => {
            let depth = 0;
            for (let j = i + 1; j < cards.length; j++) depth += landed[j];
            depth = Math.min(depth, MAX_DEPTH);
            gsap.set(card, {
              scale: 1 - depth * SCALE_STEP,
              transformOrigin: "50% 0%",
              "--stack-depth": Math.min(depth, 1),
            });
          });
        };

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onUpdate: update,
          onRefresh: update,
        });
        update();

        return () => {
          trigger.kill();
          gsap.set(cards, { clearProps: "transform,transformOrigin,--stack-depth" });
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="stack">
      {items.map((item, i) => (
        <article
          key={item.title}
          className="stack__card"
          style={{ zIndex: i + 1, ["--i" as string]: i }}
        >
          <h3 className="stack__title">
            <span className="stack__mark" aria-hidden="true" />
            {item.title}
          </h3>
          <p className="t-body stack__text">{item.text}</p>
        </article>
      ))}
    </div>
  );
}
