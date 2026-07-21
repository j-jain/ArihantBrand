"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Partner } from "@/content/types";

interface LogoMarqueeProps {
  partners: Partner[];
}

function MarqueeGroup({
  partners,
  clone = false,
}: {
  partners: Partner[];
  clone?: boolean;
}) {
  return (
    <div
      className="marquee__group"
      data-clone={clone ? "true" : undefined}
      aria-hidden={clone || undefined}
    >
      {partners.map((partner) => (
        <div
          key={`${clone ? "clone-" : ""}${partner.slug}`}
          className="marquee__tile relative h-16 w-32 shrink-0 rounded-md border border-line bg-white p-3"
        >
          <div className="relative h-full w-full">
            <Image
              src={partner.image}
              alt={clone ? "" : partner.name}
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Logo marquee: a duplicated track loops seamlessly via a CSS keyframe, pauses
 *  on hover or focus, and falls back to a static wrapped grid under reduced
 *  motion. Fixed row height keeps it CLS-free. On desktop a GSAP scroll-velocity
 *  skew rides the outer wrapper for a touch of life; reduced-motion gets none. */
export function LogoMarquee({ partners }: LogoMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-velocity skew: nudge the marquee as the page scrolls, easing back to
  // flat when it settles. Desktop + no-reduced-motion only. The skew rides the
  // OUTER .marquee wrapper — the track's transform is owned by the CSS keyframe
  // loop, so skewing the track would fight the animation.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia(rootRef);
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        () => {
          const skewTo = gsap.quickTo(root, "skewX", {
            duration: 0.5,
            ease: "power3",
          });
          const trigger = ScrollTrigger.create({
            trigger: root,
            onUpdate: (self) =>
              skewTo(gsap.utils.clamp(-4, 4, self.getVelocity() / -300)),
          });
          return () => trigger.kill();
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="marquee py-2"
      // Indirected through --m-marquee-duration so the mobile layer can retime
      // it; an inline custom property would otherwise outrank any stylesheet.
      style={
        {
          "--marquee-duration": "var(--m-marquee-duration, 48s)",
        } as CSSProperties
      }
    >
      <div className="marquee__track">
        <MarqueeGroup partners={partners} />
        <MarqueeGroup partners={partners} clone />
      </div>
    </div>
  );
}
