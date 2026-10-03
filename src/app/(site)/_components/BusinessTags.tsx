"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type MouseEvent } from "react";

import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import type { Business, Stat, UnitKey } from "@/content/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { UNIT_ACCENT, unitScope } from "@/lib/units";

interface BusinessTagsProps {
  businesses: Business[];
  /** Each business's floor of Arihant Tower, from the contact settings. */
  floors: Partial<Record<UnitKey, string>>;
  heading: string;
  lead?: string;
}

/* The cord: a two-ply string drawn in a 12 x 72 box. At rest it carries a
   calm BASE twist; turned to its back, the tag has wound TWIST more turns
   into it, and they run out again as it turns back. */
const CORD_W = 12;
const CORD_H = 72;
const CORD_AMP = 1.7;
const BASE = 1.5;
const TWIST = 2.5;
const CORD_STEPS = 48;

/* Sway: a damped spring per tag, kicked by the pointer and by each turn. */
const STIFF = 34;
const DAMP = 3.4;
const KICK = 0.55;
const TURN_KICK = 24;
const MAX_ANGLE = 12;

const RM = "(prefers-reduced-motion: reduce)";

/** Both strands of the cord as two paths: the stretches facing the viewer
 *  (`front`) and the stretches behind (`back`), so the strands visibly cross. */
export function cordPaths(twist: number): { front: string; back: string } {
  const turns = BASE + TWIST * twist;
  const mid = CORD_W / 2;
  let front = "";
  let back = "";
  for (const offset of [0, Math.PI]) {
    let side: boolean | null = null;
    for (let i = 0; i <= CORD_STEPS; i++) {
      const y = (i / CORD_STEPS) * CORD_H;
      const theta = 2 * Math.PI * turns * (y / CORD_H) + offset;
      const x = mid + CORD_AMP * Math.sin(theta);
      const facing = Math.cos(theta) >= 0;
      const pt = `${x.toFixed(2)} ${y.toFixed(2)}`;
      if (facing !== side) {
        // Start a new run on the side the strand has just crossed to; the
        // previous run gets this point too, so the strand never breaks.
        if (side !== null) {
          if (side) front += ` L ${pt}`;
          else back += ` L ${pt}`;
        }
        if (facing) front += ` M ${pt}`;
        else back += ` M ${pt}`;
        side = facing;
      } else if (facing) front += ` L ${pt}`;
      else back += ` L ${pt}`;
    }
  }
  return { front: front.trim(), back: back.trim() };
}

