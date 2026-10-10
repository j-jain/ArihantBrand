"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  useGSAP,
  DUR,
  DUR_SLOW,
  EASE,
  EASE_MASK,
  REVEAL,
  RISE,
  STAGGER,
  onScreenAtMount,
} from "@/lib/gsap";

type Tag = "div" | "section" | "article" | "ul" | "ol";
type Dir = "up" | "left" | "right";

interface SectionRevealProps {
  children: ReactNode;
  as?: Tag;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Direction the children of a `rows` group enter from (desktop). */
  from?: Dir;
  /** Phones: `wipe` rules each row in from the left, hairline and all (the
   *  ledger idiom StaggerGroup's `mLedger` gives); `rise` is the default. */
  mobileRows?: "rise" | "wipe";
}

/** Longest the heading waits for webfonts before it rises unsplit. */
const FONT_WAIT_MS = 800;

const RM = "(prefers-reduced-motion: reduce)";
const MOB = "(prefers-reduced-motion: no-preference) and (max-width: 767px)";
const DESK = "(prefers-reduced-motion: no-preference) and (min-width: 768px)";

/**
 * One choreographed entrance per section (change round 9).
 *
 * The section's parts used to be wrapped one by one (a Reveal here, a
 * StaggerGroup there, a SplitHeading inside SectionHeading), each on its own
 * trigger at its own scroll line, so the heading, the lead, the photograph
 * and the rows of one band arrived at different moments. This wraps the band
 * once, builds ONE paused timeline, and plays it from ONE ScrollTrigger (a
 * standalone `ScrollTrigger.create`, never a timeline-owned one: the Timeline
 * component documents the refresh race that pattern invites).
 *
 * Roles are marked on descendants with `data-sr`:
 *  - `heading`: the words rise out of a mask (SplitText, after fonts settle);
 *  - `lead`: rises in just behind the heading;
 *  - `media`: a wrapper round a photograph opens out of a mask from the
 *    bottom edge and settles from a slight push in (never put it on a
 *    ParallaxImage frame itself: the scrub and the tilt own those transforms);
 *  - `rows`: the direct children stagger in from `from`;
 *  - `item`: a single block that rises in.
 *
 * The server renders everything visible; from-states are set only from JS
 * and only for sections below the fold at mount. Reduced motion is a no-op,
 * a phone runs the same order shorter and shallower (no word split), and a
 * nested SectionReveal keeps its own descendants. It must never wrap a pinned
 * or sticky set piece (the deck, the counter rail, the street, the atlas, the
 * model band, the swing tags) or a hero.
 */
