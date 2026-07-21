"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";

interface ValueItem {
  title: string;
  text: string;
}

interface ValueImage {
  src: string;
  alt: string;
}

interface ValuePanelsProps {
  heading: string;
  lead?: string;
  items: ValueItem[];
  /** One photograph per item, in order. Extra items fall back to the last one. */
  images: ValueImage[];
}

/** The values band: a heading rail beside a row of photographic panels, one per
 *  operating rule. The active panel opens to show its text while the others hold
 *  as title-only columns, so the whole section sits inside a single screen with
 *  nothing left over. Hover, click, focus and the arrow keys all move the active
 *  panel.
 *
 *  The expanding layout is switched on from JS (`.vp-band--on`) and only on
 *  desktop fine pointers with motion allowed. Everything else — including no-JS,
 *  mobile, and reduced motion — keeps the server render: a plain stacked column
 *  with every title and every body paragraph visible and no height cap. Nothing
 *  is ever collapsed unless there is a live control to open it. */
export function ValuePanels({ heading, lead, items, images }: ValuePanelsProps) {
  const ref = useRef<HTMLElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const mm = gsap.matchMedia(ref);
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
        () => {
          root.classList.add("vp-band--on");
          setEnhanced(true);
          return () => {
            root.classList.remove("vp-band--on");
            setEnhanced(false);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [items.length] },
  );

  const move = (delta: number) =>
    setActive((i) => (i + delta + items.length) % items.length);

  /** Panel controls exist only once the panels can actually collapse. */
  const panelProps = (index: number) =>
    enhanced
      ? {
          role: "button" as const,
          tabIndex: 0,
          "aria-expanded": index === active,
          onClick: () => setActive(index),
          onFocus: () => setActive(index),
          onPointerEnter: () => setActive(index),
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActive(index);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }
          },
        }
      : {};

  return (
    <section ref={ref} className="on-dark vp-band">
      <div className="container-site vp-band__inner">
        <div className="vp">
          <div className="vp__rail">
            <h2 className="t-h2 text-on-charcoal">{heading}</h2>
            <span aria-hidden="true" className="vp__rule" />
            {lead ? <p className="t-lead measure vp__lead">{lead}</p> : null}
            <p className="vp__counter" aria-hidden="true">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </p>
          </div>

          <ul className="vp__panels">
            {items.map((item, index) => {
              const image = images[index] ?? images[images.length - 1];
              return (
                <li
                  key={item.title}
                  className="vp__panel"
                  data-active={index === active}
                >
                  <article className="vp__face" {...panelProps(index)}>
                    {image ? (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(max-width: 1023px) 100vw, 30vw"
                        className="vp__img"
                      />
                    ) : null}
                    <span aria-hidden="true" className="vp__scrim" />
                    <div className="vp__body">
                      <span aria-hidden="true" className="vp__index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="vp__title">{item.title}</h3>
                      <p className="vp__text">{item.text}</p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
