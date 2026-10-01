"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { EASE, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { PIXEL } from "@/lib/pixel";

interface AtlasBehaviourProps {
  children: ReactNode;
  className?: string;
  /** The hub store's id: while it is active, no route dims. */
  hubId?: string;
}

/**
 * The store atlas's behaviour layer. It renders nothing visual of its own:
 * the map, tags, key and list arrive from the server finished, and this adds
 * state, listeners and the one-shot entry build on top.
 *
 * State is two ids, `preview` (hover / focus) and `pinned` (a click), with
 * `active = preview ?? pinned`. It is written to the DOM as attributes, never
 * through React state, so the map never re-renders:
 *  - the root gets `data-js` on mount, `data-active` while anything is
 *    active, and `data-active-hub` while the hub is;
 *  - every `[data-store]` element of the active store (tag, thread, route,
 *    pin, list entry) gets `data-on`. The CSS in src/app/atlas.css (and mobile.css section 18) does the rest.
 *
 * Motion-safety: GSAP here only ever animates `a.atlas-tag`,
 * `.atlas-pin__mark`, `.atlas-stitch`, `.atlas-ring`, the key, the stage
 * (phones) and the thread's stroke-opacity attribute. CSS owns the active
 * states (`.atlas-tag__body`, `.atlas-pin`, `.atlas-pin__frame`,
 * `.atlas-route`, the thread's opacity), so the two never fight over one
 * property. Every tween is a `from`, so the served markup is the end state.
 */
