"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent } from "react";

import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import type { Business, Stat, UnitKey } from "@/content/types";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  HANG,
  SPRING,
  SPRING_HANG,
  SPRING_SOFT,
  onScreenAtMount,
} from "@/lib/gsap";
import { UNIT_ACCENT, unitScope } from "@/lib/units";
import {
  CORD,
  DIE,
  EYE,
  MAX_DROP,
  cordBox,
  cordLength,
  cordPaths,
  edgeShow,
  modeShapes,
  restPose,
  restSway,
  stepSway,
  swayAngles,
  swayAtRest,
  tagDie,
  tagLight,
  tagRing,
  type Mode,
  type ModeShapes,
} from "./tagModel";

interface BusinessTagsProps {
  businesses: Business[];
  /** Each business's floor of Arihant Tower, from the contact settings. */
  floors: Partial<Record<UnitKey, string>>;
  heading: string;
  lead?: string;
}

/* The sway's two modes (tagModel): the slow swing keeps the house hang's
   damping, the quick flick its frequency (HANG, src/lib/gsap). */
const SLOW: Mode = { zeta: HANG.zeta, omega: 5.8 };
const QUICK: Mode = { zeta: 0.4, omega: HANG.omega };

/* Kicks, in degrees a second on the slow mode. A pointer brushing a tag
   gives BRUSH per pixel of travel at BRUSH_SPEED or faster, less when slower,
   so reading a tag never sets it swinging. */
const BRUSH = 0.15;
const BRUSH_SPEED = 800;
const TURN_KICK = 12;
const CATCH_KICK = 36;
/* One shared rail: a neighbour feels this share of a kick, this much later. */
const RAIL_SHARE = 0.08;
const RAIL_DELAY = 0.07;
/* Phones: the share of the rail's change of speed a tag takes as it slides. */
const SWIPE = 0.15;
/* The swing's ceiling, degrees: a cap on speed, never a wall at an angle. */
const MAX_SWING = 7;
const MAX_SWING_PHONE = 5;
const MAX_FLICK = 3;
/* The cord's wind trails the card's turn by this time constant, s. */
const WIND_LAG = 0.07;
/* A pointed-at tag lifts this much about its eyelet. */
const LIFT = 0.012;
/* A card turned by hand carries more weight than a pin seating: the house
   spring's own curve, played this much slower. */
const TURN_TIME = SPRING.duration * 1.3;
/* Hung one by one: held `lift` rem up on a slack cord, it falls, the cord
   snaps taut `over` rem past rest, and it recoils, swinging and spinning. */
const ENTRANCE = { lift: 1.25, over: 0.25, fall: 0.3, stagger: 0.14, spin: 8, kick: 1 };
const ENTRANCE_PHONE = { lift: 0.9, over: 0.18, fall: 0.26, stagger: 0.1, spin: 6, kick: 0.7 };

/* The die and its focus ring, one source for both (tagModel). */
const DIE_CLIP = tagDie();
const RING_CLIP = tagRing();

/* Without JS a tag cannot turn: each back lies flat under its front. */
const NOSCRIPT =
  ".btag .btag-tag{transform:none}" +
  ".btag .btag-tag .btag-face.btag-face--back{grid-area:2/1;transform:none;opacity:1}" +
  ".btag .btag-turn,.btag .btag-edge{display:none}";

