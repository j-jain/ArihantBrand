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
  /** Add a gentle pointer-follow tilt on the frame. Desktop fine-pointer only;
   *  touch, reduced-motion and < 1024px get zero listeners and zero overhead. */
  tilt?: boolean;
  /** Drop the intrinsic aspect-ratio so the frame takes its height from the
   *  layout instead (e.g. a stretched grid column). `ratio` is then ignored and
   *  the caller owns the height. */
  fillHeight?: boolean;
}

/** Image in a clipping frame with a gentle scroll-scrubbed parallax on desktop.
 *  The picture is scaled slightly larger than the frame so the vertical drift
 *  never exposes an edge. Mobile and reduced-motion render a static, correctly
 *  framed image (no transform), so there is no jank and nothing is cropped by
 *  motion that isn't running.
 *
 *  With `tilt`, the FRAME (not the picture) tips toward the cursor on fine
 *  pointers. The two effects compose cleanly because they drive different
 *  elements: the scrub owns the inner image's transform, the tilt owns the
 *  frame's. Both live inside one `matchMedia` and revert together. */
export function ParallaxImage({
  src,
  alt,
  ratio = "4/5",
  sizes = "(max-width: 767px) 100vw, 45vw",
  priority = false,
  className,
  parallax = true,
  tilt = false,
  fillHeight = false,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frame = ref.current;
      if (!frame) return;

      const mm = gsap.matchMedia(ref);

      // Scroll-scrubbed parallax on the INNER image only — desktop widths.
      if (parallax) {
        const img = frame.querySelector<HTMLElement>("[data-parallax-img]");
        if (img) {
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
        }
      }

      // Pointer-follow tilt on the FRAME wrapper. Composes over the scrub above
      // since it drives a different element. Listeners are added ONLY inside the
      // matched context and removed in its cleanup, so non-matching environments
      // (touch, reduced motion, < 1024px) register nothing at all.
      if (tilt) {
        mm.add(
          "(pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 1024px)",
          () => {
            const MAX_TILT = 2.5; // degrees
            const MAX_SHIFT = 6; // px

            gsap.set(frame, {
              transformPerspective: 800,
              transformOrigin: "center center",
              willChange: "transform",
            });

            // Each ROTATION/TRANSLATE channel is owned by one quickTo, so no
            // `overwrite` is needed and quickTo's resetTo() always finds its
            // single-component PropTween. (Layering an overwriting gsap.to on
            // these same props spams GSAP's "not eligible for reset" warning and
            // desyncs the follow on re-entry — so the release routes back
            // through these same setters, settling to 0.)
            const rotX = gsap.quickTo(frame, "rotationX", {
              duration: 0.45,
              ease: "power2.out",
            });
            const rotY = gsap.quickTo(frame, "rotationY", {
              duration: 0.45,
              ease: "power2.out",
            });
            const shiftX = gsap.quickTo(frame, "x", {
              duration: 0.45,
              ease: "power2.out",
            });
            const shiftY = gsap.quickTo(frame, "y", {
              duration: 0.45,
              ease: "power2.out",
            });

            const onMove = (event: PointerEvent) => {
              const rect = frame.getBoundingClientRect();
              // Normalised cursor position: -1 (top/left) .. 1 (bottom/right).
              const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
              const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
              rotX(-ny * MAX_TILT);
              rotY(nx * MAX_TILT);
              shiftX(nx * MAX_SHIFT);
              shiftY(ny * MAX_SHIFT);
            };

            // Scale is a plain tween, NOT a quickTo: CSSPlugin splits `scale`
            // into scaleX/scaleY, which resetTo() cannot target (it warns "not
            // eligible for reset"). No `overwrite`, so it never kills the
            // quickTo PropTweens above; a plain tween reads its live start each
            // time, so it can't desync the rotation/translate channels.
            const onEnter = () => {
              gsap.to(frame, { scale: 1.015, duration: 0.45, ease: "power2.out" });
            };

            const onLeave = () => {
              rotX(0);
              rotY(0);
              shiftX(0);
              shiftY(0);
              gsap.to(frame, { scale: 1, duration: 0.6, ease: "power3.out" });
            };

            frame.addEventListener("pointerenter", onEnter);
            frame.addEventListener("pointermove", onMove);
            frame.addEventListener("pointerleave", onLeave);

            return () => {
              frame.removeEventListener("pointerenter", onEnter);
              frame.removeEventListener("pointermove", onMove);
              frame.removeEventListener("pointerleave", onLeave);
              gsap.set(frame, {
                clearProps: "willChange,transform,transformOrigin",
              });
            };
          },
        );
      }

      return () => mm.revert();
    },
    { scope: ref, dependencies: [parallax, tilt, fillHeight] },
  );

  return (
    <div
      ref={ref}
      className={cn("parallax-frame", className)}
      style={fillHeight ? undefined : { aspectRatio: ratio }}
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
