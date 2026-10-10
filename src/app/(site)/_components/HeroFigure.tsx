"use client";

import { useEffect, useRef, useState } from "react";
import { CountUp, formatBody } from "@/components/CountUp";

/** "300+" -> the figure and whatever follows it. */
const LEADING = /^(\d[\d,]*)(.*)$/;

/** Longest the figure waits for the hero intro before counting anyway; the
 *  same budget as the intro gate's CSS failsafe (motion.css). */
const FAILSAFE_MS = 3500;
/** The figures' row rises about this far into the intro timeline. */
const INTRO_OFFSET_MS = 350;

/**
 * A home-hero figure that counts up as its row rises in (change round 9; the
 * unit heroes' stat bands already did, and the home figures sat still). The
 * wording is never changed: the figure is parsed out of the line and the rest
 * of the line follows it.
 *
 * Width is reserved by an invisible twin of the final figure laid under the
 * live one, so the hero's right-aligned figure column never moves while a
 * two-digit number is on its way to three (no CLS). The server renders the
 * final figure, and reduced motion or a late script leaves it there.
 */
export function HeroFigure({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(false);
  const match = text.match(LEADING);
  const hasFigure = Boolean(match);

  useEffect(() => {
    if (!hasFigure) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = ref.current?.closest("[data-hero-intro]");
    let timer = 0;
    const go = () => {
      window.clearTimeout(timer);
      setRun(true);
    };
    // No intro gate (the hero is already painted, or the script arrived after
    // the failsafe): count straight away.
    if (!host || !document.documentElement.hasAttribute("data-intro")) {
      timer = window.setTimeout(go, 200);
      return () => window.clearTimeout(timer);
    }
    const onPlay = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(go, INTRO_OFFSET_MS);
    };
    host.addEventListener("heroIntroPlay", onPlay, { once: true });
    timer = window.setTimeout(go, FAILSAFE_MS);
    return () => {
      host.removeEventListener("heroIntroPlay", onPlay);
      window.clearTimeout(timer);
    };
  }, [hasFigure]);

  if (!match) return <>{text}</>;
  const value = Number(match[1].replace(/,/g, ""));
  const suffix = match[2];
  const final = `${formatBody(value, Boolean(suffix))}${suffix}`;

  return (
    <span ref={ref} className="hero-figure">
      <span className="hero-figure__ghost" aria-hidden="true">
        {final}
      </span>
      <span className="hero-figure__live">
        <CountUp value={value} hasSuffix={Boolean(suffix)} run={run} />
        {suffix}
      </span>
    </span>
  );
}
