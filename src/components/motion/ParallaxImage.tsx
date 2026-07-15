"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "../cn";

interface ParallaxImageProps {
  src: string;
  alt: string;
  /** CSS aspect-ratio for the frame, e.g. "4/5" or "3/2". */
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Disable the scrub parallax (e.g. small inline images). Frame still clips. */
  parallax?: boolean;
}

/** Image in a clipping frame with a gentle scroll-scrubbed parallax on desktop.
 *  The picture is scaled slightly larger than the frame so the vertical drift
 *  never exposes an edge. Mobile and reduced-motion render a static, correctly
 *  framed image (no transform), so there is no jank and nothing is cropped by
 *  motion that isn't running. */
export function ParallaxImage({
  src,
  alt,
  ratio = "4/5",
  sizes = "(max-width: 767px) 100vw, 45vw",
  priority = false,
  className,
  parallax = true,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frame = ref.current;
      if (!frame || !parallax) return;
      const img = frame.querySelector<HTMLElement>("[data-parallax-img]");
      if (!img) return;

      const mm = gsap.matchMedia(ref);
      // Parallax only on pointer-fine desktop widths; mobile stays static.
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        () => {
          gsap.set(img, { scale: 1.14 });
          gsap.fromTo(
            img,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [parallax] },
  );

  return (
    <div
      ref={ref}
      className={cn("parallax-frame", className)}
      style={{ aspectRatio: ratio }}
    >
      <Image
        data-parallax-img=""
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="parallax-img"
      />
    </div>
  );
}
