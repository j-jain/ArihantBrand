"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { logoGeometry, marqueeBox, marqueeSequence } from "@/lib/logoGeometry";
import type { Partner } from "@/content/types";

interface LogoMarqueeProps {
  partners: Partner[];
}

/** The desktop loop in seconds, the same figure the inline `--marquee-duration`
 *  below hands the keyframe. Only the fallback: the JS loop reads its pace off
 *  the track's computed `animation-duration`, so a phone keeps the quicker loop
 *  mobile.css sets through `--m-marquee-duration` without a figure here. */
const MARQUEE_SECONDS = 38;

/** The seconds the CSS keyframe loop takes, read off the track BEFORE its
 *  keyframe is switched off (after that the computed duration is 0s). */
function loopSeconds(el: HTMLElement, fallback: number): number {
  const raw = getComputedStyle(el).animationDuration.split(",")[0].trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return raw.endsWith("ms") ? n / 1000 : n;
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

/** Logo marquee: a duplicated track loops seamlessly, pauses on hover, focus
 *  or the pause button, and falls back to a static wrapped grid under reduced
 *  motion. The CSS keyframe (globals.css) is the loop every visitor gets at
 *  once, with or without JS; once JS runs with motion allowed, a GSAP tween
 *  takes the track over at the keyframe's own pace (`data-loop="js"`, which
 *  the stylesheet answers by switching the keyframe off), so a pause slows to
 *  a stop and a resume gathers speed again where the play-state snapped.
 *  Every logo's box is fixed in rem from the manifest, so it is CLS-free.
 *  Photographic logos are left out and the unranked tail is interleaved
 *  (marqueeSequence). On desktop a GSAP scroll-velocity skew rides the outer
 *  wrapper for a touch of life; reduced-motion gets none. */
export function LogoMarquee({ partners }: LogoMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // WCAG 2.2.2: anything that moves on its own for more than five seconds
  // needs a way to stop it. Hover already pauses it for a mouse; this button
  // is the way for a keyboard and for touch, where there is no hover.
  const [paused, setPaused] = useState(false);
  // Installed by the running motion branch: re-reads hover, focus and the
  // [data-paused] attribute and ramps the loop to match. Null under reduced
  // motion, where the static grid shows and nothing moves.
  const syncRef = useRef<((instant?: boolean) => void) | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = root?.querySelector<HTMLElement>(".marquee__track");
      if (!root || !track) return;

      const mm = gsap.matchMedia(rootRef);

      /** The loop, driven by GSAP instead of the keyframe: one repeating
       *  tween at the keyframe's pace, whose timeScale a pause ramps down to
       *  a stop and a resume ramps back up. Shared by both motion branches;
       *  returns the branch cleanup. */
      const drive = () => {
        // Read the pace first: `data-loop` hands the transform to JS (the
        // stylesheet switches the keyframe off under it, which also zeroes
        // the computed duration).
        const seconds = loopSeconds(track, MARQUEE_SECONDS);
        track.setAttribute("data-loop", "js");
        // The one element moving every frame keeps its own layer for the
        // loop's whole life (the context reverts it with the loop).
        gsap.set(track, { willChange: "transform" });
        const loop = gsap.to(track, {
          xPercent: -50,
          duration: seconds,
          ease: "none",
          repeat: -1,
        });

        let hover = false;
        let focus = false;
        let want = 1;
        let ramp: gsap.core.Tween | null = null;
        const sync = (instant = false) => {
          const next =
            hover || focus || root.hasAttribute("data-paused") ? 0 : 1;
          if (next === want) return;
          want = next;
          ramp?.kill();
          if (instant) {
            loop.timeScale(next);
            return;
          }
          // Slows to a stop over 0.6s and picks back up over 0.8s: a wheel
          // under a hand, not a film freezing.
          ramp = gsap.to(loop, {
            timeScale: next,
            duration: next ? 0.8 : 0.6,
            ease: "power2.out",
            overwrite: true,
          });
        };

        // Hover is a mouse (or pen) notion: a finger tapping a logo would
        // otherwise stop and restart the row for nothing. Touch has the
        // button.
        const onEnter = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          hover = true;
          sync();
        };
        const onLeave = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          hover = false;
          sync();
        };
        const onFocusIn = () => {
          focus = true;
          sync();
        };
        const onFocusOut = (e: FocusEvent) => {
          // Focus moving between two things inside the row is not a leave.
          if (root.contains(e.relatedTarget as Node | null)) return;
          focus = false;
          sync();
        };
        root.addEventListener("pointerenter", onEnter);
        root.addEventListener("pointerleave", onLeave);
        root.addEventListener("focusin", onFocusIn);
        root.addEventListener("focusout", onFocusOut);
        syncRef.current = sync;
        // A branch can (re)build while the button already holds the row (a
        // window resized across 768px): start stopped, with no ramp.
        sync(true);

        return () => {
          root.removeEventListener("pointerenter", onEnter);
          root.removeEventListener("pointerleave", onLeave);
          root.removeEventListener("focusin", onFocusIn);
          root.removeEventListener("focusout", onFocusOut);
          syncRef.current = null;
          ramp?.kill();
          loop.kill();
          // The context has already put the track's transform back; handing
          // the loop to the keyframe is the last step.
          track.removeAttribute("data-loop");
        };
      };

      mm.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
        () => drive(),
      );

      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        () => {
          const stop = drive();

          // Scroll-velocity skew: nudge the marquee as the page scrolls,
          // easing back to flat when it settles. It rides the OUTER .marquee
          // wrapper so the track's transform stays the loop's alone.
          const skewTo = gsap.quickTo(root, "skewX", {
            duration: 0.5,
            ease: "power3",
          });
          // onUpdate only fires while the page moves, so without a settle
          // call a scroll that stops dead (a touch tablet, no Lenis) left the
          // row leaning (change round 9). Each update re-arms the return to
          // flat.
          let settle: gsap.core.Tween | null = null;
          const trigger = ScrollTrigger.create({
            trigger: root,
            onUpdate: (self) => {
              skewTo(gsap.utils.clamp(-3, 3, self.getVelocity() / -300));
              settle?.kill();
              settle = gsap.delayedCall(0.12, () => skewTo(0));
            },
          });
          return () => {
            settle?.kill();
            trigger.kill();
            stop();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // React has committed `data-paused` by the time this runs; the branch's
  // sync reads it off the element, so the button and hover share one rule.
  useEffect(() => {
    syncRef.current?.();
  }, [paused]);

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
