"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { gsap, SplitText, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";
import { cn } from "../cn";

interface FlipWordsProps {
  words: string[];
  /** Milliseconds each word is held before the next swap (desktop). */
  interval?: number;
  className?: string;
}

/** An inline word that cycles through a list. The first word renders on the
 *  server as real, crawlable text (never aria-hidden); swaps are `aria-live`
 *  "off" so assistive tech is not spammed. Desktop lifts the current word's
 *  characters out and rises the next in with SplitText, animating the slot
 *  width so the surrounding sentence never jumps. Mobile uses a plain
 *  crossfade; reduced motion holds the first word with no timer. The loop
 *  pauses off-screen and while the tab is hidden. */
export function FlipWords({ words, interval = 2600, className }: FlipWordsProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || words.length < 2) return;
      const slot = root.querySelector<HTMLElement>(".flip-words__slot");
      const word = root.querySelector<HTMLElement>(".flip-words__word");
      const measures = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".flip-words__measure > span"),
      );
      if (!slot || !word) return;

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
          if (reduced) return; // first word stays, no timer

          const widths = measures.map((m) => m.getBoundingClientRect().width);
          if (widths[0]) gsap.set(slot, { width: widths[0] });

          let index = 0;
          let paused = false;
          let hidden = false;
          let call: gsap.core.Tween | null = null;
          let inSplit: SplitText | null = null;
          const dur = 0.5;

          const clearIn = () => {
            inSplit?.revert();
            inSplit = null;
          };
          const schedule = () => {
            call = gsap.delayedCall(mobile ? 3.4 : interval / 1000, swap);
          };

          const swap = () => {
            if (paused || hidden) {
              schedule();
              return;
            }
            const next = (index + 1) % words.length;
            const targetWidth = widths[next] || "auto";

            if (mobile) {
              const tl = gsap.timeline({ onComplete: schedule });
              tl.to(word, { autoAlpha: 0, duration: 0.3, ease: EASE });
              tl.to(slot, { width: targetWidth, duration: 0.3, ease: EASE }, 0);
              tl.add(() => {
                word.textContent = words[next];
              });
              tl.to(word, { autoAlpha: 1, duration: 0.3, ease: EASE });
              index = next;
              return;
            }

            clearIn();
            let outSplit: SplitText;
            try {
              outSplit = SplitText.create(word, { type: "chars" });
            } catch {
              word.textContent = words[next];
              index = next;
              schedule();
              return;
            }
            const tl = gsap.timeline({ onComplete: schedule });
            tl.to(outSplit.chars, {
              yPercent: -110,
              autoAlpha: 0,
              stagger: 0.02,
              duration: dur,
              ease: EASE,
            });
            tl.to(slot, { width: targetWidth, duration: dur, ease: EASE }, 0);
            tl.add(() => {
              outSplit.revert();
              word.textContent = words[next];
              try {
                inSplit = SplitText.create(word, { type: "chars" });
                gsap.from(inSplit.chars, {
                  yPercent: 110,
                  autoAlpha: 0,
                  stagger: 0.02,
                  duration: dur,
                  ease: EASE,
                  onComplete: clearIn,
                });
              } catch {
                /* text already swapped in — leave it visible */
              }
            });
            index = next;
          };

          schedule();

          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
              paused = !self.isActive;
            },
          });

          const onVisibility = () => {
            hidden = document.visibilityState === "hidden";
          };
          document.addEventListener("visibilitychange", onVisibility);

          return () => {
            call?.kill();
            clearIn();
            trigger.kill();
            document.removeEventListener("visibilitychange", onVisibility);
            gsap.set(slot, { clearProps: "width" });
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [words, interval] },
  );

  return (
    <span className={cn("flip-words", className)} aria-live="off">
      <span className="flip-words__slot">
        <span className="flip-words__word">{words[0]}</span>
      </span>
      <span className="flip-words__measure" aria-hidden="true">
        {words.map((w, i) => (
          <span key={`${w}-${i}`}>{w}</span>
        ))}
      </span>
    </span>
  );
}

type FlipLeadProps = {
  /** Lead text; a single `{{a|b|c}}` group becomes the flipping words. */
  text: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"p">, "children">;

/** Renders a lead paragraph, turning a single `{{a|b|c}}` template group into a
 *  {@link FlipWords}. With no template group it renders as plain text, so it is
 *  safe to point at any lead string. */
export function FlipLead({ text, className, ...rest }: FlipLeadProps) {
  const match = text.match(/\{\{([^}]+)\}\}/);
  if (!match) {
    return (
      <p className={className} {...rest}>
        {text}
      </p>
    );
  }

  const words = match[1]
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);
  const start = match.index ?? 0;
  const prefix = text.slice(0, start);
  const suffix = text.slice(start + match[0].length);

  return (
    <p className={className} {...rest}>
      {prefix}
      <FlipWords words={words} />
      {suffix}
    </p>
  );
}
