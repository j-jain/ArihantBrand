"use client";

import { useRef } from "react";

import { ParallaxImage } from "@/components";
import { gsap, useGSAP } from "@/lib/gsap";

interface Photo {
  src: string;
  alt: string;
}

interface RetailHeroPhotosProps {
  /** The store aisle (photoSlots.retailInterior): the back frame. */
  interior: Photo;
  /** The counter under the store's sign (photoSlots.retailStorefront): the
   *  front frame. Both from the Goalpara shoot since change round 11. */
  storefront: Photo;
}

/**
 * The retail hero's two real photographs, set as an offset stack (change
 * round 5): the store aisle behind, the counter under the lit sign in front
 * on a paper keyline. The stack keeps its rem cap (atlas.css) so the hero
 * still fits one screen; the ~400px files it was sized for are gone since
 * change round 11.
 *
 * Motion is layered on separate elements so nothing fights:
 *  - HeroIntro owns the entry (each [data-hero-clip] opens out of a mask while
 *    its picture settles), as part of the hero's one load timeline;
 *  - ParallaxImage's `tilt` owns each frame's pointer tilt (fine pointers,
 *    1024px and up);
 *  - this component owns one scroll drift on the back frame's outer wrapper,
 *    so the two photographs part a little as the hero scrolls away.
 * Phones get a plain two-up row (mobile.css section 18), and reduced motion
 * gets the photographs as served.
 */
export function RetailHeroPhotos({ interior, storefront }: RetailHeroPhotosProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      const back = root?.querySelector<HTMLElement>(".retail-stack__back");
      if (!root || !back) return;
      const mm = gsap.matchMedia(ref);
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
        () => {
          gsap.to(back, {
            yPercent: -9,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 30%",
              end: "bottom top",
              scrub: 0.3,
            },
          });
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="retail-stack">
      <div className="retail-stack__back">
        <div data-hero-clip className="retail-stack__clip">
          <ParallaxImage
            src={interior.src}
            alt={interior.alt}
            ratio="4 / 5"
            parallax={false}
            tilt
            priority
            sizes="(max-width: 767px) 50vw, 18rem"
            className="retail-stack__frame"
          />
        </div>
      </div>
      <div className="retail-stack__front">
        <div data-hero-clip className="retail-stack__clip retail-stack__keyline">
          <ParallaxImage
            src={storefront.src}
            alt={storefront.alt}
            ratio="6 / 7"
            parallax={false}
            tilt
            priority
            sizes="(max-width: 767px) 50vw, 15rem"
            className="retail-stack__frame"
          />
        </div>
      </div>
    </div>
  );
}
