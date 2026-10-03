"use client";

import { useRef } from "react";

import { ParallaxImage } from "@/components";
import { gsap, useGSAP } from "@/lib/gsap";

interface Photo {
  src: string;
  alt: string;
}

interface RetailHeroPhotosProps {
  /** The store interior (photoSlots.retailInterior): the back frame. */
  interior: Photo;
  /** The Urban Closet storefront (photoSlots.retailStorefront): the front
   *  frame, uncaptioned, since which town it shows is unconfirmed. */
  storefront: Photo;
}

/**
 * The retail hero's two real photographs, set as an offset stack (change
 * round 5): the store interior behind, the storefront in front on a paper
 * keyline. Both files are about 400px wide, so the frames are capped in rem
 * (atlas.css) to keep any 2x upscale near 1.3x.
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
              scrub: 0.6,
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
