"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

const getSnapshot = (): boolean => window.matchMedia(QUERY).matches;

// Server and first client paint agree on `false`, so hydration matches; the
// real preference resolves immediately after mount without a mismatch warning.
const getServerSnapshot = (): boolean => false;

/** True when the user has asked the OS to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
