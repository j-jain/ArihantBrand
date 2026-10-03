"use client";

import { useRef } from "react";

import { ParallaxImage } from "@/components";
import { gsap, useGSAP } from "@/lib/gsap";

interface Photo {
  src: string;
  alt: string;
}

interface FeatureHeroMediaProps {
  /** The wide photograph, run to the screen's right edge. */
  main: Photo;
  /** The smaller photograph laid over its lower-left corner on a keyline. */
  inset: Photo;
  /** A short caption under the inset, only when the photograph itself says
   *  what it shows (the fair's own banner, say). */
  caption?: string;
  /** The inset's frame. Landscape 4/3 by default; a portrait ratio (Marketing's
   *  trophy, change round 7) sets a narrower, taller inset. */
  insetRatio?: string;
}

/**
 * The Marketing and Apparels heroes' photographs (change round 6): one wide
 * photograph that runs from the copy to the right edge of the screen at the
 * hero's full height, and a smaller one laid over its lower-left corner on a
 * paper keyline, like a print on a print.
 *
 * Motion is layered on separate elements, so nothing fights:
 *  - HeroIntro owns the entry: each [data-hero-clip] opens out of a mask from
 *    the bottom edge while its picture settles from a push in, inside the
 *    hero's one load timeline;
 *  - this component owns the scroll (fine pointers, 1024px and up): the wide
 *    picture pans slowly inside its frame (`.feature-media__pan`, never the
 *    image HeroIntro is settling) and the inset drifts the other way, so the
 *    two part a little as the hero leaves;
 *  - ParallaxImage's `tilt` owns the inset frame's pointer tilt.
 * Phones get the wide photograph full-bleed at 4:3 with the inset on its
 * corner (mobile.css section 22), and reduced motion gets them as served.
 */
export function FeatureHeroMedia({
  main,
  inset,
  caption,
  insetRatio = "4 / 3",
}: FeatureHeroMediaProps) {
  const [w, h] = insetRatio.split("/").map(Number);
  const portrait = h > w;
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const pan = root.querySelector<HTMLElement>(".feature-media__pan");
      const card = root.querySelector<HTMLElement>(".feature-media__inset");
      const mm = gsap.matchMedia(ref);
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
        () => {
          const scroll = {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          };
          if (pan) gsap.fromTo(pan, { yPercent: 0 }, { yPercent: 7, ease: "none", scrollTrigger: scroll });
          if (card) gsap.to(card, { yPercent: -16, ease: "none", scrollTrigger: { ...scroll } });
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="feature-media">
      <div data-hero-clip className="feature-media__main">
        <div className="feature-media__pan">
          <ParallaxImage
            src={main.src}
            alt={main.alt}
            fillHeight
            parallax={false}
            priority
            sizes="(max-width: 767px) 100vw, 46vw"
            className="feature-media__frame"
          />
        </div>
      </div>
      <figure
        className={
          portrait ? "feature-media__inset feature-media__inset--portrait" : "feature-media__inset"
        }
      >
        <div data-hero-clip className="feature-media__keyline">
          <ParallaxImage
            src={inset.src}
            alt={inset.alt}
            ratio={insetRatio}
            parallax={false}
            tilt
            priority
            sizes={portrait ? "(max-width: 767px) 34vw, 12rem" : "(max-width: 767px) 45vw, 16rem"}
            className="feature-media__inset-frame"
          />
        </div>
        {caption ? (
          <figcaption data-hero-reveal className="feature-media__caption">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
