"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Partner } from "@/content/types";
import { LogoTile } from "./LogoTile";
import { cn } from "./cn";

interface LogoWallProps {
  partners: Partner[];
  filterable?: boolean;
}

type FilterKey = "all" | "marketing" | "apparels";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "marketing", label: "Arihant Marketing" },
  { key: "apparels", label: "Arihant Apparels" },
];

const GRID_STYLE: CSSProperties = {
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
};

/** Responsive logo grid. When filterable, unit pills scope the wall and a live
 *  count reports the visible set. */
export function LogoWall({ partners, filterable = false }: LogoWallProps) {
  const [active, setActive] = useState<FilterKey>("all");

  const visible = useMemo(
    () =>
      active === "all"
        ? partners
        : partners.filter((partner) => partner.unit === active),
    [partners, active],
  );

  return (
    <div className="flex flex-col gap-6">
      {filterable ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter labels by business">
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
          <p className="t-small text-ink-soft" aria-live="polite">
            Showing {visible.length} of {partners.length} labels
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:gap-4" style={GRID_STYLE}>
        {visible.map((partner) => (
          <LogoTile key={partner.slug} partner={partner} />
        ))}
      </div>
    </div>
  );
}
