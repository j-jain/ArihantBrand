"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { logoGeometry, marqueeBox, marqueeSequence } from "@/lib/logoGeometry";
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
      {partners.map((partner) => {
        // No tile (change round 3): a transparent cutout sized optically, or a
        // badge at one height where the logo's coloured block is the mark.
        const geometry = logoGeometry(partner.slug);
        const box = marqueeBox(geometry);
        return (
          <div
            key={`${clone ? "clone-" : ""}${partner.slug}`}
            className="marquee__item"
            data-treatment={
              geometry.treatment === "badge" ? "badge" : undefined
            }
            style={
              {
                "--logo-w": `${box.w}rem`,
                "--logo-h": `${box.h}rem`,
              } as CSSProperties
            }
          >
            <Image
              src={partner.image}
              alt={clone ? "" : partner.name}
              fill
              className="object-contain"
              // 18px is the largest the root font size gets.
              sizes={`${Math.ceil(box.w * 18)}px`}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Logo marquee: a duplicated track loops seamlessly via a CSS keyframe, pauses
 *  on hover or focus, and falls back to a static wrapped grid under reduced
 *  motion. Every logo's box is fixed in rem from the manifest, so it is
 *  CLS-free. Photographic logos are left out and the unranked tail is
 *  interleaved (marqueeSequence). On desktop a GSAP scroll-velocity
 *  skew rides the outer wrapper for a touch of life; reduced-motion gets none. */
export function LogoMarquee({ partners }: LogoMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // WCAG 2.2.2: anything that moves on its own for more than five seconds
  // needs a way to stop it. Hover already pauses it for a mouse; this button
  // is the way for a keyboard and for touch, where there is no hover.
  const [paused, setPaused] = useState(false);

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

  const sequence = marqueeSequence(partners);

  return (
    <div className="marquee-wrap">
      <div
        ref={rootRef}
        className="marquee py-2"
        data-paused={paused ? "" : undefined}
        // Indirected through --m-marquee-duration so the mobile layer can retime
        // it; an inline custom property would otherwise outrank any stylesheet.
        style={
          {
            "--marquee-duration": "var(--m-marquee-duration, 38s)",
          } as CSSProperties
        }
      >
        <div className="marquee__track">
          <MarqueeGroup partners={sequence} />
          <MarqueeGroup partners={sequence} clone />
        </div>
      </div>
      <button
        type="button"
        className="marquee__toggle press"
        // A toggle keeps one label; aria-pressed carries the state.
        aria-pressed={paused}
        aria-label="Pause the brand logos"
        title="Pause the brand logos"
        onClick={() => setPaused((p) => !p)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          aria-hidden="true"
          focusable="false"
        >
          {paused ? (
            <path d="M3 1.5v11l9-5.5z" fill="currentColor" />
          ) : (
            <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" />
          )}
        </svg>
      </button>
    </div>
  );
}
