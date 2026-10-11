"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Testimonial } from "@/content/types";

interface TestimonialColumnsProps {
  testimonials: Testimonial[];
  /** Columns from 768px up. Three on /recognition's full-width band; two
   *  where the wall shares a row with other content (the home awards band). */
  columns?: 2 | 3;
  /** "dark" sets the cards for a charcoal ground. */
  tone?: "paper" | "dark";
}

/** Each column's loop in seconds, at its own pace so the wall never beats in
 *  step. The inline `--tcol-dur` hands it to the keyframe; the JS loop reads
 *  the same figure back off the column (loopSeconds), these being its
 *  fallback. */
const COLUMN_SECONDS = [38, 46, 42];

/** The seconds the CSS keyframe loop takes, read off the track BEFORE its
 *  keyframe is switched off (after that the computed duration is 0s). */
function loopSeconds(el: HTMLElement, fallback: number): number {
  const raw = getComputedStyle(el).animationDuration.split(",")[0].trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return raw.endsWith("ms") ? n / 1000 : n;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function TestimonialCard({
  testimonial,
  duplicate = false,
}: {
  testimonial: Testimonial;
  /** The seamless-loop copy — hidden from assistive tech. */
  duplicate?: boolean;
}) {
  return (
    <figure className="tcol__card" aria-hidden={duplicate || undefined}>
      <blockquote className="tcol__quote">{testimonial.quote}</blockquote>
      <figcaption className="tcol__foot">
        <span className="tcol__avatar" aria-hidden="true">
          {initialsOf(testimonial.name)}
        </span>
        <span className="tcol__meta">
          <span className="tcol__name">{testimonial.name}</span>
          <span className="tcol__role">{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** A wall of testimonials. From 768px up it shows two or three columns of
 *  gently self-scrolling cards (each column a marquee at its own pace,
 *  paused on hover/focus), the same count at every width so the wall never
 *  re-flows; mobile shows the first four as a snap rail. The
 *  duplicated marquee copy is `aria-hidden`, and reduced motion / the global
 *  motion reset leave every column static. The CSS keyframe (motion.css) is
 *  the loop every visitor gets at once, with or without JS; once JS runs with
 *  motion allowed, one GSAP tween per column takes its track over at the
 *  keyframe's own pace (`data-loop="js"`, which the stylesheet answers by
 *  switching the keyframe off), so a pause slows to a stop and a resume
 *  gathers speed again where the play-state snapped. Since change round 9 a
 *  pause button under the wall stops it for a keyboard or a touch screen
 *  (WCAG 2.2.2), the way the brand marquee's does; hover was the only pause
 *  before. */
export function TestimonialColumns({
  testimonials,
  columns: count = 3,
  tone = "paper",
}: TestimonialColumnsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Installed by the running motion branch: re-reads hover, focus and the
  // [data-paused] attribute and ramps the loops to match. Null under reduced
  // motion and on phones, where no column moves.
  const syncRef = useRef<((instant?: boolean) => void) | null>(null);
  const [paused, setPaused] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const grid = root.querySelector<HTMLElement>(".tcols__grid");
      const tracks = Array.from(
        root.querySelectorAll<HTMLElement>(".tcol__track"),
      );
      if (!grid || tracks.length === 0) return;

      const mm = gsap.matchMedia(rootRef);

      // Only the desktop branch moves: under 768px the grid is `display: none`
      // and the phone shows the static snap rail, so there is no mobile loop
      // to drive; reduced motion matches neither query and keeps the CSS
      // `animation: none`.
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        () => {
          const loops = tracks.map((track, i) => {
            // Read the pace first: `data-loop` hands the transform to JS (the
            // stylesheet switches the keyframe off under it, which also
            // zeroes the computed duration). The tracks already hold their
            // own layer (`will-change: transform` in motion.css).
            const seconds = loopSeconds(track, COLUMN_SECONDS[i] ?? 42);
            track.setAttribute("data-loop", "js");
            return gsap.to(track, {
              yPercent: -50,
              duration: seconds,
              ease: "none",
              repeat: -1,
            });
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
              loops.forEach((loop) => loop.timeScale(next));
              return;
            }
            // Slows to a stop over 0.6s and picks back up over 0.8s, every
            // column on one ramp.
            ramp = gsap.to(loops, {
              timeScale: next,
              duration: next ? 0.8 : 0.6,
              ease: "power2.out",
              overwrite: true,
            });
          };

          // Hover is a mouse (or pen) notion: a finger tapping a card would
          // otherwise stop and restart the wall for nothing. Touch has the
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
            // Focus moving between two things inside the wall is not a leave.
            if (grid.contains(e.relatedTarget as Node | null)) return;
            focus = false;
            sync();
          };
          grid.addEventListener("pointerenter", onEnter);
          grid.addEventListener("pointerleave", onLeave);
          grid.addEventListener("focusin", onFocusIn);
          grid.addEventListener("focusout", onFocusOut);
          syncRef.current = sync;
          // The branch can (re)build while the button already holds the wall
          // (a window resized across 768px): start stopped, with no ramp.
          sync(true);

          return () => {
            grid.removeEventListener("pointerenter", onEnter);
            grid.removeEventListener("pointerleave", onLeave);
            grid.removeEventListener("focusin", onFocusIn);
            grid.removeEventListener("focusout", onFocusOut);
            syncRef.current = null;
            ramp?.kill();
            loops.forEach((loop) => loop.kill());
            // The context has already put each track's transform back;
            // handing the loops to the keyframe is the last step.
            tracks.forEach((track) => track.removeAttribute("data-loop"));
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

  if (testimonials.length === 0) return null;

  const columns: Testimonial[][] = Array.from({ length: count }, () => []);
  testimonials.forEach((t, i) => {
    columns[i % count].push(t);
  });

  return (
    <div
      ref={rootRef}
      className={tone === "dark" ? "tcols tcols--dark" : "tcols"}
      style={{ ["--tcols" as string]: count }}
      data-paused={paused ? "" : undefined}
    >
      {/* Mobile: the first four as a horizontal snap rail (see .tcols__mobile
          in mobile.css). `display: none` above 767px keeps this out of the
          desktop tab order entirely, so the tabindex the scroll region needs
          costs nothing there. */}
      <ul
        className="tcols__mobile m-rail m-rail-wide"
        tabIndex={0}
        aria-label="Testimonials"
      >
        {testimonials.slice(0, 4).map((t) => (
          <li key={`m-${t.name}-${t.role}`}>
            <TestimonialCard testimonial={t} />
          </li>
        ))}
      </ul>

      {/* Tablet / desktop: self-scrolling columns. */}
      <div className="tcols__grid">
        {columns.map((col, ci) => (
          <div className="tcol" key={`col-${ci}`}>
            <div
              className="tcol__track"
              style={{ ["--tcol-dur" as string]: `${COLUMN_SECONDS[ci]}s` }}
            >
              {col.map((t) => (
                <TestimonialCard
                  key={`${ci}-a-${t.name}-${t.role}`}
                  testimonial={t}
                />
              ))}
              {col.map((t) => (
                <TestimonialCard
                  key={`${ci}-b-${t.name}-${t.role}`}
                  testimonial={t}
                  duplicate
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* The stop for a keyboard and for touch (hidden on phones, where the
          rail does not move, and under reduced motion, where nothing does). */}
      <button
        type="button"
        className="tcols__toggle press"
        aria-pressed={paused}
        aria-label="Pause the testimonials"
        title="Pause the testimonials"
        onClick={() => setPaused((p) => !p)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
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
