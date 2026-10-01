"use client";

import { useRef, type ElementType } from "react";
import { gsap, SplitText, useGSAP, EASE } from "@/lib/gsap";
import { EmphasisHeading } from "@/app/(site)/_components/EmphasisHeading";

interface SplitHeadingProps {
  text: string;
  emphasis?: string;
  as?: ElementType;
  className?: string;
  id?: string;
}

/** A heading that rises its words out of a mask when it scrolls into view. It
 *  renders through {@link EmphasisHeading} (so a one-word colour accent still
 *  works) and splits on words gated to `document.fonts.ready`, reverting the
 *  split when the reveal lands. Above-the-fold headings and reduced motion stay
 *  static; mobile does a short single fade. The masked start state is applied
 *  only from JS after fonts settle, so the heading is always readable first. */
export function SplitHeading({
  text,
  emphasis,
  as = "h2",
  className,
  id,
}: SplitHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const heading = root.firstElementChild as HTMLElement | null;
      if (!heading) return;

      const mm = gsap.matchMedia(ref);
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
          desktop:
            "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        },
        (ctx) => {
          const { reduced, mobile } = ctx.conditions as {
            reduced: boolean;
            mobile: boolean;
            desktop: boolean;
          };
          if (reduced) return;

          const rect = heading.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) return;

          if (mobile) {
            gsap.from(heading, {
              autoAlpha: 0,
              y: 12,
              duration: 0.5,
              ease: EASE,
              scrollTrigger: { trigger: heading, start: "top 85%", once: true },
            });
            return;
          }

          let split: SplitText | null = null;
          const runSplit = () => {
            if (!heading.isConnected) return;
            try {
              split = SplitText.create(heading, {
                type: "words",
                mask: "words",
                wordsClass: "hero-line",
                aria: "auto",
              });
              gsap.from(split.words, {
                yPercent: 105,
                duration: 0.7,
                stagger: 0.045,
                ease: EASE,
                scrollTrigger: {
                  trigger: heading,
                  start: "top 85%",
                  once: true,
                },
                onComplete: () => {
                  split?.revert();
                  split = null;
                },
              });
            } catch {
              /* heading stays visible and unsplit */
            }
          };
          if (document.fonts?.status === "loaded") runSplit();
          else document.fonts.ready.then(runSplit);

          return () => {
            split?.revert();
            split = null;
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [text, emphasis] },
  );

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <EmphasisHeading
        as={as}
        text={text}
        emphasis={emphasis}
        className={className}
        rest={id ? { id } : undefined}
      />
    </div>
  );
}
