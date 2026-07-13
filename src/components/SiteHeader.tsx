"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "./Button";
import { businessLinks, primaryNav } from "./nav";
import { cn } from "./cn";

function useActive() {
  const pathname = usePathname();
  return useCallback(
    (href: string) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex items-baseline gap-1.5"
      aria-label="Arihant Group — home"
    >
      <span
        className="font-display text-ink"
        style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}
      >
        ARIHANT
      </span>
      <span
        className="font-sans text-ink-soft"
        style={{ fontWeight: 650, fontSize: "0.7rem", letterSpacing: "0.18em" }}
      >
        GROUP
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const isActive = useActive();
  const pathname = usePathname();
  const [businessesOpen, setBusinessesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const disclosureId = useId();
  const sheetId = useId();

  const businessesActive = businessLinks.some((link) => isActive(link.href));

  // Close the disclosure and the sheet whenever the route changes — adjusted
  // during render (the React-recommended pattern) rather than in an effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setBusinessesOpen(false);
    setMenuOpen(false);
  }

  // Desktop disclosure: outside-click + Escape close.
  useEffect(() => {
    if (!businessesOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!disclosureRef.current?.contains(event.target as Node)) {
        setBusinessesOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBusinessesOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [businessesOpen]);

  // Mobile sheet: body scroll lock, Escape close, focus trap.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusables?.[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const trigger = menuButtonRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Wordmark />

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Primary"
        >
          <div ref={disclosureRef} className="relative">
            <button
              type="button"
              className="nav-link gap-1"
              aria-haspopup="true"
              aria-expanded={businessesOpen}
              aria-controls={disclosureId}
              data-active={businessesActive || undefined}
              onClick={() => setBusinessesOpen((open) => !open)}
            >
              Businesses
              <span aria-hidden="true" className="text-ink-soft">
                ▾
              </span>
            </button>
            {businessesOpen ? (
              <div id={disclosureId} className="nav-disclosure">
                {businessLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={isActive(link.href) || undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              data-active={isActive(item.href) || undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/partner" variant="primary">
            Partner with us
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={menuButtonRef}
          type="button"
          className="flex h-11 w-11 items-center justify-center lg:hidden"
          aria-expanded={menuOpen}
          aria-controls={sheetId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="text-ink"
            aria-hidden="true"
          >
            {menuOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile sheet */}
      {menuOpen ? (
        <div className="menu-sheet lg:hidden" id={sheetId}>
          <div
            className="menu-sheet__overlay"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={panelRef}
            className="menu-sheet__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between">
              <Wordmark onClick={() => setMenuOpen(false)} />
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  className="text-ink"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav
              className="mt-8 flex flex-1 flex-col"
              aria-label="Primary (mobile)"
            >
              <span className="t-label mb-1 text-ink-soft">Businesses</span>
              {businessLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="menu-sublink"
                  data-active={isActive(link.href) || undefined}
                >
                  {link.label}
                </Link>
              ))}
              <span className="mt-4" />
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="menu-link"
                  data-active={isActive(item.href) || undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className={cn("mt-6")}>
              <Button href="/partner" variant="primary" size="lg" className="w-full">
                Partner with us
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