/** en-IN figures, years left ungrouped. Mirrors StatBand. */
function formatStat({ value, suffix }: Stat): string {
  const isYear = !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear ? String(value) : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

const subscribeNoop = () => () => {};

interface Live {
  turn: (i: number, target: number) => void;
}

/**
 * "Three businesses, one standard" as swing tags (change round 8, the
 * client's pick from four prototypes; refined 28 October 2026). The garment
 * trade's own object: one card tag per business, tied to a wall-mounted rail
 * by a two-ply cord and printed like the real thing (its logo, name, its line
 * on a stitched woven label, its three figures as spec lines, and a
 * perforated stub with a barcode). Its back, in its colour, carries the asks.
 * Geometry, light and physics in ./tagModel; styles in src/app/tags.css,
 * phone rules in mobile.css section 24.
 *
 * Each tag hangs a little turned and at its own drop (tagModel REST_POSE)
 * and squares up to face whoever points at it, focuses it, or (on a phone)
 * slides it to the middle of the rail.
 *
 * Motion (GSAP, never under reduced motion):
 *  - sway: a cord and a hung card, two damped modes stepped exactly on the
 *    ticker, so the card swings with the cord and flicks against it. Kicked
 *    by a pointer brushing the card, by each turn, by the entrance, through
 *    the rail by a neighbour, and on phones by sliding the rail;
 *  - hung one by one: each card is held up on a slack cord, falls, is caught
 *    as the cord snaps taut, recoils on the spring, swings and spins;
 *  - the turn: one proxy per tag on the house spring drives the card's
 *    rotateY; the cord winds a beat behind it, climbing from the card, the
 *    faces take the light, and the card's edge shows as it passes edge-on.
 * Reduced motion: the rest pose, and a turn is a crossfade. No JS: each back
 * lies under its front.
 */
export function BusinessTags({ businesses, floors, heading, lead }: BusinessTagsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const turnP = useRef(businesses.map(() => ({ p: 0 })));
  const targets = useRef(businesses.map(() => 0));
  const tweens = useRef<(gsap.core.Tween | null)[]>(businesses.map(() => null));
  const live = useRef<Live | null>(null);
  const [flipped, setFlipped] = useState<boolean[]>(() => businesses.map(() => false));
  // `inert` only once hydrated: the server HTML must never inert the backs,
  // or the noscript fallback would show asks nobody can click.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const rack = root.querySelector<HTMLElement>(".btag-rack");
      const row = root.querySelector<HTMLElement>(".btag-row");
      const hangs = Array.from(root.querySelectorAll<HTMLElement>(".btag-hang"));
      const parts = hangs.map((li) => ({
        li,
        swing: li.querySelector<HTMLElement>(".btag-swing")!,
        hinge: li.querySelector<HTMLElement>(".btag-hinge")!,
        tag: li.querySelector<HTMLElement>(".btag-tag")!,
        cordFront: li.querySelector<SVGPathElement>(".btag-cord__front")!,
        cordBack: li.querySelector<SVGPathElement>(".btag-cord__back")!,
        edge: li.querySelector<HTMLElement>(".btag-edge")!,
        lights: Array.from(li.querySelectorAll<HTMLElement>(".btag-light")),
      }));
      const n = parts.length;

      const mm = gsap.matchMedia();
      mm.add(
        {
          desk: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          phone: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const phone = Boolean(ctx.conditions?.phone);
          const swingCap = (phone ? MAX_SWING_PHONE : MAX_SWING) * SLOW.omega;
          const flickCap = MAX_FLICK * QUICK.omega;

          const state = parts.map((_, i) => ({
            sway: restSway(),
            attn: { a: 0 },
            drop: { y: 0 },
            spin: { w: 0 },
            wind: gsap.utils.clamp(0, 1, turnP.current[i].p),
            awake: false,
            drawn: { wind: -1, lift: Number.NaN, yaw: Number.NaN },
          }));
          const want = parts.map(() => ({ hover: false, focus: false, centre: false, on: false }));

          // The card's size sets how its swing splits between cord and card.
          let shapes: ModeShapes[] = [];
          let pendulum: number[] = [];
          const measure = () => {
            const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            shapes = parts.map((p, i) => {
              const w = p.tag.offsetWidth / rootPx || 20;
              const h = p.tag.offsetHeight / rootPx || 26;
              return modeShapes(cordLength(i) + EYE, Math.max(h / 2 - EYE, 1), Math.sqrt((w * w + h * h) / 12));
            });
            pendulum = parts.map((p, i) => (cordLength(i) + (p.tag.offsetHeight / rootPx || 26) / 2) * rootPx);
          };
          measure();

          const setLight = (el: HTMLElement | undefined, l: { dark: number; glow: number }) => {
            if (!el) return;
            el.style.setProperty("--btag-dark", l.dark.toFixed(3));
            el.style.setProperty("--btag-glow", l.glow.toFixed(3));
          };

          const render = (i: number) => {
            const p = parts[i];
            const s = state[i];
            const { cord, hinge } = swayAngles(s.sway, shapes[i]);
            const yaw = turnP.current[i].p * 180 + restPose(i).yaw * (1 - s.attn.a) + s.spin.w;
            p.swing.style.transform = `rotate(${cord.toFixed(3)}deg)`;
            p.hinge.style.transform =
              `translate3d(0, ${s.drop.y.toFixed(4)}rem, 0) rotate(${hinge.toFixed(3)}deg)` +
              ` scale(${(1 + LIFT * s.attn.a).toFixed(4)})`;
            if (!(Math.abs(yaw - s.drawn.yaw) <= 0.005)) {
              p.tag.style.transform = `perspective(var(--btag-persp)) rotateY(${yaw.toFixed(2)}deg)`;
              const light = tagLight(yaw);
              setLight(p.lights[0], light.front);
              setLight(p.lights[1], light.back);
              p.edge.style.opacity = edgeShow(yaw).toFixed(3);
              s.drawn.yaw = yaw;
            }
            const lift = -s.drop.y;
            if (!(Math.abs(s.wind - s.drawn.wind) <= 0.002) || !(Math.abs(lift - s.drawn.lift) <= 0.002)) {
              const d = cordPaths({ length: cordLength(i), wind: s.wind, lift, bow: i % 2 ? -1 : 1 });
              p.cordFront.setAttribute("d", d.front);
              p.cordBack.setAttribute("d", d.back);
              s.drawn.wind = s.wind;
              s.drawn.lift = lift;
            }
          };

          // The ticker runs only while some tag moves, and each tag is on its
          // own layer only while it moves.
          let ticking = false;
          const pending: { i: number; v: number; t: number }[] = [];
          const sleep = (i: number) => {
            state[i].awake = false;
            const p = parts[i];
            for (const el of [p.swing, p.hinge, p.tag]) el.style.removeProperty("will-change");
          };
          const wake = (i: number) => {
            const s = state[i];
            if (!s.awake) {
              s.awake = true;
              const p = parts[i];
              for (const el of [p.swing, p.hinge, p.tag]) el.style.willChange = "transform";
            }
            if (!ticking) {
              ticking = true;
              gsap.ticker.add(tick);
            }
          };

          /** A kick to a tag's sway; through the rail its neighbours feel a
           *  little of it a beat later. */
          const push = (i: number, v1: number, v2 = 0, share = true) => {
            const s = state[i].sway;
            s.v1 = gsap.utils.clamp(-swingCap, swingCap, s.v1 + v1);
            s.v2 = gsap.utils.clamp(-flickCap, flickCap, s.v2 + v2);
            wake(i);
            if (!share) return;
            for (const j of [i - 1, i + 1]) {
              if (j >= 0 && j < n) pending.push({ i: j, v: v1 * RAIL_SHARE, t: RAIL_DELAY });
            }
          };

          /** Square a tag up while anything points at it. */
          const retarget = (i: number) => {
            const w = want[i];
            const on = w.hover || w.focus || w.centre;
            if (on === w.on) return;
            w.on = on;
            parts[i].li.toggleAttribute("data-attn", on);
            gsap.to(state[i].attn, { a: on ? 1 : 0, ...SPRING_SOFT, overwrite: true });
            wake(i);
          };

          // Phones: the rail slides under the thumb, and the tags swing on it
          // like hangers pushed along, then the one in the middle squares up.
          let rowLive = false;
          let lastLeft = 0;
          let vel = 0;
          let lastVel = 0;
          let still = 0;
          const centre = () => {
            if (!row) return;
            const r = row.getBoundingClientRect();
            const mid = r.left + r.width / 2;
            let best = 0;
            let bestD = Infinity;
            hangs.forEach((li, i) => {
              const b = li.getBoundingClientRect();
              const d = Math.abs(b.left + b.width / 2 - mid);
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            });
            want.forEach((w, i) => {
              w.centre = i === best;
              retarget(i);
            });
          };
          const readRow = (h: number) => {
            if (!rowLive || !row) return;
            const left = row.scrollLeft;
            const v = -(left - lastLeft) / h;
            lastLeft = left;
            vel += (v - vel) * (1 - Math.exp(-h / 0.06));
            const dv = vel - lastVel;
            lastVel = vel;
            // The rail speeding up leaves the cards behind it; slowing down
            // sends them on.
            if (Math.abs(dv) > 1) {
              const k = SWIPE * (180 / Math.PI) * dv;
              parts.forEach((_, i) => push(i, k / pendulum[i], 0, false));
            }
            if (Math.abs(vel) < 6) {
              still += h;
              if (still > 0.12) {
                rowLive = false;
                centre();
              }
            } else still = 0;
          };
          const onRowScroll = () => {
            if (!rowLive && row) {
              rowLive = true;
              lastLeft = row.scrollLeft;
              vel = 0;
              lastVel = 0;
              still = 0;
            }
            if (!ticking) {
              ticking = true;
              gsap.ticker.add(tick);
            }
          };

          function tick(_time: number, deltaMs: number) {
            // A long stall plays as one short step, never as a jump.
            const h = Math.min(deltaMs / 1000, 0.05);
            if (h <= 0) return;
            readRow(h);
            for (let k = pending.length - 1; k >= 0; k--) {
              pending[k].t -= h;
              if (pending[k].t <= 0) {
                push(pending[k].i, pending[k].v, 0, false);
                pending.splice(k, 1);
              }
            }
            let busy = pending.length > 0 || rowLive;
            state.forEach((s, i) => {
              if (!s.awake) return;
              stepSway(s.sway, SLOW, QUICK, h);
              const target = gsap.utils.clamp(0, 1, turnP.current[i].p);
              s.wind += (target - s.wind) * (1 - Math.exp(-h / WIND_LAG));
              render(i);
              const moving =
                gsap.isTweening(turnP.current[i]) ||
                gsap.isTweening(s.attn) ||
                gsap.isTweening(s.drop) ||
                gsap.isTweening(s.spin);
              if (!moving && swayAtRest(s.sway) && Math.abs(target - s.wind) < 0.001) {
                s.sway = restSway();
                s.wind = target;
                render(i);
                sleep(i);
              } else busy = true;
            });
            if (!busy) {
              ticking = false;
              gsap.ticker.remove(tick);
            }
          }

          // Pointing: a fine pointer brushing a card swings it, and resting on
          // it squares it up. The rect is read once per visit, not per move.
          const fine = !phone && window.matchMedia("(pointer: fine)").matches;
          const offs: (() => void)[] = [];
          if (fine) {
            parts.forEach((p, i) => {
              let rect: DOMRect | null = null;
              let lastX: number | null = null;
              let lastT = 0;
              const onEnter = (e: PointerEvent) => {
                rect = p.hinge.getBoundingClientRect();
                lastX = e.clientX;
                lastT = e.timeStamp;
                want[i].hover = true;
                retarget(i);
              };
              const onMove = (e: PointerEvent) => {
                if (lastX === null || !rect) {
                  lastX = e.clientX;
                  lastT = e.timeStamp;
                  return;
                }
                const dx = e.clientX - lastX;
                const dt = Math.max((e.timeStamp - lastT) / 1000, 1 / 240);
                lastX = e.clientX;
                lastT = e.timeStamp;
                if (!dx) return;
                const w = Math.min(1, Math.abs(dx) / dt / BRUSH_SPEED);
                const depth = gsap.utils.clamp(0, 1, (e.clientY - rect.top) / rect.height);
                // A push to the right swings the foot right: an anticlockwise,
                // negative angle. Low on the card it swings the whole tag; up
                // by the eyelet it mostly flicks the card on its cord.
                const k = -BRUSH * dx * w;
                push(i, k * (0.15 + 0.85 * depth), 1.5 * k * (1 - depth));
              };
              const onLeave = () => {
                lastX = null;
                rect = null;
                want[i].hover = false;
                retarget(i);
              };
              p.hinge.addEventListener("pointerenter", onEnter);
              p.hinge.addEventListener("pointermove", onMove);
              p.hinge.addEventListener("pointerleave", onLeave);
              offs.push(() => {
                p.hinge.removeEventListener("pointerenter", onEnter);
                p.hinge.removeEventListener("pointermove", onMove);
                p.hinge.removeEventListener("pointerleave", onLeave);
              });
            });
          }
          if (phone && row) {
            row.addEventListener("scroll", onRowScroll, { passive: true });
            offs.push(() => row.removeEventListener("scroll", onRowScroll));
            centre();
          }

          // Take over from the served pose, including a tag left turned while
          // reduced motion or another layout held it.
          parts.forEach((_, i) => render(i));

          // Hung one by one, unless the section was already on screen.
          let entrance: gsap.core.Timeline | null = null;
          let trigger: ScrollTrigger | null = null;
          if (!onScreenAtMount(root)) {
            const E = phone ? ENTRANCE_PHONE : ENTRANCE;
            const tl = gsap.timeline({ paused: true });
            parts.forEach((p, i) => {
              const s = state[i];
              const at = i * E.stagger;
              const side = i % 2 ? -1 : 1;
              tl.fromTo(p.li, { opacity: 0 }, { opacity: 1, duration: E.fall * 0.6, ease: "power1.out" }, at);
              tl.fromTo(
                s.drop,
                { y: -E.lift },
                { y: E.over, duration: E.fall, ease: "power2.in", onStart: () => wake(i) },
                at,
              );
              tl.call(() => push(i, side * CATCH_KICK * E.kick, -side * CATCH_KICK * 0.5 * E.kick), undefined, at + E.fall);
              tl.to(s.drop, { y: 0, ...SPRING }, at + E.fall);
              tl.fromTo(s.spin, { w: side * E.spin }, { w: 0, ...SPRING_HANG, immediateRender: false }, at + E.fall);
            });
            tl.eventCallback("onComplete", () => gsap.set(hangs, { clearProps: "opacity" }));
            entrance = tl;
            parts.forEach((_, i) => render(i));
            trigger = ScrollTrigger.create({
              trigger: rack ?? root,
              start: "top 80%",
              once: true,
              animation: tl,
              toggleActions: "play none none none",
              fastScrollEnd: true,
            });
          }

          // Keyboard: a tag with focus in it squares up, and nothing stays held
          // up for someone tabbing in before the entrance has played.
          const onFocusIn = (e: FocusEvent) => {
            if (entrance && entrance.progress() < 1) entrance.progress(1);
            const t = e.target as HTMLElement;
            const li = t.closest<HTMLElement>(".btag-hang");
            if (!li) return;
            const i = hangs.indexOf(li);
            want[i].focus = t.matches(":focus-visible");
            retarget(i);
          };
          const onFocusOut = (e: FocusEvent) => {
            const li = (e.target as HTMLElement).closest<HTMLElement>(".btag-hang");
            const next = e.relatedTarget as Node | null;
            if (!li || (next && li.contains(next))) return;
            const i = hangs.indexOf(li);
            want[i].focus = false;
            retarget(i);
          };
          root.addEventListener("focusin", onFocusIn);
          root.addEventListener("focusout", onFocusOut);
          ScrollTrigger.addEventListener("refresh", measure);

          live.current = {
            turn: (i, target) => {
              tweens.current[i]?.kill();
              push(i, target ? TURN_KICK : -TURN_KICK);
              tweens.current[i] = gsap.to(turnP.current[i], { p: target, ease: SPRING.ease, duration: TURN_TIME });
              wake(i);
            },
          };

          return () => {
            live.current = null;
            trigger?.kill();
            entrance?.kill();
            gsap.ticker.remove(tick);
            ticking = false;
            offs.forEach((off) => off());
            root.removeEventListener("focusin", onFocusIn);
            root.removeEventListener("focusout", onFocusOut);
            ScrollTrigger.removeEventListener("refresh", measure);
            parts.forEach((p, i) => {
              const s = state[i];
              gsap.killTweensOf([s.attn, s.drop, s.spin]);
              p.li.style.removeProperty("opacity");
              p.li.removeAttribute("data-attn");
              for (const el of [p.swing, p.hinge, p.tag]) {
                el.style.removeProperty("transform");
                el.style.removeProperty("will-change");
              }
              p.edge.style.removeProperty("opacity");
              // Back to the served rest: the pose's own light on both faces
              // (a back shows only once turned, at the same angle to the
              // light), and the cord as wound as the card is turned.
              const rest = tagLight(restPose(i).yaw).front;
              p.lights.forEach((el) => setLight(el, rest));
              const d = cordPaths({ length: cordLength(i), wind: targets.current[i] });
              p.cordFront.setAttribute("d", d.front);
              p.cordBack.setAttribute("d", d.back);
            });
          };
        },
      );
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
    // With motion the card turns on the spring; without it, CSS crossfades
    // the faces from data-side.
    if (live.current) live.current.turn(i, target);
    else turnP.current[i].p = target;

    // A keyboard press (a click with no pointer detail) follows the turn,
    // once React has lifted the face's inert: onto the back's first ask, so
    // the asks come next and "Turn back" after them, or onto "Turn over".
    if (e.detail === 0) {
      const sel = target ? ".btag-face--back :is(a[href], button)" : ".btag-face--front .btag-turn";
      const root = ref.current;
      requestAnimationFrame(() =>
        root
          ?.querySelectorAll<HTMLElement>(".btag-tag")
          [i]?.querySelector<HTMLElement>(sel)
          ?.focus({ preventScroll: true }),
      );
    }
  };

  const rootStyle = {
    "--btag-die": DIE_CLIP,
    "--btag-ring": RING_CLIP,
    "--btag-base": `${CORD.base}rem`,
    "--btag-eye": `${EYE}rem`,
    "--btag-stub": `${DIE.stub}rem`,
    "--btag-notch": `${DIE.notch}rem`,
  } as CSSProperties;

  return (
    <div ref={ref} className="btag container-site section-pad" style={rootStyle}>
      <noscript>
        <style>{NOSCRIPT}</style>
      </noscript>

      <SectionHeading heading={heading} lead={lead} />

      <div className="btag-rack">
        <div className="btag-rail" aria-hidden="true">
          <span className="btag-rail__tube" />
          <span className="btag-rail__mount" />
          <span className="btag-rail__mount btag-rail__mount--end" />
        </div>
        <ul className="btag-row">
          {businesses.map((b, i) => {
            const short = UNIT_ACCENT[b.unit].short;
            const asks = b.audienceCtas.slice(0, 2);
            const floor = floors[b.unit];
            const pose = restPose(i);
            const length = cordLength(i);
            const box = cordBox(length);
            const cord = cordPaths({ length, wind: 0 });
            const restLight = tagLight(pose.yaw).front;
            const lightStyle = {
              "--btag-dark": restLight.dark.toFixed(3),
              "--btag-glow": restLight.glow.toFixed(3),
            } as CSSProperties;
            const hangStyle = {
              ...unitScope(b.unit),
              "--btag-drop": `${pose.drop}rem`,
              "--btag-give": `${(MAX_DROP - pose.drop).toFixed(3)}rem`,
              "--btag-yaw": `${pose.yaw}deg`,
            } as CSSProperties;
            return (
              <li key={b.unit} className="btag-hang" style={hangStyle}>
                <div className="btag-swing">
                  <svg
                    className="btag-cord"
                    viewBox={box.viewBox}
                    preserveAspectRatio="none"
                    style={{ height: `${box.height}rem` }}
                    aria-hidden="true"
                  >
                    <path className="btag-cord__back" d={cord.back} />
                    <path className="btag-cord__front" d={cord.front} />
                  </svg>

                  <div className="btag-hinge">
                    <span className="btag-edge" aria-hidden="true" />
                    <div className="btag-tag" data-side={flipped[i] ? "back" : "front"}>
                      {/* Front: the printed tag. Its turn button stretches over
                          the whole card, so a tap anywhere turns it. */}
                      <div className="btag-face btag-face--front" inert={hydrated ? flipped[i] : undefined}>
                        <div className="btag-card">
                          <span className="btag-eyelet" aria-hidden="true" />
                          <span className="btag-logo" data-unit={b.unit}>
                            <Image src={b.logo} alt="" fill sizes="160px" className="object-contain object-center" />
                          </span>
                          <h3 className="btag-name">{b.name}</h3>
                          {b.tagline ? (
                            <p className="btag-label">
                              {b.tagline}
                              <Stitches />
                            </p>
                          ) : null}
                          <dl className="btag-spec">
                            {b.stats.slice(0, 3).map((s) => (
                              <div key={s.label} className="btag-spec__row">
                                <dt>{s.label}</dt>
                                <dd>{formatStat(s)}</dd>
                              </div>
                            ))}
                          </dl>
                          <Perforation />
                          <div className="btag-stub">
                            <Barcode text={b.name} />
                            <button
                              type="button"
                              className="btag-turn btag-turn--front"
                              onClick={(e) => turn(i, e)}
                              aria-label={`Turn over the ${b.name} tag`}
                            >
                              Turn over{" "}
                              <span className="btag-turn__mark" aria-hidden="true">
                                ↻
                              </span>
                            </button>
                          </div>
                          <span className="btag-light" style={lightStyle} aria-hidden="true" />
                        </div>
                        <Thread />
                      </div>

                      {/* Back: what to do about it. A tap anywhere but on a link
                          turns it back. */}
                      <div className="btag-face btag-face--back" inert={hydrated ? !flipped[i] : undefined}>
                        <div className="btag-card">
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
                          <Perforation />
                          <div className="btag-stub">
                            <button
                              type="button"
                              className="btag-turn btag-turn--back"
                              onClick={(e) => turn(i, e)}
                              aria-label={`Turn the ${b.name} tag back`}
                            >
                              <span className="btag-turn__mark" aria-hidden="true">
                                ↺
                              </span>{" "}
                              Turn back
                            </button>
                          </div>
                          <span className="btag-light" style={lightStyle} aria-hidden="true" />
                        </div>
                        <Thread />
                      </div>
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

/** The woven label's stitching: a running stitch just inside its edge. */
function Stitches() {
  return (
    <svg className="btag-stitch" aria-hidden="true">
      <line x1="0" y1="0" x2="100%" y2="0" />
      <line x1="0" y1="100%" x2="100%" y2="100%" />
      <line x1="0" y1="0" x2="0" y2="100%" />
      <line x1="100%" y1="0" x2="100%" y2="100%" />
    </svg>
  );
}

/** The stub's perforation, punched between the die's two notches. */
function Perforation() {
  return (
    <svg className="btag-perf" aria-hidden="true">
      <line x1="0" y1="50%" x2="100%" y2="50%" />
    </svg>
  );
}

/** The cord's last strand on a face: over the card's head and into the
 *  eyelet. It lies on the face, so it turns with the card. */
function Thread() {
  return (
    <svg className="btag-thread" viewBox="0 0 12 26" preserveAspectRatio="none" aria-hidden="true">
      <path d="M 6 0 L 6 26" />
    </svg>
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
