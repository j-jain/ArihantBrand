import { Button } from "@/components";

/** Standalone charcoal 404 — no header or footer (it renders outside the site
 *  shell). Small, on-brand, and routes the reader straight back to trade. */
export default function NotFound() {
  return (
    <main className="on-dark flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="t-label text-on-charcoal-soft">Error 404</p>
      <h1 className="t-display text-on-charcoal">This rack is empty.</h1>
      <p className="t-lead measure text-on-charcoal-soft">
        {"The page you're looking for has moved off the floor — or never stocked here at all. Let's get you back to something in season."}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        <Button variant="onDark" href="/">
          Back to home
        </Button>
        <a
          href="/contact"
          className="font-sans font-semibold text-on-charcoal underline-offset-4 hover:underline"
        >
          Contact us
          <span aria-hidden="true"> →</span>
        </a>
      </div>
    </main>
  );
}
