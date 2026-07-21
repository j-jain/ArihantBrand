"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";
import type { RecognitionPhoto } from "@/content/types";

interface CardFanProps {
  photos: RecognitionPhoto[];
  /** Accessible name for the fan as a group (it is a single composite widget). */
  label: string;
}

/** Base fan angle between neighbouring cards, and the wider angle the fan opens
 *  to while the pointer is over it. The pivot sits well below the stage so the
 *  arc is shallow and the hand spreads wide rather than tipping over. */
const BASE_STEP = 7;
const SPREAD_STEP = 8.5;
const PIVOT = "50% 260%";

/** A cabinet of photographs dealt out like a hand of cards: they arc around a
 *  pivot below the stage, settle in with an elastic entrance the first time the
 *  section is scrolled to, open wider under the pointer, and rotate one card at
 *  a time through a circular pager that always brings the active card upright
 *  and to the front.
 *
 *  The fan is a pure enhancement. The server renders (and mobile, coarse
 *  pointers and reduced motion keep) the plain captioned grid this markup is
 *  written as — every photo and caption visible, no transforms. The arc layout
 *  is switched on only from JS (`.fan--on`), and every transform is applied from
 *  JS too, so no photo is ever stranded behind an animation that did not run. */
export function CardFan({ photos, label }: CardFanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [fanned, setFanned] = useState(false);
  const [active, setActive] = useState(0);
  // True only while the mobile snap rail is the live layout (see .fan__stage in
  // mobile.css). A scroll container whose children are plain figures needs to be
  // focusable itself, but adding that tab stop to the static desktop grid would
  // be a focus trap for nothing — so it is driven off the same media query.
  const [railed, setRailed] = useState(false);

  // Read by the GSAP layout function, which lives outside the React render.
  const activeRef = useRef(0);
  const spreadRef = useRef(false);
  const hoverRef = useRef(-1);
  const layoutRef = useRef<(() => void) | null>(null);

  const count = photos.length;

  const select = (index: number) => {
    const next = ((index % count) + count) % count;
    activeRef.current = next;
    setActive(next);
    layoutRef.current?.();
  };

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const cards = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".fan__card"),
      );
      if (cards.length < 2) return;

      const mm = gsap.matchMedia(ref);

      mm.add("(max-width: 767px)", () => {
        setRailed(true);
        return () => setRailed(false);
      });

      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
        () => {
          root.classList.add("fan--on");
          setFanned(true);

          /** Shortest signed distance from the active card, so the fan wraps
           *  rather than unrolling when the pager passes the ends. */
          const offsetOf = (i: number) => {
            const d = (((i - activeRef.current) % count) + count) % count;
            return d > count / 2 ? d - count : d;
          };

          const restingOpacity = (d: number) =>
            Math.max(0.7, 1 - Math.abs(d) * 0.06);

          /** Resting arc for the current active card. `animate: false` writes it
           *  straight to the DOM, which is what the fan is laid out to at all
           *  times — no photo ever depends on a tween having run. */
          const layout = (animate = true) => {
            const step = spreadRef.current ? SPREAD_STEP : BASE_STEP;
            cards.forEach((card, i) => {
              const d = offsetOf(i);
              const isActive = d === 0;
              const isHovered = hoverRef.current === i;
              // Stacking snaps: the card being brought forward must be in front
              // for the whole move, not fade up through the others.
              gsap.set(card, { zIndex: count - Math.abs(d) });
              const to = {
                rotate: d * step,
                y: isActive ? -20 : isHovered ? -12 : 0,
                scale: isActive ? 1 : isHovered ? 0.96 : 0.92,
                opacity: isActive ? 1 : restingOpacity(d),
              };
              if (animate) {
                gsap.to(card, { ...to, duration: 0.55, ease: EASE, overwrite: "auto" });
              } else {
                gsap.set(card, to);
              }
            });
          };
          layoutRef.current = () => layout(true);

          gsap.set(cards, { transformOrigin: PIVOT });
          layout(false);

          // Entrance only when the cabinet is still below the fold, and with
          // `immediateRender: false` so the collapsed stack is written at the
          // moment the trigger fires rather than at setup — the fan is never
          // left holding a hidden state waiting for a tween.
          const rect = root.getBoundingClientRect();
          const onScreen =
            rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
          const middle = (cards.length - 1) / 2;
          let trigger: ScrollTrigger | null = null;
          if (!onScreen) {
            trigger = ScrollTrigger.create({
              trigger: root,
              start: "top 80%",
              once: true,
              onEnter: () => {
                cards.forEach((card, i) => {
                  const d = offsetOf(i);
                  gsap.fromTo(
                    card,
                    { rotate: 0, y: 64, scale: 0.9, opacity: 0 },
                    {
                      rotate: d * BASE_STEP,
                      y: d === 0 ? -20 : 0,
                      scale: d === 0 ? 1 : 0.92,
                      opacity: d === 0 ? 1 : restingOpacity(d),
                      duration: 1.15,
                      ease: "elastic.out(1, 0.62)",
                      delay: Math.abs(i - middle) * 0.05,
                      immediateRender: false,
                    },
                  );
                });
              },
            });
          }

          return () => {
            trigger?.kill();
            layoutRef.current = null;
            gsap.killTweensOf(cards);
            gsap.set(cards, { clearProps: "all" });
            root.classList.remove("fan--on");
            setFanned(false);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [count] },
  );

  const setSpread = (on: boolean) => {
    spreadRef.current = on;
    if (!on) hoverRef.current = -1;
    layoutRef.current?.();
  };

  const setHovered = (index: number) => {
    hoverRef.current = index;
    layoutRef.current?.();
  };

  /** Card-level interaction exists only once the fan is live; in the static grid
   *  the cards stay plain figures with their own captions. */
  const cardProps = (index: number) =>
    fanned
      ? {
          role: "button" as const,
          tabIndex: 0,
          "aria-pressed": index === active,
          onClick: () => select(index),
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              select(index);
            }
          },
          onPointerEnter: () => setHovered(index),
        }
      : {};

  return (
    <div ref={ref} className="fan">
      <ul
        className="fan__stage m-rail"
        aria-label={label}
        tabIndex={railed ? 0 : undefined}
        onPointerEnter={fanned ? () => setSpread(true) : undefined}
        onPointerLeave={fanned ? () => setSpread(false) : undefined}
        onKeyDown={
          fanned
            ? (event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  select(active + 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  select(active - 1);
                }
              }
            : undefined
        }
      >
        {photos.map((photo, index) => (
          <li key={photo.src} className="fan__item">
            <figure className="fan__card" {...cardProps(index)}>
              <span className="fan__frame">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 16rem"
                  className="fan__img"
                />
              </span>
              <figcaption className="fan__cap">{photo.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="fan__controls">
        <button
          type="button"
          className="fan__nav"
          onClick={() => select(active - 1)}
          aria-label="Previous item in the cabinet"
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <p className="fan__readout">
          <span className="fan__count">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <span className="fan__active-cap">{photos[active]?.caption}</span>
        </p>
        <button
          type="button"
          className="fan__nav"
          onClick={() => select(active + 1)}
          aria-label="Next item in the cabinet"
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    </div>
  );
}