export function SectionReveal({
  children,
  as = "div",
  className,
  id,
  style,
  from = "up",
  mobileRows = "rise",
}: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      // A role belongs to the nearest SectionReveal above it.
      const own = (el: Element) => el.closest("[data-section-reveal]") === root;
      const role = (name: string) =>
        gsap.utils.toArray<HTMLElement>(`[data-sr="${name}"]`, root).filter(own);
      const headings = role("heading");
      const leads = role("lead");
      const medias = role("media");
      const rowGroups = role("rows");
      const items = role("item");
      const rows = rowGroups.flatMap((group) => Array.from(group.children) as HTMLElement[]);
      if (!headings.length && !leads.length && !medias.length && !rows.length && !items.length) {
        return;
      }

      const mm = gsap.matchMedia(ref);
      mm.add({ reduced: RM, mobile: MOB, desktop: DESK }, (ctx) => {
        const { reduced, mobile } = ctx.conditions as Record<string, boolean>;
        if (reduced) return;
        if (onScreenAtMount(root)) return;

        const rise = mobile ? RISE / 2 : RISE;
        const dur = mobile ? REVEAL.durMobile : DUR;
        const stagger = mobile ? REVEAL.staggerMobile : STAGGER;
        const travel = mobile ? 18 : 34;
        const rowFrom =
          from === "left"
            ? { autoAlpha: 0, x: -travel }
            : from === "right"
              ? { autoAlpha: 0, x: travel }
              : { autoAlpha: 0, y: rise };

        // 1) The timeline, paused. A from() inside it renders its start state
        //    at once, so every from-state lands before this frame paints.
        const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

        if (headings.length) gsap.set(headings, { autoAlpha: 0 });
        if (leads.length) {
          tl.from(leads, { autoAlpha: 0, y: rise, duration: dur }, 0.12);
        }
        if (medias.length) {
          const maskDur = mobile ? 0.6 : DUR_SLOW * 1.25;
          // The sides and the far edge sit outside the box, so a frame's own
          // shadow is never clipped and nothing pops when the clip clears.
          tl.fromTo(
            medias,
            { clipPath: "inset(100% -15% -15% -15%)" },
            {
              clipPath: "inset(-15% -15% -15% -15%)",
              duration: maskDur,
              ease: EASE_MASK,
              clearProps: "clipPath",
            },
            0.1,
          );
          tl.from(
            medias,
            { scale: 1.04, duration: maskDur + 0.2, ease: EASE_MASK, clearProps: "transform" },
            0.1,
          );
        }
        if (rows.length) {
          const inRail = mobile && rowGroups.some((g) => g.classList.contains("m-rail"));
          if (mobile && mobileRows === "wipe" && !inRail) {
            tl.fromTo(
              rows,
              { clipPath: "inset(0 100% 0 0)", autoAlpha: 0 },
              {
                clipPath: "inset(0 0% 0 0)",
                autoAlpha: 1,
                duration: 0.5,
                stagger: STAGGER,
                onComplete: () => gsap.set(rows, { clearProps: "clipPath" }),
              },
              0.25,
            );
          } else {
            // Inside a snap rail a translation grows the scrollable area and
            // makes the rail twitch, so rail children scale and fade only.
            tl.from(
              rows,
              { ...(inRail ? { autoAlpha: 0, scale: 0.96 } : rowFrom), duration: dur, stagger },
              0.25,
            );
          }
        }
        if (items.length) {
          tl.from(items, { autoAlpha: 0, y: rise, duration: dur, stagger: stagger / 2 }, 0.2);
        }

        // 2) The heading: words out of a mask once fonts have settled, so the
        //    split measures the real typeface; a phone rises it whole.
        const splits: SplitText[] = [];
        let fontsReady = false;
        let wanted = false;
        let alive = true;
        let timer = 0;
        const play = () => {
          if (!alive) return;
          if (!fontsReady) {
            wanted = true;
            return;
          }
          tl.play();
        };
        const addHeadings = ctx.add("headings", () => {
          if (!alive || fontsReady) return;
          fontsReady = true;
          window.clearTimeout(timer);
          headings.forEach((heading) => {
            if (!heading.isConnected) return;
            if (mobile) {
              gsap.set(heading, { autoAlpha: 1 });
              tl.from(heading, { autoAlpha: 0, y: 12, duration: 0.5 }, 0);
              return;
            }
            try {
              const split = SplitText.create(heading, {
                type: "words",
                mask: "words",
                wordsClass: "hero-line",
                aria: "auto",
              });
              splits.push(split);
              gsap.set(heading, { autoAlpha: 1 });
              tl.from(
                split.words,
                {
                  yPercent: 105,
                  duration: REVEAL.words,
                  stagger: REVEAL.wordStagger,
                  onComplete: () => {
                    // Restore the clean, unsplit heading once the rise lands.
                    split.revert();
                    const i = splits.indexOf(split);
                    if (i >= 0) splits.splice(i, 1);
                  },
                },
                0,
              );
            } catch {
              gsap.set(heading, { autoAlpha: 1 });
              tl.from(heading, { autoAlpha: 0, y: rise, duration: dur }, 0);
            }
          });
          if (wanted) tl.play();
        }) as () => void;

        if (!headings.length) fontsReady = true;
        else if (document.fonts?.status === "loaded") addHeadings();
        else {
          document.fonts?.ready.then(addHeadings);
          timer = window.setTimeout(addHeadings, FONT_WAIT_MS);
        }

        // 3) One trigger for the whole section, kept apart from the timeline.
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: mobile ? REVEAL.startMobile : REVEAL.start,
          once: true,
          onEnter: play,
        });

        return () => {
          alive = false;
          window.clearTimeout(timer);
          trigger.kill();
          splits.forEach((s) => s.revert());
          splits.length = 0;
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [from, mobileRows] },
  );

  const Tag = as as ElementType;
  return (
    <Tag ref={ref} id={id} className={className} style={style} data-section-reveal="">
      {children}
    </Tag>
  );
}
