"use client";

import { gsap } from "./gsap";

/* Static while off screen (performance pass). A loop, a ticker or a setup that
 * only matters while its section is on screen asks here instead of running
 * all the time: loops pause, tickers come off the GSAP ticker, and work that
 * builds a section's motion waits until the section comes near (or until the
 * browser is idle, for set pieces that pin or reflow). It grows the patterns
 * NetworkMap (IntersectionObserver play/pause) and FlipWords (onToggle plus
 * visibilitychange) already had into one place.
 *
 * One IntersectionObserver per root margin is shared by every caller, and a
 * hidden tab counts as off screen. Every helper returns its cleanup, so it
 * drops straight into a useGSAP callback or a gsap.matchMedia branch. */

type Listener = (onScreen: boolean) => void;

interface Entry {
  listeners: Set<Listener>;
  intersecting: boolean;
  /** Last state each listener was told, so a change is reported once. */
  told: Map<Listener, boolean>;
}

interface Observer {
  io: IntersectionObserver;
  entries: Map<Element, Entry>;
}

const observers = new Map<string, Observer>();
let tabHidden = false;
let visibilityBound = false;

function report(entry: Entry): void {
  const onScreen = entry.intersecting && !tabHidden;
  for (const listener of entry.listeners) {
    if (entry.told.get(listener) === onScreen) continue;
    entry.told.set(listener, onScreen);
    listener(onScreen);
  }
}

function bindVisibility(): void {
  if (visibilityBound) return;
  visibilityBound = true;
  tabHidden = document.visibilityState === "hidden";
  document.addEventListener("visibilitychange", () => {
    tabHidden = document.visibilityState === "hidden";
    for (const { entries } of observers.values()) for (const entry of entries.values()) report(entry);
  });
}

function observerFor(margin: string): Observer {
  let observer = observers.get(margin);
  if (observer) return observer;
  const entries = new Map<Element, Entry>();
  const io = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        const entry = entries.get(record.target);
        if (!entry) continue;
        entry.intersecting = record.isIntersecting;
        report(entry);
      }
    },
    { rootMargin: margin },
  );
  observer = { io, entries };
  observers.set(margin, observer);
  return observer;
}

/** Calls `listener(true)` when `el` comes within `margin` of the viewport and
 *  `listener(false)` when it leaves (or the tab is hidden). The first call
 *  arrives with the observer's first report, a frame or so after this. */
export function watchOnScreen(
  el: Element,
  listener: Listener,
  { margin = "0px" }: { margin?: string } = {},
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    listener(true);
    return () => {};
  }
  bindVisibility();
  const observer = observerFor(margin);
  let entry = observer.entries.get(el);
  if (!entry) {
    entry = { listeners: new Set(), intersecting: false, told: new Map() };
    observer.entries.set(el, entry);
    observer.io.observe(el);
  } else if (entry.told.size) {
    // Already observed: the IO will not report again until something
    // changes, so tell the newcomer the current state now.
    const onScreen = entry.intersecting && !tabHidden;
    entry.told.set(listener, onScreen);
    listener(onScreen);
  }
  entry.listeners.add(listener);
  const watched = entry;
  return () => {
    watched.listeners.delete(listener);
    watched.told.delete(listener);
    if (watched.listeners.size) return;
    observer.entries.delete(el);
    observer.io.unobserve(el);
  };
}

/** Pause `anim` while `el` is off screen, resume it when it comes back.
 *  Its timeScale is left alone, so a hover or button ramp keeps working. */
export function pauseOffscreen(
  el: Element,
  anim: gsap.core.Animation,
  opts?: { margin?: string },
): () => void {
  return watchOnScreen(el, (onScreen) => (onScreen ? anim.resume() : anim.pause()), opts);
}

/** Keep `tick` on the GSAP ticker only while `el` is on screen. */
export function tickWhileOnScreen(
  el: Element,
  tick: gsap.TickerCallback,
  opts?: { margin?: string },
): () => void {
  let on = false;
  const stop = watchOnScreen(
    el,
    (onScreen) => {
      if (onScreen === on) return;
      on = onScreen;
      if (onScreen) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    },
    opts,
  );
  return () => {
    stop();
    if (on) gsap.ticker.remove(tick);
    on = false;
  };
}

/** Run `fn` once, the first time `el` comes within `margin` (by default half
 *  a screen ahead, so a section is built before it is seen). */
export function whenNear(
  el: Element,
  fn: () => void,
  { margin = "0px 0px 50% 0px" }: { margin?: string } = {},
): () => void {
  let done = false;
  let stop: () => void = () => {};
  stop = watchOnScreen(
    el,
    (onScreen) => {
      if (!onScreen || done) return;
      done = true;
      // The observer may report inside watchOnScreen, before `stop` exists.
      queueMicrotask(() => stop());
      fn();
    },
    { margin },
  );
  return () => {
    done = true;
    stop();
  };
}

/** Run `fn` when the browser is idle, or after `timeout` ms at the latest. */
export function whenIdle(fn: () => void, { timeout = 500 }: { timeout?: number } = {}): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 1);
  return () => window.clearTimeout(id);
}

/** The setup a lazily built context runs. It is called with that context, so
 *  work that lands later (after fonts, on a timer) is added to IT with
 *  `self.add(...)`. Never add to an outer context (a matchMedia branch's
 *  `ctx`) from inside a setup: GSAP files the outer context inside this one
 *  while the outer still holds this one's cleanup, and the two then revert
 *  each other forever when the page unmounts (the "This page couldn't load"
 *  crash of 7 November 2026: leaving the home page after scrolling it). */
export type LazySetup = (self: gsap.Context) => void | (() => void);

/** Revert a lazily built context exactly once. The slot is emptied BEFORE the
 *  revert, so a cleanup that is reached again from inside the revert (a cycle
 *  of nested contexts) finds nothing to do instead of recursing. */
function revertOnce(slot: { ctx: gsap.Context | null }): void {
  const ctx = slot.ctx;
  slot.ctx = null;
  ctx?.revert();
}

/** Build `setup` in its own GSAP context once `el` comes near, and revert it
 *  on cleanup. The way a below-the-fold section keeps its motion off the
 *  hydration commit: nothing is split, measured or hidden until it matters.
 *  `setup` may return a cleanup of its own, as in gsap.context. */
export function buildWhenNear(
  el: Element,
  setup: LazySetup,
  opts?: { margin?: string; scope?: Element },
): () => void {
  const slot: { ctx: gsap.Context | null } = { ctx: null };
  const cancel = whenNear(el, () => {
    slot.ctx = gsap.context((self) => setup(self), opts?.scope ?? el);
  }, opts);
  return () => {
    cancel();
    revertOnce(slot);
  };
}

/** Build `setup` in its own GSAP context once the browser is idle (pinned and
 *  reflowing set pieces: built off the hydration commit, but long before the
 *  reader can reach them), and revert it on cleanup. */
export function buildWhenIdle(
  setup: LazySetup,
  opts?: { timeout?: number; scope?: Element },
): () => void {
  const slot: { ctx: gsap.Context | null } = { ctx: null };
  const cancel = whenIdle(() => {
    slot.ctx = gsap.context((self) => setup(self), opts?.scope);
  }, opts);
  return () => {
    cancel();
    revertOnce(slot);
  };
}
