"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { phrase } from "@/content/facts";
import { businesses } from "@/content/seed";
import { DUR, EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Button } from "./Button";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import { primaryNav } from "./nav";

interface SiteHeaderProps {
  /** Digits with country code, e.g. "919435045528". Powers the direct-contact
   *  row at the foot of the mobile sheet; omit it and the row is not rendered. */
  whatsapp?: string;
}

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
      aria-label="Arihant Group home"
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

export function SiteHeader({ whatsapp }: SiteHeaderProps = {}) {
  const isActive = useActive();
  const pathname = usePathname();

  const [businessesOpen, setBusinessesOpen] = useState(false);
  // The panel is kept mounted through its close animation, then unmounted, so
  // it can animate out before it leaves the DOM (and is never in the SSR DOM
  // while closed — hidden states come from JS only).
  const [panelVisible, setPanelVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const businessPanelRef = useRef<HTMLDivElement>(null);
  const sheetPanelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const disclosureId = useId();
  const sheetId = useId();

  const businessesActive = businesses.some((b) => isActive(`/${b.slug}`));

  // Latest interaction flags, kept current for the long-lived scroll handler so
  // it can read them without being re-created.
  const flagsRef = useRef({ menuOpen, businessesOpen, panelVisible });
  useEffect(() => {
    flagsRef.current = { menuOpen, businessesOpen, panelVisible };
  });

  // Hover-intent timers + pointer capability (fine pointers only).
  const finePointerRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  useEffect(() => {
    finePointerRef.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
  }, []);

  const openBusinesses = useCallback(() => {
    setPanelVisible(true);
    setBusinessesOpen(true);
  }, []);
  const closeBusinesses = useCallback(() => {
    setBusinessesOpen(false);
  }, []);
  const toggleBusinesses = useCallback(() => {
    if (businessesOpen) closeBusinesses();
    else openBusinesses();
  }, [businessesOpen, openBusinesses, closeBusinesses]);

  const cancelOpenTimer = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };
  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const onTriggerEnter = useCallback(() => {
    if (!finePointerRef.current) return;
    cancelCloseTimer();
    if (openTimerRef.current || businessesOpen) return;
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      openBusinesses();
    }, 120);
  }, [businessesOpen, openBusinesses]);

  const onHeaderEnter = useCallback(() => {
    if (!finePointerRef.current) return;
    cancelCloseTimer();
  }, []);

  const onHeaderLeave = useCallback(() => {
    if (!finePointerRef.current) return;
    cancelOpenTimer();
    if (!businessesOpen) return;
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      closeBusinesses();
    }, 180);
  }, [businessesOpen, closeBusinesses]);

  // Clear any pending hover timers on unmount.
  useEffect(
    () => () => {
      cancelOpenTimer();
      cancelCloseTimer();
    },
    [],
  );

  // Close the panel and the sheet whenever the route changes — adjusted during
  // render (the React-recommended pattern) rather than in an effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setBusinessesOpen(false);
    setPanelVisible(false);
    setMenuOpen(false);
  }

  // Desktop panel: outside-click + Escape close (bounded to the whole header so
  // the trigger and the full-width panel both count as "inside").
  useEffect(() => {
    if (!businessesOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeBusinesses();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBusinesses();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [businessesOpen, closeBusinesses]);

  // Desktop panel open/close choreography (clip-path draw + column stagger).
  useGSAP(
    () => {
      const panel = businessPanelRef.current;
      if (!panel || !panelVisible) return;

      const cols = gsap.utils.toArray<HTMLElement>(
        panel.querySelectorAll(".nav-panel__col"),
      );
      const foot = panel.querySelector<HTMLElement>(".nav-panel__foot");
      const items = foot ? [...cols, foot] : cols;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (businessesOpen) {
          gsap.set(panel, { autoAlpha: 1, clipPath: "none" });
          gsap.set(items, { autoAlpha: 1, y: 0 });
        } else {
          setPanelVisible(false);
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (businessesOpen) {
          // Hidden state applied synchronously (no flash of the open panel).
          gsap.set(panel, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });
          gsap.set(items, { y: 10, autoAlpha: 0 });
          const tl = gsap.timeline();
          tl.to(panel, {
            autoAlpha: 1,
            clipPath: "inset(0 0 0% 0)",
            duration: 0.34,
            ease: EASE,
          }).to(
            items,
            { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.34, ease: EASE },
            0.05,
          );
        } else {
          const dur = 0.34 * 0.65; // exit ~65% of enter
          const tl = gsap.timeline({
            onComplete: () => setPanelVisible(false),
          });
          tl.to(items, {
            y: 8,
            autoAlpha: 0,
            duration: dur,
            ease: EASE,
          }).to(
            panel,
            {
              autoAlpha: 0,
              clipPath: "inset(0 0 100% 0)",
              duration: dur,
              ease: EASE,
            },
            0,
          );
        }
      });

      return () => mm.revert();
    },
    { dependencies: [businessesOpen, panelVisible] },
  );

  // Hide-on-scroll-down / show-on-scroll-up. Applies to every non-reduced
  // context (mobile included); reduced-motion leaves the header untouched
  // (always visible, never transformed).
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let hidden = false;
        const show = () => {
          if (!hidden) return;
          hidden = false;
          gsap.to(header, {
            yPercent: 0,
            duration: 0.32,
            ease: "power2.out",
            overwrite: true,
          });
        };
        const hide = () => {
          if (hidden) return;
          hidden = true;
          gsap.to(header, {
            yPercent: -100,
            duration: 0.32,
            ease: "power2.out",
            overwrite: true,
          });
        };
        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const f = flagsRef.current;
            // Never hide while a menu/panel is open or focus is in the header.
            if (
              f.menuOpen ||
              f.businessesOpen ||
              f.panelVisible ||
              header.contains(document.activeElement)
            ) {
              show();
              return;
            }
            if (self.direction === 1 && self.scroll() > 240) hide();
            else show();
          },
        });
        return () => {
          st.kill();
          gsap.set(header, { yPercent: 0 });
        };
      });
      return () => mm.revert();
    },
    { dependencies: [] },
  );

  // Mobile sheet: body scroll lock, Escape close, focus trap + focus return.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = sheetPanelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
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

  // Mobile sheet: staggered link reveal on open.
  useGSAP(
    () => {
      if (!menuOpen) return;
      const panel = sheetPanelRef.current;
      if (!panel) return;
      const items = gsap.utils.toArray<HTMLElement>(
        panel.querySelectorAll("[data-sheet-item]"),
      );
      if (items.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(items, { y: 14, autoAlpha: 0 });
        gsap.to(items, {
          y: 0,
          autoAlpha: 1,
          stagger: 0.045,
          duration: DUR,
          ease: EASE,
        });
      });
      return () => mm.revert();
    },
    { dependencies: [menuOpen] },
  );

  return (
    <>
      <header
        ref={headerRef}
        className="site-header"
        onMouseEnter={onHeaderEnter}
        onMouseLeave={onHeaderLeave}
      >
        <div className="container-header flex h-16 items-center justify-between gap-4">
          <Wordmark />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            <button
              ref={triggerRef}
              type="button"
              className="nav-link gap-1"
              aria-haspopup="true"
              aria-expanded={businessesOpen}
              aria-controls={disclosureId}
              data-active={businessesActive || undefined}
              onClick={toggleBusinesses}
              onMouseEnter={onTriggerEnter}
            >
              Businesses
              <span aria-hidden="true" className="nav-caret text-ink-soft">
                ▾
              </span>
            </button>

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

        {/* Desktop full-width Businesses panel (absolute below the header — no
            layout shift). Kept out of the SSR DOM while closed. */}
        {panelVisible ? (
          <div
            id={disclosureId}
            ref={businessPanelRef}
            className="nav-panel"
            aria-label="Businesses"
          >
            <div className="container-header nav-panel__inner">
              <div className="nav-panel__grid">
                {businesses.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/${b.slug}`}
                    className="nav-panel__col"
                    data-active={isActive(`/${b.slug}`) || undefined}
                  >
                    <Image
                      src={b.logo}
                      alt=""
                      width={144}
                      height={36}
                      className="nav-panel__logo"
                      unoptimized
                    />
                    <span className="nav-panel__name">{b.name}</span>
                    <span className="nav-panel__pos t-small">
                      {b.positioning}
                    </span>
                    <span
                      className="nav-panel__explore t-label"
                      aria-hidden="true"
                    >
                      Explore
                      <span className="nav-panel__arrow">→</span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="nav-panel__foot">
                <Link href="/brands" className="nav-panel__footlink t-small">
                  All {phrase.groupLabels} labels <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/recognition"
                  className="nav-panel__footlink t-small"
                >
                  Recognition <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Mobile sheet — rendered as a sibling of the header so the header's
          hide-on-scroll transform never becomes the containing block for the
          sheet's fixed positioning. */}
      {menuOpen ? (
        <div className="menu-sheet lg:hidden" id={sheetId}>
          <div
            className="menu-sheet__overlay"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={sheetPanelRef}
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

            {/* The sheet is `lg:hidden`, so it is also what a 768-1023px tablet
                sees. Every original utility class stays exactly as it was and
                the new hooks only carry rules inside the mobile media query,
                which keeps that range byte-identical. */}
            <nav
              className="menu-sheet__nav mt-8 flex flex-1 flex-col"
              aria-label="Primary (mobile)"
            >
              <span className="t-label menu-sheet__eyebrow mb-1 text-ink-soft">
                Businesses
              </span>
              {businesses.map((b) => (
                <Link
                  key={b.slug}
                  href={`/${b.slug}`}
                  className="menu-sublink"
                  data-sheet-item
                  data-active={isActive(`/${b.slug}`) || undefined}
                >
                  <Image
                    src={b.logo}
                    alt=""
                    width={96}
                    height={24}
                    className="menu-sublink__logo"
                    unoptimized
                  />
                  {b.name}
                </Link>
              ))}
              <span className="menu-sheet__gap mt-4" />
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="menu-link"
                  data-sheet-item
                  data-active={isActive(item.href) || undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Foot of the sheet: the ask, then the two things a trade visitor
                actually reaches for on a phone. Kept together so the thumb
                never has to travel back up. */}
            <div className="menu-sheet__foot mt-6" data-sheet-item>
              <Button
                href="/partner"
                variant="primary"
                size="lg"
                className="w-full press"
              >
                Partner with us
              </Button>

              {/* Phone-only: `md:hidden` keeps the 768-1023px sheet exactly as
                  it was, since this row is new. */}
              {whatsapp ? (
                <div className="menu-sheet__contact md:hidden">
                  <a className="menu-sheet__action press" href={`tel:+${whatsapp}`}>
                    <PhoneIcon />
                    Call
                  </a>
                  <a
                    className="menu-sheet__action press"
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
