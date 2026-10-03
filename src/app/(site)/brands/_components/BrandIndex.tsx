"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { LogoTile, PartnerModal } from "@/components";
import type { Partner } from "@/content/types";
import { EASE, Flip, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { UNIT_ACCENT } from "@/lib/units";

type UnitFilter = "all" | "marketing" | "apparels";
type View = "index" | "logos";

interface BrandIndexProps {
  partners: Partner[];
  /** wa.me link for /brands (whatsappFor), without its prefill. */
  whatsapp: string;
}

const FILTERS: { key: UnitFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "marketing", label: "Arihant Marketing" },
  { key: "apparels", label: "Arihant Apparels" },
];

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

/** Case, accents and punctuation never decide a match: "la scoot" finds
 *  La' Scoot, "re pink" finds RE:PINK, "believe in" finds Believe-In. */
const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const keyOf = (s: string) => fold(s).replace(/[^a-z0-9]/g, "");

function letterOf(name: string): string {
  const first = keyOf(name)[0] ?? "";
  return /[a-z]/.test(first) ? first.toUpperCase() : "#";
}

/** Where `q` (already folded) sits in `name`, in the name's own characters,
 *  so the highlight lands on the letters as written. */
function matchRange(name: string, q: string): [number, number] | null {
  if (!q) return null;
  const map: number[] = [];
  let folded = "";
  for (let i = 0; i < name.length; i++) {
    for (const ch of keyOf(name[i])) {
      folded += ch;
      map.push(i);
    }
  }
  const at = folded.indexOf(q);
  if (at < 0) return null;
  return [map[at], map[at + q.length - 1] + 1];
}

function highlight(name: string, range: [number, number] | null): ReactNode {
  if (!range) return name;
  const [a, b] = range;
  return (
    <>
      {name.slice(0, a)}
      <mark className="bi-mark">{name.slice(a, b)}</mark>
      {name.slice(b)}
    </>
  );
}

/** True once hydrated, false in the server render: the toolbar only shows
 *  when it can answer. */
const noopSubscribe = () => () => {};

const anchorId = (letter: string) => `brands-${letter === "#" ? "0" : letter.toLowerCase()}`;

/**
 * The /brands index (change round 6): every label the group carries, set as
 * an editorial A to Z in large type, with a search that answers "do you
 * carry X?" as you type.
 *
 * Server-rendered in full (every name is real text, readable with JS off and
 * by search engines); the toolbar only becomes usable once JS runs. Each
 * name is a button that opens the shared PartnerModal.
 *
 * Motion, layered so nothing fights:
 *  - groups rise in on scroll, the letter first and its names after it
 *    (below-the-fold groups only, so nothing on screen blinks);
 *  - a search or filter re-flows the names with GSAP Flip: the rest glide to
 *    their new places, returning names fade up, empty letters fold away;
 *  - hovering a name (mouse) floats its logo card beside the cursor on a
 *    spring with a slight tilt from the pointer's speed; keyboard focus
 *    anchors the same card beside the name;
 *  - the toolbar sticks under the header and follows it as it hides.
 * Reduced motion: no reveal, no glide, no follow; the card sits beside the
 * name. Phones: no hover card; a tap opens the modal.
 */