export function AtlasBehaviour({ children, className, hubId }: AtlasBehaviourProps) {
  const ref = useRef<HTMLDivElement>(null);
  // The entry build (timeline + its one-shot trigger). Held so focus or a tag
  // click can finish it at once: nothing a keyboard or screen-reader user
  // needs may wait on a scroll position.
  const buildRef = useRef<{ tl: gsap.core.Timeline; trigger: ScrollTrigger } | null>(null);

  /* ---------------------------------------------------------------- state */
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.setAttribute("data-js", "");

    let pinned: string | null = null;
    let preview: string | null = null;
    let clearTimer: number | undefined;

    const storeOf = (el: Element | null) =>
      el?.closest<HTMLElement | SVGElement>("[data-store]")?.getAttribute("data-store") ?? null;

    const apply = () => {
      const active = preview ?? pinned;
      if (active) root.setAttribute("data-active", active);
      else root.removeAttribute("data-active");
      if (active && hubId && active === hubId) root.setAttribute("data-active-hub", "");
      else root.removeAttribute("data-active-hub");
      root.querySelectorAll("[data-store]").forEach((el) => {
        if (active && el.getAttribute("data-store") === active) el.setAttribute("data-on", "");
        else el.removeAttribute("data-on");
      });
    };

    const setPreview = (id: string | null) => {
      window.clearTimeout(clearTimer);
      if (preview === id) return;
      preview = id;
      apply();
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const hit = (event.target as Element | null)?.closest(
        ".atlas-tag[data-store], .atlas-entry[data-store]",
      );
      if (hit && root.contains(hit)) {
        setPreview(hit.getAttribute("data-store"));
        return;
      }
      // Off a tag or an entry: let go after a beat, so sliding between a tag
      // and its neighbour does not flicker the whole map.
      window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => {
        if (preview === null) return;
        preview = null;
        apply();
      }, 90);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setPreview(null);
    };

    // The list reveals on scroll (StaggerGroup), and until then its rows are
    // visibility: hidden, which takes the directions link out of the tab
    // order and makes an entry unfocusable. As soon as anyone is working the
    // atlas with focus or a tag, finish that reveal so the tab order and the
    // tag-to-entry jump both hold.
    const settleList = () => {
      root.querySelectorAll(".atlas__list > li").forEach((li) => {
        gsap.getTweensOf(li).forEach((tween) => {
          if (tween.progress() >= 1) return;
          const trigger = tween.scrollTrigger;
          tween.progress(1);
          trigger?.kill();
        });
      });
    };

    const settleBuild = () => {
      const build = buildRef.current;
      if (!build) return;
      build.trigger.kill();
      if (build.tl.progress() < 1) build.tl.progress(1);
      buildRef.current = null;
    };

    const onFocusIn = (event: FocusEvent) => {
      settleList();
      settleBuild();
      const id = storeOf(event.target as Element | null);
      if (id) setPreview(id);
    };

    const onFocusOut = (event: FocusEvent) => {
      const from = storeOf(event.target as Element | null);
      const to = storeOf(event.relatedTarget as Element | null);
      if (from && from !== to && preview === from) setPreview(null);
    };

    /** The band of the viewport not covered by the sticky header above or
     *  the phone action bar below. */
    const visibleTop = () => {
      const header = document.querySelector("header");
      const bottom = header ? header.getBoundingClientRect().bottom : 0;
      return Math.max(0, bottom);
    };
    const visibleBottom = () => {
      const bar = document.querySelector(".action-bar");
      if (!bar) return window.innerHeight;
      const box = bar.getBoundingClientRect();
      const shown = box.height > 0 && box.top < window.innerHeight;
      return shown ? Math.min(window.innerHeight, box.top) : window.innerHeight;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const tag = target?.closest<HTMLAnchorElement>("a.atlas-tag[data-store]");
      if (tag && root.contains(tag)) {
        settleList();
        settleBuild();
        pinned = tag.getAttribute("data-store");
        apply();
        const id = tag.getAttribute("href")?.slice(1);
        const entry = id ? document.getElementById(id) : null;
        if (!entry) return;
        const rect = entry.getBoundingClientRect();
        const fullyVisible = rect.top >= visibleTop() && rect.bottom <= visibleBottom();
        if (fullyVisible) {
          // Already on screen: do not scroll, just move focus. SmoothScroll
          // honours defaultPrevented and leaves the page where it is.
          event.preventDefault();
          entry.focus({ preventScroll: true });
        } else {
          // Let the anchor navigate (Lenis on desktop, a native jump with
          // scroll-padding on phones), then land focus without a second jump.
          requestAnimationFrame(() => entry.focus({ preventScroll: true }));
        }
        return;
      }

      const entry = target?.closest<HTMLElement>(".atlas-entry[data-store]");
      if (entry && root.contains(entry) && !target?.closest("a, button")) {
        const id = entry.getAttribute("data-store");
        if (pinned === id) {
          // Unpinning also drops the focus preview: on touch the tap focused
          // this entry, and focus never leaves it, so the preview would
          // otherwise keep the same store lit.
          pinned = null;
          if (preview === id) preview = null;
        } else {
          pinned = id;
        }
        apply();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pinned === null && preview === null) return;
      window.clearTimeout(clearTimer);
      pinned = null;
      preview = null;
      apply();
    };

    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(clearTimer);
      root.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKeyDown);
      root.removeAttribute("data-js");
      root.removeAttribute("data-active");
      root.removeAttribute("data-active-hub");
      root.querySelectorAll("[data-on]").forEach((el) => el.removeAttribute("data-on"));
    };
  }, [hubId]);

  /* --------------------------------------------------------------- motion */
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const figure = root.querySelector<HTMLElement>(".atlas__figure");
      if (!figure) return;

      const mm = gsap.matchMedia(ref);
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
          desktop: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        },
        (ctx) => {
          const { reduced, mobile } = ctx.conditions as {
            reduced: boolean;
            mobile: boolean;
            desktop: boolean;
          };
          // Reduced motion: the served map is already the finished map.
          if (reduced) return;

          // Already on screen at mount (a reload mid-page, a #stores link):
          // never build in front of the reader, leave the final state.
          const box = figure.getBoundingClientRect();
          if (box.top < window.innerHeight * 0.85 && box.bottom > 0) return;

          const key = figure.querySelector<HTMLElement>(".atlas__key");
          const stage = figure.querySelector<HTMLElement>(".atlas__stage");
          const pins = gsap.utils.toArray<SVGGElement>(figure.querySelectorAll(".atlas-pin"));
          const markOf = (pin: Element) => pin.querySelector<SVGGElement>(".atlas-pin__mark");
          const stitchesOf = (id: string) =>
            figure.querySelectorAll<SVGRectElement>(`.atlas-route[data-store="${id}"] .atlas-stitch`);

          if (mobile) {
            // Phones: no pixel build and no tag drop. The map fades in, the
            // stitches draw once, the pins stamp, then it is still.
            const tl = gsap.timeline({ paused: true });
            const blocks = [key, stage].filter(Boolean) as HTMLElement[];
            if (blocks.length) {
              // Opacity, never autoAlpha: the key's text and the tag links
              // stay in the accessibility tree and the tab order while faded.
              tl.from(blocks, {
                opacity: 0,
                duration: 0.4,
                ease: EASE,
                clearProps: "opacity",
              });
            }
            const stitches = figure.querySelectorAll(".atlas-stitch");
            if (stitches.length) {
              tl.from(stitches, {
                scale: 0,
                transformOrigin: "50% 50%",
                duration: 0.14,
                ease: PIXEL.ease,
                stagger: 0.02,
              });
            }
            const marks = pins.map(markOf).filter(Boolean) as SVGGElement[];
            if (marks.length) {
              tl.from(marks, {
                scale: 1.3,
                autoAlpha: 0,
                transformOrigin: "50% 50%",
                duration: 0.25,
                ease: "back.out(1.7)",
                stagger: 0.06,
                clearProps: "transform,opacity,visibility",
              });
            }
            // Created inside the matchMedia context, so a breakpoint change
            // reverts the timeline and kills the trigger with it.
            const trigger = ScrollTrigger.create({
              trigger: figure,
              start: "top 85%",
              once: true,
              onEnter: () => tl.play(),
            });
            buildRef.current = { tl, trigger };
            return () => {
              buildRef.current = null;
            };
          }

          /* Desktop: one paused timeline, about 2.1s, then still. */
          const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
          const tl = gsap.timeline({ paused: true });

          // Opacity, never autoAlpha, for the key and the tags: real text and
          // real links must stay readable and focusable while they fade in.
          if (key) tl.from(key, { opacity: 0, y: 12, duration: 0.5, ease: EASE }, 0);

          // Land lights up ring by ring out of Guwahati, in stepped frames.
          const rings = figure.querySelectorAll(".atlas-ring");
          if (rings.length) {
            tl.from(
              rings,
              { autoAlpha: 0, duration: 0.24, ease: PIXEL.step, stagger: PIXEL.ringStagger },
              0.05,
            );
          }

          const stamp = (pin: Element, at: number) => {
            const mark = markOf(pin);
            if (!mark) return;
            tl.from(
              mark,
              {
                scale: 1.6,
                autoAlpha: 0,
                transformOrigin: "50% 50%",
                duration: 0.3,
                ease: "back.out(1.7)",
                clearProps: "transform,opacity,visibility",
              },
              at,
            );
          };

          // The thread fades on its stroke-opacity attribute, not its CSS
          // opacity, which the active/dim states own.
          const hang = (id: string, at: number) => {
            const thread = figure.querySelector<SVGLineElement>(`.atlas-thread[data-store="${id}"]`);
            if (thread) {
              tl.from(
                thread,
                { attr: { "stroke-opacity": 0 }, duration: 0.3, ease: "power1.out" },
                at,
              );
            }
            const tag = root.querySelector<HTMLElement>(`a.atlas-tag[data-store="${id}"]`);
            if (tag) {
              tl.from(
                tag,
                {
                  opacity: 0,
                  y: -10,
                  rotation: -5,
                  transformOrigin: `50% ${0.55 * rootPx}px`,
                  duration: 0.5,
                  ease: "back.out(1.4)",
                  clearProps: "transform,transformOrigin,opacity",
                },
                at,
              );
            }
          };

          // Pins are rendered in build order: the hub first, then nearest first.
          let routeIndex = 0;
          pins.forEach((pin) => {
            const id = pin.getAttribute("data-store");
            if (!id) return;
            if (pin.hasAttribute("data-hub")) {
              stamp(pin, 0.3);
              hang(id, 0.38);
              return;
            }
            const start = 0.55 + routeIndex * 0.18;
            routeIndex += 1;
            const stitches = stitchesOf(id);
            let end = start;
            if (stitches.length) {
              tl.from(
                stitches,
                {
                  scale: 0,
                  transformOrigin: "50% 50%",
                  duration: 0.16,
                  ease: PIXEL.ease,
                  stagger: PIXEL.stitchStagger,
                },
                start,
              );
              end = start + (stitches.length - 1) * PIXEL.stitchStagger + 0.16;
            }
            stamp(pin, end);
            hang(id, end + 0.08);
          });

          const trigger = ScrollTrigger.create({
            trigger: figure,
            start: "top 72%",
            once: true,
            onEnter: () => tl.play(),
          });
          buildRef.current = { tl, trigger };
          return () => {
            buildRef.current = null;
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} data-hub={hubId}>
      {children}
    </div>
  );
}
