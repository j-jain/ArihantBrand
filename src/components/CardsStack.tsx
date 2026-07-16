"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface StackItem {
  title: string;
  text: string;
}

interface CardsStackProps {
  items: StackItem[];
}

/** A stack of sticky cards: on desktop each card pins under the header offset
 *  and the previous cards tuck back (a slight scale and fade) as the
 *  next scrolls over them, scrubbed to scroll. Mobile and reduced motion render
 *  a plain, gapped column with no sticky and no transforms, so nothing depends
 *  on an animation that isn't running. The tuck transforms are applied only
 *  from JS. */
export function CardsStack({ items }: CardsStackProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const cards = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".stack__card"),
      );
      if (cards.length < 2) return;

      const mm = gsap.matchMedia(ref);
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        () => {
          cards.forEach((card, i) => {
            if (i === cards.length - 1) return;
            const nextCard = cards[i + 1];
            gsap.to(card, {
              scale: 0.965,
              autoAlpha: 0.45,
              transformOrigin: "50% 0%",
              ease: "none",
              scrollTrigger: {
                trigger: nextCard,
                start: "top bottom",
                end: `top top+=${96 + i * 12}`,
                scrub: true,
              },
            });
          });
        },
      );

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
          style={{
            top: `calc(var(--stack-top, 96px) + ${i * 12}px)`,
            zIndex: i + 1,
          }}
        >
          <span className="stack__mark" aria-hidden="true" />
          <h3 className="t-h3 stack__title">{item.title}</h3>
          <p className="t-body stack__text">{item.text}</p>
        </article>
      ))}
    </div>
  );
}
