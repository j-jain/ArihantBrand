"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import {
  useRef,
  useSyncExternalStore,
  type ElementType,
  type ReactNode,
} from "react";

type RevealTag = "div" | "section" | "article" | "li" | "span" | "ul";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  as?: RevealTag;
  className?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Client detection without a setState-in-effect: server snapshot is false,
// client snapshot is true, so first paint renders fully visible.
const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

/** In-view reveal that NEVER strands content. It renders fully visible on the
 *  server and first paint; the hidden→visible slide is applied only after
 *  mount, only when motion is allowed, and only to elements not yet in view
 *  (so elements already on screen never flash, and below-fold elements are
 *  hidden while off-screen). */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  as = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const isClient = useIsClient();

  const animate = !isClient || reduce || inView;

  // `as` picks the semantic tag; the union of motion components makes a precise
  // ref type impossible, so widen to ElementType (motion props stay valid).
  const MotionComp = motion[as] as ElementType;

  return (
    <MotionComp
      ref={ref}
      className={className}
      initial={false}
      animate={animate ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.56, delay, ease: EASE }}
    >
      {children}
    </MotionComp>
  );
}
