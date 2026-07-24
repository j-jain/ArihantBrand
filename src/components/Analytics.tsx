import Script from "next/script";

/**
 * Plausible, and only Plausible.
 *
 * Chosen over GA4 because it sets no cookies and stores no personal data,
 * which is why this site needs no consent banner (change brief, X10: not
 * needed, and this is the reason). One 1 KB script, loaded after the page is
 * interactive, no third-party cookies, no cross-site identifiers.
 *
 * It renders NOTHING unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, so local
 * development, preview builds and the current production build (no account
 * yet) ship zero third-party requests. DESIGN.md's zero-third-party-scripts
 * rule is amended for exactly this one script and nothing else.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io";

  return (
    <>
      <Script
        defer
        data-domain={domain}
        // `script.tagged-events` is what lets a plain className on a link
        // report a goal, so tracking a CTA needs no onClick handler and no
        // client component (see `trackClass` below).
        src={`${host}/js/script.tagged-events.js`}
        strategy="afterInteractive"
      />
      {/* The queue stub, so an event fired before the script arrives is not
          dropped. Plausible's own documented snippet. */}
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
    </>
  );
}

/**
 * Mark an element as a tracked goal. Returns the class names Plausible's
 * tagged-events build looks for, so a server-rendered link or button can
 * report a conversion without becoming a client component.
 *
 * Usage: `className={cn("btn", trackClass("CTA: brand list"))}`
 */
export function trackClass(goal: string): string {
  return `plausible-event-name=${goal.replace(/\s+/g, "+")}`;
}

/** Fire a goal from client code (the inquiry form's submit handler). Safe to
 *  call when analytics is not configured: the stub swallows it. */
export function track(goal: string, props?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const p = (window as unknown as { plausible?: (...args: unknown[]) => void })
    .plausible;
  if (typeof p === "function") p(goal, props ? { props } : undefined);
}