/** en-IN figures, years left ungrouped. Mirrors StatBand. */
function formatStat({ value, suffix }: Stat): string {
  const isYear = !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear ? String(value) : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

const subscribeNoop = () => () => {};

/**
 * "Three businesses, one standard" as swing tags (change round 8, the
 * client's pick from four prototypes). The garment trade's own object: one
 * tag per business, hung on a clothes rail by a two-ply cord and printed like
 * the real thing (name, its line on a band, its three figures as the spec
 * lines, a barcode). Styles in src/app/tags.css, phone rules in mobile.css
 * section 24.
 *
 * Motion (all GSAP, gated on reduced motion):
 *  - the tags drop onto the rail as the section arrives and sway as a fine
 *    pointer passes (a damped spring per tag);
 *  - a tap anywhere on a tag turns it over, a tap anywhere on its back (not
 *    on a link) turns it back. One proxy per tag drives both the tag's
 *    rotateY and the cord: the cord winds as the tag turns, stays wound while
 *    the back shows and unwinds on the way back. `back.out` lets the tag
 *    overshoot and settle like a real one on a string; a tap mid-turn
 *    reverses from wherever it is.
 * Reduced motion: no drop, no sway, an instant turn. No JS: a noscript rule
 * lays each back under its front, so the asks stay reachable.
 */
export function BusinessTags({ businesses, floors, heading, lead }: BusinessTagsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tagEls = useRef<(HTMLDivElement | null)[]>([]);
  const cordFront = useRef<(SVGPathElement | null)[]>([]);
  const cordBack = useRef<(SVGPathElement | null)[]>([]);
  const turnProxy = useRef(businesses.map(() => ({ p: 0 })));
  const targets = useRef(businesses.map(() => 0));
  const tweens = useRef<(gsap.core.Tween | null)[]>([]);
  const sway = useRef(businesses.map(() => ({ a: 0, v: 0 })));
  const [flipped, setFlipped] = useState<boolean[]>(() => businesses.map(() => false));
  // `inert` only once hydrated: the server HTML must never inert the backs,
  // or the noscript fallback would show asks nobody can click.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const rest = cordPaths(0);

  const draw = (i: number) => {
    const p = turnProxy.current[i].p;
    const tag = tagEls.current[i];
    if (tag) tag.style.transform = `perspective(1400px) rotateY(${(p * 180).toFixed(2)}deg)`;
    const { front, back } = cordPaths(p);
    cordFront.current[i]?.setAttribute("d", front);
    cordBack.current[i]?.setAttribute("d", back);
  };

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const hangs = Array.from(root.querySelectorAll<HTMLElement>(".btag-hang"));
      const swings = Array.from(root.querySelectorAll<HTMLElement>(".btag-swing"));
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const state = sway.current;

        gsap.from(hangs, {
          y: -36,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: root, start: "top 65%", once: true },
          onStart: () => state.forEach((s, i) => (s.v = [-70, 55, -45][i % 3])),
        });

        const tick = (_time: number, deltaMs: number) => {
          const dt = Math.min(deltaMs / 1000, 0.05);
          state.forEach((s, i) => {
            if (s.a === 0 && s.v === 0) return;
            s.v += (-STIFF * s.a - DAMP * s.v) * dt;
            s.a = gsap.utils.clamp(-MAX_ANGLE, MAX_ANGLE, s.a + s.v * dt);
            if (Math.abs(s.a) < 0.02 && Math.abs(s.v) < 0.05) {
              s.a = 0;
              s.v = 0;
            }
            if (swings[i]) swings[i].style.transform = `rotate(${s.a.toFixed(3)}deg)`;
          });
        };
        gsap.ticker.add(tick);

        const onMove = (e: PointerEvent) => {
          swings.forEach((el, i) => {
            const r = el.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
            state[i].v += gsap.utils.clamp(-40, 40, e.movementX) * KICK;
          });
        };
        const fine = window.matchMedia("(pointer: fine)").matches;
        if (fine) root.addEventListener("pointermove", onMove);

        return () => {
          gsap.ticker.remove(tick);
          root.removeEventListener("pointermove", onMove);
          swings.forEach((el) => el.style.removeProperty("transform"));
          state.forEach((s) => {
            s.a = 0;
            s.v = 0;
          });
        };
      });
      // The turns are tweened from click handlers, outside this context, so
      // they are killed here by hand.
      const turning = tweens.current;
      return () => {
        mm.revert();
        turning.forEach((t) => t?.kill());
      };
    },
    { scope: ref },
  );

  const turn = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    const target = targets.current[i] ? 0 : 1;
    targets.current[i] = target;
    setFlipped((f) => f.map((v, k) => (k === i ? target === 1 : v)));

    tweens.current[i]?.kill();
    if (window.matchMedia(RM).matches) {
      turnProxy.current[i].p = target;
      draw(i);
    } else {
      sway.current[i].v += target ? TURN_KICK : -TURN_KICK;
      tweens.current[i] = gsap.to(turnProxy.current[i], {
        p: target,
        duration: 1.05,
        ease: "back.out(1.5)",
        onUpdate: () => draw(i),
      });
    }

    // A keyboard press (a click with no pointer detail) follows the turn:
    // focus moves to the face now showing, once React has lifted its inert.
    if (e.detail === 0) {
      const face = target ? "back" : "front";
      requestAnimationFrame(() =>
        tagEls.current[i]
          ?.querySelector<HTMLButtonElement>(`.btag-face--${face} .btag-turn`)
          ?.focus({ preventScroll: true }),
      );
    }
  };

  return (
    <div ref={ref} className="btag container-site section-pad">
      {/* Without JS a tag cannot turn: show each back under its front. */}
      <noscript>
        <style>{`.btag-face--back{grid-area:2/1;transform:none}.btag-turn{display:none}`}</style>
      </noscript>

      <SectionHeading heading={heading} lead={lead} />

      <div className="btag-rack">
        <div className="btag-rail" aria-hidden="true">
          <span className="btag-rail__cap" />
          <span className="btag-rail__cap btag-rail__cap--end" />
        </div>
        <ul className="btag-row">
          {businesses.map((b, i) => {
            const short = UNIT_ACCENT[b.unit].short;
            const asks = b.audienceCtas.slice(0, 2);
            const floor = floors[b.unit];
            return (
              <li key={b.unit} className="btag-hang" style={unitScope(b.unit)}>
                <div className="btag-swing">
                  <svg
                    className="btag-cord"
                    viewBox={`0 0 ${CORD_W} ${CORD_H}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      ref={(el) => {
                        cordBack.current[i] = el;
                      }}
                      className="btag-cord__back"
                      d={rest.back}
                    />
                    <path
                      ref={(el) => {
                        cordFront.current[i] = el;
                      }}
                      className="btag-cord__front"
                      d={rest.front}
                    />
                  </svg>

                  <div
                    ref={(el) => {
                      tagEls.current[i] = el;
                    }}
                    className="btag-tag"
                  >
                    {/* Front: the printed tag. Its turn button stretches over
                        the whole face, so a tap anywhere turns it. */}
                    <div className="btag-face btag-face--front" inert={hydrated ? flipped[i] : undefined}>
                      <span className="btag-eyelet" aria-hidden="true" />
                      <span className="btag-logo">
                        <Image src={b.logo} alt="" fill sizes="120px" className="object-contain object-center" />
                      </span>
                      <h3 className="btag-name">{b.name}</h3>
                      {b.tagline ? <p className="btag-band">{b.tagline}</p> : null}
                      <dl className="btag-spec">
                        {b.stats.slice(0, 3).map((s) => (
                          <div key={s.label} className="btag-spec__row">
                            <dt>{s.label}</dt>
                            <dd>{formatStat(s)}</dd>
                          </div>
                        ))}
                      </dl>
                      <Barcode text={b.name} />
                      <button
                        type="button"
                        className="btag-turn btag-turn--front"
                        onClick={(e) => turn(i, e)}
                        aria-label={`Turn over the ${b.name} tag`}
                      >
                        Turn over <span aria-hidden="true">↻</span>
                      </button>
                    </div>

                    {/* Back: what to do about it. A tap anywhere but on a link
                        turns it back. */}
                    <div className="btag-face btag-face--back" inert={hydrated ? !flipped[i] : undefined}>
                      <span className="btag-eyelet" aria-hidden="true" />
                      <p className="btag-back__line">{b.positioning}</p>
                      <p className="btag-back__meta">
                        {floor ? (
                          <>
                            {floor}, Arihant Tower
                            <br />
                          </>
                        ) : null}
                        {b.leaders.join(" & ")}
                      </p>
                      <div className="btag-back__asks">
                        {asks[0] ? (
                          <Button href={asks[0].href} variant="onDark" className="press">
                            {asks[0].label}
                          </Button>
                        ) : null}
                        {asks[1] ? (
                          <Link href={asks[1].href} className="btag-back__link">
                            {asks[1].label} <span aria-hidden="true">▸</span>
                          </Link>
                        ) : null}
                        <Link href={`/${b.slug}`} className="btag-back__link">
                          Explore {short} <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                      <button
                        type="button"
                        className="btag-turn btag-turn--back"
                        onClick={(e) => turn(i, e)}
                        aria-label={`Turn the ${b.name} tag back`}
                      >
                        <span aria-hidden="true">↺</span> Turn back
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** A decorative barcode drawn from the name's letters: the same name always
 *  draws the same bars, and no number is printed under it. */
function Barcode({ text }: { text: string }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (const ch of text.toUpperCase().replace(/[^A-Z]/g, "")) {
    const c = ch.charCodeAt(0);
    const w = 1 + (c % 3);
    bars.push({ x, w });
    x += w + 1 + ((c >> 2) % 2);
    bars.push({ x, w: 1 });
    x += 2 + (c % 2);
  }
  return (
    <svg className="btag-barcode" viewBox={`0 0 ${x} 24`} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={0} width={b.w} height={24} />
      ))}
    </svg>
  );
}