export function BrandIndex({ partners, whatsapp }: BrandIndexProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<gsap.core.Timeline | null>(null);
  const revealRef = useRef<{ settle: () => void } | null>(null);
  const firstFilter = useRef(true);
  const searchId = useId();

  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState<UnitFilter>("all");
  const [view, setView] = useState<View>("index");
  const [hover, setHover] = useState<Partner | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [open, setOpen] = useState(false);

  /* ------------------------------------------------------------ data */
  const sorted = useMemo(
    () => [...partners].sort((a, b) => keyOf(a.name).localeCompare(keyOf(b.name))),
    [partners],
  );

  const groups = useMemo(() => {
    const byLetter = new Map<string, Partner[]>();
    for (const p of sorted) {
      const l = letterOf(p.name);
      byLetter.set(l, [...(byLetter.get(l) ?? []), p]);
    }
    return LETTERS.filter((l) => byLetter.has(l)).map((l) => ({ letter: l, items: byLetter.get(l)! }));
  }, [sorted]);

  const q = keyOf(query);
  const matches = useMemo(() => {
    const set = new Set<string>();
    for (const p of sorted) {
      if (unit !== "all" && p.unit !== unit) continue;
      if (q && !keyOf(p.name).includes(q)) continue;
      set.add(p.slug);
    }
    return set;
  }, [sorted, unit, q]);

  const lettersOn = useMemo(
    () => new Set(groups.filter((g) => g.items.some((p) => matches.has(p.slug))).map((g) => g.letter)),
    [groups, matches],
  );
  const total = partners.length;
  const shown = matches.size;
  const filtered = q !== "" || unit !== "all";

  const openPartner = useCallback((p: Partner) => {
    setSelected(p);
    setOpen(true);
    setHover(null);
  }, []);

  /* --------------------------------------------------------- ready, keys */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, select, [contenteditable='true']") || t.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------------------------------ toolbar follows the header */
  useEffect(() => {
    // Set on the root, so the sticky letters below read the same offset.
    const tools = rootRef.current;
    const header = document.querySelector("header");
    if (!tools || !header) return;
    let last = -1;
    const tick = () => {
      const top = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
      if (top !== last) {
        last = top;
        tools.style.setProperty("--bi-top", `${top}px`);
      }
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  /* --------------------------------------------- scroll-spy for the A-Z */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || view !== "index") return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".bi-group"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveLetter(e.target.getAttribute("data-letter"));
        }
      },
      // The band just under the sticky toolbar: the letter at the top is lit.
      { rootMargin: "-22% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [view, groups]);

  /* ------------------------------------------------- entry reveal (once) */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia(rootRef);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const below = gsap.utils
          .toArray<HTMLElement>(root.querySelectorAll(".bi-group"))
          .filter((g) => g.getBoundingClientRect().top > window.innerHeight * 0.9);
        if (!below.length) return;
        const parts = (g: HTMLElement) => [
          g.querySelector(".bi-letter"),
          ...Array.from(g.querySelectorAll(".bi-item")),
        ];
        below.forEach((g) => gsap.set(parts(g), { autoAlpha: 0, y: 26 }));
        const triggers = ScrollTrigger.batch(below, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            (batch as HTMLElement[]).forEach((g, i) =>
              gsap.to(parts(g), {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
                ease: EASE,
                stagger: 0.03,
                delay: i * 0.08,
                overwrite: true,
              }),
            ),
        });
        // A search must never leave a name hidden behind an un-run reveal.
        revealRef.current = {
          settle: () => {
            triggers.forEach((t) => t.kill());
            below.forEach((g) => gsap.set(parts(g), { autoAlpha: 1, y: 0, overwrite: true }));
            revealRef.current = null;
          },
        };
        return () => {
          revealRef.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  /* ------------------------------------------- filter: show, hide, glide */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope = root.querySelector(view === "index" ? ".bi-groups" : ".bi-logos");
    if (!scope) return;
    if (filtered) revealRef.current?.settle();

    const items = Array.from(scope.querySelectorAll<HTMLElement>("[data-slug]"));
    const groupEls = Array.from(scope.querySelectorAll<HTMLElement>(".bi-group"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = !reduce && !firstFilter.current;
    firstFilter.current = false;

    flipRef.current?.progress(1);
    const letters = groupEls.map((g) => g.querySelector<HTMLElement>(".bi-letter")).filter(Boolean) as HTMLElement[];
    const state = animate ? Flip.getState([...items, ...letters]) : null;

    items.forEach((el) => {
      el.style.display = matches.has(el.dataset.slug ?? "") ? "" : "none";
    });
    groupEls.forEach((g) => {
      const any = Array.from(g.querySelectorAll<HTMLElement>("[data-slug]")).some((el) =>
        matches.has(el.dataset.slug ?? ""),
      );
      g.style.display = any ? "" : "none";
    });

    if (state) {
      flipRef.current = Flip.from(state, {
        duration: 0.5,
        ease: "power3.inOut",
        onEnter: (els) =>
          gsap.fromTo(els, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.12, ease: EASE }),
      });
    }
  }, [matches, view, filtered]);

  /* ------------------------------------------------ the floating card */
  const moveCard = useRef<((x: number, y: number) => void) | null>(null);
  const tiltCard = useRef<((r: number) => void) | null>(null);
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      moveCard.current = (x, y) => gsap.set(card, { x, y });
      tiltCard.current = null;
      return;
    }
    const qx = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3.out" });
    const qy = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3.out" });
    const qr = gsap.quickTo(card, "rotation", { duration: 0.5, ease: "power2.out" });
    moveCard.current = (x, y) => {
      qx(x);
      qy(y);
    };
    tiltCard.current = qr;
  }, []);

  const placeAt = useCallback((x: number, y: number, jump = false) => {
    const card = cardRef.current;
    if (!card) return;
    const w = card.offsetWidth || 224;
    const h = card.offsetHeight || 200;
    const gap = 22;
    let left = x + gap;
    let top = y + gap;
    if (left + w > window.innerWidth - 16) left = x - w - gap;
    if (top + h > window.innerHeight - 16) top = y - h - gap;
    if (jump) gsap.set(card, { x: left, y: top });
    else moveCard.current?.(left, top);
  }, []);

  const lastX = useRef(0);
  const untilt = useRef<gsap.core.Tween | null>(null);
  const onPointerOver = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const btn = (e.target as Element).closest<HTMLElement>(".bi-name");
    if (!btn) return;
    const p = sorted.find((x) => x.slug === btn.dataset.name);
    if (!p) return;
    if (!hover) placeAt(e.clientX, e.clientY, true);
    lastX.current = e.clientX;
    setHover(p);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !hover) return;
    placeAt(e.clientX, e.clientY);
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    if (tiltCard.current) {
      tiltCard.current(Math.max(-7, Math.min(7, dx * 0.5)));
      // Ease back upright once the pointer rests; one pending call at a time.
      untilt.current?.kill();
      untilt.current = gsap.delayedCall(0.09, () => tiltCard.current?.(0));
    }
  };
  const onPointerOut = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const to = (e.relatedTarget as Element | null)?.closest(".bi-name");
    if (!to) setHover(null);
  };
  const onFocusName = (e: React.FocusEvent<HTMLButtonElement>, p: Partner) => {
    if (!e.currentTarget.matches(":focus-visible")) return;
    const r = e.currentTarget.getBoundingClientRect();
    placeAt(r.right - 6, r.top - 10, true);
    setHover(p);
  };

  /* --------------------------------------------- A to Z: land just right */
  /** Before the jump runs (SmoothScroll's document listener, or the native
   *  anchor jump), move the group's anchor so the letter lands just under the
   *  toolbar. Where the toolbar ends depends on the header, which hides while
   *  the page scrolls down and shows on the way up (never under reduced
   *  motion), so the anchor is set per jump. Phones: the toolbar is not
   *  sticky, so the stylesheet's offset stands. */
  const onJump = (letter: string) => {
    const root = rootRef.current;
    const anchor = document.getElementById(anchorId(letter));
    const group = anchor?.parentElement;
    const tools = root?.querySelector<HTMLElement>(".bi-tools");
    if (!anchor || !group || !tools || getComputedStyle(tools).position !== "sticky") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector<HTMLElement>("header");
    const groupTop = group.getBoundingClientRect().top;
    const down = groupTop > tools.getBoundingClientRect().bottom;
    const headerShown = reduce || !down || window.scrollY + groupTop < 240;
    const desired = (headerShown ? header?.offsetHeight ?? 0 : 0) + tools.offsetHeight + 16;
    // Both jumps honour the page's scroll-padding-top; Lenis (SmoothScroll)
    // adds its own 88px offset on top.
    const lenis = document.documentElement.classList.contains("lenis");
    const pad =
      (lenis ? 88 : 0) +
      (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
    anchor.style.top = `${-(desired - pad)}px`;
  };

  /* ------------------------------------------------------------ render */
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `Hello Arihant, do you distribute ${query.trim() || "this brand"}? I would like to stock it.`,
  )}`;

  return (
    <div ref={rootRef} className="bi" data-ready={ready ? "" : undefined} data-view={view}>
      {/* Toolbar: search, business filter, view, count. Usable only with JS,
          so it is held invisible (its space kept) until it is. */}
      <div className="bi-tools">
        <div className="bi-tools__row">
          <div className="bi-search">
            <svg className="bi-search__icon" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.75" />
              <path d="m13 13 4.5 4.5" />
            </svg>
            <label htmlFor={searchId} className="sr-only">
              Find a brand
            </label>
            <input
              ref={inputRef}
              id={searchId}
              className="bi-search__input"
              type="search"
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
              placeholder={`Search ${total} labels`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  if (query) {
                    e.preventDefault();
                    setQuery("");
                  } else inputRef.current?.blur();
                }
              }}
            />
            {query ? (
              <button
                type="button"
                className="bi-search__clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
            ) : (
              <kbd className="bi-search__key" aria-hidden="true">
                /
              </kbd>
            )}
          </div>

          <div className="bi-seg" role="group" aria-label="Filter labels by business">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className="bi-seg__btn"
                aria-pressed={unit === f.key}
                data-unit={f.key}
                onClick={() => setUnit(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bi-seg bi-seg--view" role="group" aria-label="Show labels as">
            {(["index", "logos"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                className="bi-seg__btn"
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "index" ? "Index" : "Logos"}
              </button>
            ))}
          </div>
        </div>

        <div className="bi-tools__row bi-tools__row--sub">
          <nav className="bi-az" aria-label="Jump to a letter">
            {LETTERS.map((l) =>
              lettersOn.has(l) && view === "index" ? (
                <a
                  key={l}
                  href={`#${anchorId(l)}`}
                  className="bi-az__l"
                  aria-current={activeLetter === l ? "true" : undefined}
                  onClick={() => onJump(l)}
                >
                  {l}
                </a>
              ) : (
                <span key={l} className="bi-az__l bi-az__l--off" aria-hidden="true">
                  {l}
                </span>
              ),
            )}
          </nav>
          <p className="bi-count" aria-live="polite">
            {filtered ? `${shown} of ${total} labels` : `${total} labels`}
          </p>
        </div>
      </div>

      {/* The index */}
      {view === "index" ? (
        <ol
          className="bi-groups"
          onPointerOver={onPointerOver}
          onPointerMove={onPointerMove}
          onPointerOut={onPointerOut}
        >
          {groups.map((g) => (
            <li key={g.letter} className="bi-group" data-letter={g.letter}>
              <span id={anchorId(g.letter)} className="bi-anchor" aria-hidden="true" />
              <span className="bi-letter" aria-hidden="true">
                {g.letter}
              </span>
              <ul className="bi-names" aria-label={g.letter === "#" ? "Labels starting with a number" : `Labels starting with ${g.letter}`}>
                {g.items.map((p) => (
                  <li key={p.slug} className="bi-item" data-slug={p.slug} data-unit={p.unit}>
                    <button
                      type="button"
                      className="bi-name"
                      data-name={p.slug}
                      aria-haspopup="dialog"
                      onClick={() => openPartner(p)}
                      onFocus={(e) => onFocusName(e, p)}
                      onBlur={() => setHover(null)}
                    >
                      {highlight(p.name, matchRange(p.name, q))}
                      <span className="sr-only">, {UNIT_ACCENT[p.unit].name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : (
        <div className="bi-logos">
          {sorted.map((p) => (
            <div key={p.slug} className="bi-tile" data-slug={p.slug}>
              <LogoTile partner={p} onSelect={openPartner} />
            </div>
          ))}
        </div>
      )}

      {/* Nothing matched: say so plainly and offer the two ways to ask. */}
      {ready && shown === 0 ? (
        <div className="bi-empty" role="status">
          <p className="bi-empty__title">
            {q ? <>“{query.trim()}” isn&rsquo;t on our list yet.</> : <>No labels in this view.</>}
          </p>
          <p className="t-body text-ink-soft">
            We add labels every season. Ask us and we will tell you whether we can bring it in.
          </p>
          <div className="bi-empty__asks">
            <a className="btn btn-primary" href={waHref} target="_blank" rel="noopener noreferrer">
              <span>Ask if we can source it</span>
              <span className="btn__chevron" aria-hidden="true">
                ▸
              </span>
            </a>
            <Link className="hero-ask group" href="/contact?intent=retailer">
              <span className="underline decoration-line decoration-2 underline-offset-4">Send an enquiry</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* The floating logo card (mouse hover, keyboard focus). It repeats the
          name the button already says, so it is hidden from assistive tech. */}
      <div ref={cardRef} className="bi-card" aria-hidden="true" data-on={hover ? "" : undefined}>
        {hover ? (
          <>
            <div className="bi-card__logo">
              <Image src={hover.image} alt="" fill sizes="13rem" className="object-contain" />
            </div>
            <p className="bi-card__name">{hover.name}</p>
            <p className="bi-card__meta" data-unit={hover.unit}>
              <span className="bi-card__dot" aria-hidden="true" />
              {UNIT_ACCENT[hover.unit].name}
              {hover.category ? <> · {hover.category}</> : null}
            </p>
          </>
        ) : null}
      </div>

      <PartnerModal partner={selected} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
