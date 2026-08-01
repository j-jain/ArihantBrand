"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import type { Partner } from "@/content/types";
import { gsap, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";
import { LogoTile } from "./LogoTile";
import { PartnerModal } from "./PartnerModal";
import { cn } from "./cn";

interface LogoWallProps {
  partners: Partner[];
  filterable?: boolean;
  /** Show only the first N labels. Used where the wall has to be taken in
   *  without scrolling and a "see the full portfolio" link carries the rest;
   *  omitted everywhere the wall is the point of the page. */
  limit?: number;
}

type FilterKey = "all" | "marketing" | "apparels";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "marketing", label: "Arihant Marketing" },
  { key: "apparels", label: "Arihant Apparels" },
];

/* The track minimum is indirected so the mobile layer can pack the wall three
   up instead of two; an inline grid-template-columns would otherwise be
   unreachable from CSS. Undefined above 767px, so this computes to the
   original `minmax(150px, 1fr)`. */
const GRID_STYLE: CSSProperties = {
  gridTemplateColumns: "repeat(auto-fill, minmax(var(--m-logo-min, 150px), 1fr))",
};

/** Responsive logo grid. Every tile is a button opening ONE shared modal keyed
 *  to the selected partner. When filterable, unit pills scope the wall and a
 *  live count reports the visible set. Tiles below the fold batch-reveal on
 *  scroll (reduced-motion + on-screen tiles stay static; nothing is stranded). */
export function LogoWall({
  partners,
  filterable = false,
  limit,
}: LogoWallProps) {
  const [active, setActive] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [open, setOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const scoped =
      active === "all"
        ? partners
        : partners.filter((partner) => partner.unit === active);
    // The cap applies after the filter so a filtered wall shows N of that unit,
    // not the survivors of a pre-cut list. The filterable wall passes no limit,
    // so its live count still reports the whole portfolio.
    return limit === undefined ? scoped : scoped.slice(0, limit);
  }, [partners, active, limit]);

  const handleSelect = (partner: Partner) => {
    setSelected(partner);
    setOpen(true);
  };

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { reduced } = ctx.conditions as {
            reduced: boolean;
            motion: boolean;
          };
          if (reduced) return;

          const tiles = gsap.utils.toArray<HTMLElement>(grid.children);
          if (!tiles.length) return;

          // Only hide tiles below the fold so on-screen tiles (and the just
          // filtered set) never flash; the rest reveal in scroll-order batches.
          const below = tiles.filter(
            (tile) =>
              tile.getBoundingClientRect().top >= window.innerHeight * 0.92,
          );
          if (!below.length) return;

          gsap.set(below, { autoAlpha: 0, y: 16 });
          ScrollTrigger.batch(below, {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: EASE,
                stagger: 0.05,
                overwrite: true,
              }),
          });
        },
      );

      return () => mm.revert();
    },
    { scope: gridRef, dependencies: [active] },
  );

  return (
    <div className="flex flex-col gap-6">
      {filterable ? (
        <div className="brand-filters flex flex-col gap-3">
          <div
            className="brand-filters__row flex flex-wrap gap-2"
            role="group"
            aria-label="Filter labels by business"
          >
            {FILTERS.map((filter) => {
              const isActive = active === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(filter.key)}
                  className={cn(
                    "t-small inline-flex min-h-[44px] items-center rounded-full border px-4 transition-colors",
                    isActive
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink-soft hover:bg-paper-shade hover:text-ink",
                  )}
                  style={{ fontWeight: 650 }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <p className="brand-filters__count t-small text-ink-soft" aria-live="polite">
            Showing {visible.length} of {partners.length} labels
          </p>
        </div>
      ) : null}

      <div ref={gridRef} className="grid gap-3 sm:gap-4" style={GRID_STYLE}>
        {visible.map((partner) => (
          <LogoTile
            key={partner.slug}
            partner={partner}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <PartnerModal
        partner={selected}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
