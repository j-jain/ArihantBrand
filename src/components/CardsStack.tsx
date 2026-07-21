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

/** A stack of sticky cards: on desktop every card pins on the SAME line as the
 *  heading rail beside it (`--stack-top`) and the previous cards tuck back (a
 *  slight scale) as the next scrolls over them, scrubbed to scroll. Depth reads
 *  from the tuck alone — the tucked card scales about its own top edge, so it
 *  peeks out at the sides rather than above. Cards stay fully opaque
 *  throughout so the top one always occludes the ones still pinned behind it.
 *  Mobile and reduced motion render a plain, gapped column with no sticky and
 *  no transforms, so nothing depends on an animation that isn't running. The
 *  tuck transforms are applied only from JS. */
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
            // Scale only, never opacity: the cards are sticky and stay stacked,
            // so a translucent card would show the text of the card pinned
            // behind it straight through.
            gsap.to(card, {
              scale: 0.965,
              transformOrigin: "50% 0%",
              ease: "none",
              scrollTrigger: {
                trigger: nextCard,
                start: "top 85%",
                end: "top top+=96",
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
          style={{ zIndex: i + 1 }}
        >
          <span className="stack__mark" aria-hidden="true" />
          <h3 className="t-h3 stack__title">{item.title}</h3>
          <p className="t-body stack__text">{item.text}</p>
        </article>
      ))}
    </div>
  );
}
