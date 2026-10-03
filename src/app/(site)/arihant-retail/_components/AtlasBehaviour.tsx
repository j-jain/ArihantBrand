"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { EASE, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

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
 *    pin, hover card, list entry) gets `data-on`. The CSS in
 *    src/app/atlas.css (and mobile.css section 18) does the rest, including
 *    opening the store's hover card.
 *
 * Hover (mouse only) works on a tag, a pin or a list entry; a click on a
 * pin pins its store, a click on a tag also moves focus to its entry.
 *
 * Motion-safety: GSAP here only ever animates `a.atlas-tag`, the relief
 * image, the borders, rivers and labels, `.atlas-pin__drop`,
 * `.atlas-pin__ripple`, `.atlas-stitch`, the key, the stage (phones, and the
 * pointer tilt) and the thread's stroke-opacity attribute. CSS owns the
 * active states (`.atlas-tag__body`, `.atlas-pin`, `.atlas-pin__frame`,
 * `.atlas-route`, `.atlas-card`, the thread's opacity), so the two never
 * fight over one property. Every build tween is a `from`, so the served
 * markup is the end state.
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
        ".atlas-tag[data-store], .atlas-entry[data-store], .atlas-pin[data-store]",
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

      // A pin: pin (or unpin) its store, which keeps its card open.
      const pin = target?.closest<SVGGElement>(".atlas-pin[data-store]");
      if (pin && root.contains(pin)) {
        settleBuild();
        const id = pin.getAttribute("data-store");
        pinned = pinned === id ? null : id;
        if (pinned === null && preview === id) preview = null;
        apply();
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
          tilt: "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
        },
        (ctx) => {
          const { reduced, mobile, tilt } = ctx.conditions as {
            reduced: boolean;
            mobile: boolean;
            desktop: boolean;
            tilt: boolean;
          };
          // Reduced motion: the served map is already the finished map.
          if (reduced) return;

          const stage = figure.querySelector<HTMLElement>(".atlas__stage");

          // The plate tips a little toward the pointer, like a printed map
          // held in the hand: one rigid piece, so the drawn borders and pins
          // never slide off the terrain. Fine pointers at 1024px and up only.
          let untilt: (() => void) | undefined;
          if (tilt && stage) {
            gsap.set(stage, { transformPerspective: 1600 });
            const rx = gsap.quickTo(stage, "rotationX", { duration: 0.7, ease: "power3.out" });
            const ry = gsap.quickTo(stage, "rotationY", { duration: 0.7, ease: "power3.out" });
            const onMove = (e: PointerEvent) => {
              if (e.pointerType !== "mouse") return;
              const b = stage.getBoundingClientRect();
              const nx = (e.clientX - b.left) / b.width - 0.5;
              const ny = (e.clientY - b.top) / b.height - 0.5;
              ry(nx * 2.4);
              rx(-ny * 1.8);
            };
            const onLeave = () => {
              rx(0);
              ry(0);
            };
            stage.addEventListener("pointermove", onMove);
            stage.addEventListener("pointerleave", onLeave);
            untilt = () => {
              stage.removeEventListener("pointermove", onMove);
              stage.removeEventListener("pointerleave", onLeave);
            };
          }

          // Already on screen at mount (a reload mid-page, a #stores link):
          // never build in front of the reader, leave the final state.
          const box = figure.getBoundingClientRect();
          if (box.top < window.innerHeight * 0.85 && box.bottom > 0) return untilt;

          const key = figure.querySelector<HTMLElement>(".atlas__key");
          const relief = figure.querySelector<HTMLElement>(".atlas-relief img");
          const borders = figure.querySelectorAll<SVGPathElement>(".atlas-border");
          const rivers = figure.querySelectorAll<SVGPathElement>(".atlas-river");
          const labels = figure.querySelectorAll<SVGTextElement>(".atlas-label");
          const pins = gsap.utils.toArray<SVGGElement>(figure.querySelectorAll(".atlas-pin"));
          const stitchesOf = (id: string) =>
            figure.querySelectorAll<SVGLineElement>(`.atlas-route[data-store="${id}"] .atlas-stitch`);
          const tl = gsap.timeline({ paused: true });

          // Rivers draw from source to mouth (the paths are stored that way),
          // on a normalised length (pathLength="1").
          const flow = (at: number, duration: number) => {
            if (!rivers.length) return;
            tl.fromTo(
              rivers,
              { strokeDasharray: "1 1", strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                duration,
                ease: "power1.inOut",
                stagger: 0.03,
                clearProps: "strokeDasharray,strokeDashoffset",
              },
              at,
            );
          };

          // A pin drops onto the map and settles; a single ring spreads out
          // from where it lands. The ring rests invisible (atlas.css), so it
          // only ever exists inside this build.
          const drop = (pin: Element, at: number) => {
            const head = pin.querySelector(".atlas-pin__drop");
            if (head) {
              tl.from(
                head,
                {
                  y: mobile ? -16 : -28,
                  opacity: 0,
                  duration: mobile ? 0.35 : 0.45,
                  ease: "back.out(1.7)",
                  clearProps: "transform,opacity",
                },
                at,
              );
            }
            const ripple = pin.querySelector(".atlas-pin__ripple");
            if (ripple && !mobile) {
              tl.fromTo(
                ripple,
                { opacity: 0.8, scale: 1 },
                {
                  opacity: 0,
                  scale: 3.2,
                  duration: 0.8,
                  ease: "expo.out",
                  immediateRender: false,
                  clearProps: "transform,opacity",
                },
                at + 0.26,
              );
            }
          };

          if (mobile) {
            // Phones: the plate fades in, the rivers run, the routes stitch
            // in one pass, the pins drop, then it is still. No tag swing.
            // Opacity, never autoAlpha: the key's text and the tag links stay
            // in the accessibility tree and the tab order while faded.
            const blocks = [key, stage].filter(Boolean) as HTMLElement[];
            if (blocks.length) {
              tl.from(blocks, { opacity: 0, duration: 0.4, ease: EASE, clearProps: "opacity" });
            }
            flow(0.15, 0.9);
            const stitches = figure.querySelectorAll(".atlas-stitch");
            if (stitches.length) {
              tl.from(stitches, { opacity: 0, duration: 0.08, ease: "none", stagger: 0.012 }, 0.3);
            }
            pins.forEach((pin, i) => drop(pin, 0.45 + i * 0.08));
            const trigger = ScrollTrigger.create({
              trigger: figure,
              start: "top 85%",
              once: true,
              onEnter: () => tl.play(),
            });
            buildRef.current = { tl, trigger };
            return () => {
              untilt?.();
              buildRef.current = null;
            };
          }

          /* Desktop: one paused timeline, about 2.5s, then still. Stages
             overlap (change round 5; it used to run about 3.5s, one stage
             after another): the terrain settles while the borders and rivers
             come in, and the routes start sewing before the labels finish. */
          const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

          // Opacity, never autoAlpha, for the key and the tags: real text and
          // real links must stay readable and focusable while they fade in.
          if (key) tl.from(key, { opacity: 0, y: 12, duration: 0.55, ease: EASE }, 0.1);

          // The terrain comes up out of the paper with a slow push in, the
          // way a camera settles on a map.
          if (relief) {
            tl.from(
              relief,
              { opacity: 0, scale: 1.06, duration: 1.1, ease: "expo.out", clearProps: "opacity,transform" },
              0,
            );
          }
          if (borders.length) {
            tl.from(borders, { opacity: 0, duration: 0.5, ease: "power1.out", stagger: 0.08 }, 0.15);
          }
          flow(0.2, 1.05);
          if (labels.length) {
            // Opacity only: some labels carry a rotate() transform attribute.
            tl.from(labels, { opacity: 0, duration: 0.45, ease: "power2.out", stagger: 0.03 }, 0.45);
          }

          // The thread fades on its stroke-opacity attribute, not its CSS
          // opacity, which the active/dim states own. The tag swings in on
          // its eyelet like a real swing tag on a string, and comes to rest.
          const hang = (id: string, at: number) => {
            const thread = figure.querySelector<SVGLineElement>(`.atlas-thread[data-store="${id}"]`);
            if (thread) {
              tl.from(thread, { attr: { "stroke-opacity": 0 }, duration: 0.3, ease: "power1.out" }, at);
            }
            const tag = root.querySelector<HTMLElement>(`a.atlas-tag[data-store="${id}"]`);
            if (tag) {
              tl.from(tag, { opacity: 0, duration: 0.2, ease: "power1.out", clearProps: "opacity" }, at);
              // A calmer swing than round 4's (1.3s at 0.36 wobbled): it
              // settles in under a second, like a tag on a short string.
              tl.from(
                tag,
                {
                  rotation: -9,
                  y: -6,
                  transformOrigin: `50% ${0.55 * rootPx}px`,
                  duration: 0.9,
                  ease: "elastic.out(1, 0.55)",
                  clearProps: "transform,transformOrigin",
                },
                at,
              );
            }
          };

          // Pins are rendered in build order: the hub (the Guwahati
          // warehouse) first, then the stores nearest first. Each route sews
          // itself out stitch by stitch, and its store's pin lands as the
          // last stitch goes in.
          let routeIndex = 0;
          pins.forEach((pin) => {
            const id = pin.getAttribute("data-store");
            if (!id) return;
            if (pin.hasAttribute("data-hub")) {
              drop(pin, 0.6);
              hang(id, 0.72);
              return;
            }
            const start = 0.8 + routeIndex * 0.18;
            routeIndex += 1;
            const stitches = stitchesOf(id);
            let end = start;
            if (stitches.length) {
              const each = 0.012;
              tl.from(stitches, { opacity: 0, duration: 0.07, ease: "none", stagger: each }, start);
              end = start + (stitches.length - 1) * each + 0.07;
            }
            drop(pin, end);
            hang(id, end + 0.08);
          });

          const trigger = ScrollTrigger.create({
            trigger: figure,
            start: "top 78%",
            once: true,
            onEnter: () => tl.play(),
          });
          buildRef.current = { tl, trigger };
          return () => {
            untilt?.();
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
