import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Business, UnitKey } from "@/content/types";
import { UNIT_ACCENT } from "@/lib/units";

/* The house drawn (change round 10): Arihant Tower as a line elevation
   beside the three-house ledger, one storey per business, level with its
   row. The floors come from the contact settings (the same source the
   leaders ledger prints), never typed here; a business whose floor the
   settings do not name keeps its row and the elevation is not drawn, so
   the drawing can never claim a floor the data does not. Line work only,
   axis-aligned, so the elevation may stretch to the rows' height without
   distorting (vector-effect keeps the strokes crisp). Each storey's windows
   carry that business's accent as a quiet wash, the index-mark use the
   page already makes of the three colours. */

/* Founding date-stamp on the ledger: Archivo condensed with tabular
   figures, matching the stat treatment on the unit pages but held quiet; it
   is a date, not a headline number. */
const foundedStyle: CSSProperties = {
  fontFamily: "var(--font-archivo), system-ui, sans-serif",
  fontWeight: 700,
  fontStretch: "85%",
  fontVariantNumeric: "tabular-nums",
  fontSize: "1rem",
  lineHeight: 1.1,
  color: "var(--ink)",
};

/** "Ground Floor" → 0, "1st Floor" → 1, "2nd Floor" → 2; anything else null. */
export function floorRank(floor: string | undefined): number | null {
  if (!floor) return null;
  const f = floor.trim().toLowerCase();
  if (/^(ground|g)\b/.test(f)) return 0;
  const m = /^(\d+)/.exec(f);
  return m ? Number(m[1]) : null;
}

interface TowerLedgerProps {
  businesses: Business[];
  /** Floor of Arihant Tower per unit, from `siteSettings.contacts`. */
  floors: Partial<Record<UnitKey, string>>;
  className?: string;
}

const STOREY = 100;

export function TowerLedger({ businesses, floors, className }: TowerLedgerProps) {
  const rows = businesses.map((business) => ({
    business,
    floor: floors[business.unit],
    rank: floorRank(floors[business.unit]),
  }));
  const drawn = rows.length > 0 && rows.every((r) => r.rank !== null);
  // Top floor first, like the building; the seed order when a rank is missing.
  const ordered = drawn ? [...rows].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0)) : rows;
  const height = STOREY * ordered.length;

  return (
    <div className={["tower", drawn ? "tower--drawn" : "", className ?? ""].join(" ").trim()}>
      {drawn ? (
        <svg
          className="tower__art"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* the wall, the parapet cap and the plinth */}
          <rect className="tower__wall" x="4" y="3" width="92" height={height - 6} />
          <rect className="tower__cap" x="0" y="3" width="100" height="7" />
          <line className="tower__line" x1="0" y1={height - 3} x2="100" y2={height - 3} />
          {ordered.map((row, i) => {
            const top = i * STOREY;
            const ground = i === ordered.length - 1;
            const tint = UNIT_ACCENT[row.business.unit].token;
            return (
              <g key={row.business.unit}>
                {i > 0 ? (
                  <line className="tower__line" x1="4" y1={top} x2="96" y2={top} />
                ) : null}
                {ground ? (
                  <>
                    {/* the fascia over the shopfront, two windows, the door */}
                    <rect className="tower__line" x="10" y={top + 16} width="80" height="9" />
                    <rect className="tower__window" x="10" y={top + 38} width="18" height="30" style={{ fill: tint }} />
                    <rect className="tower__window" x="72" y={top + 38} width="18" height="30" style={{ fill: tint }} />
                    <rect className="tower__line" x="38" y={top + 36} width="24" height={STOREY - 36 - 3} />
                    <line className="tower__line" x1="50" y1={top + 36} x2="50" y2={top + STOREY - 3} />
                  </>
                ) : (
                  <>
                    {[14, 40, 66].map((x) => (
                      <rect
                        key={x}
                        className="tower__window"
                        x={x}
                        y={top + (i === 0 ? 38 : 32)}
                        width="20"
                        height="36"
                        style={{ fill: tint }}
                      />
                    ))}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      ) : null}

      <div className="tower__ledger flex flex-col border-t border-line">
        {ordered.map(({ business, floor }) => (
          <Link
            key={business.slug}
            href={`/${business.slug}`}
            className="about-house press group flex flex-1 flex-col justify-center gap-2.5 border-b border-line py-5 transition-colors hover:bg-paper-shade"
          >
            <span
              aria-hidden="true"
              className="block h-[3px] w-8 rounded-full"
              style={{ background: UNIT_ACCENT[business.unit].token }}
            />
            <span className="flex items-end justify-between gap-4">
              <span className="relative block h-8 w-28 shrink-0">
                <Image
                  src={business.logo}
                  alt={business.name}
                  fill
                  sizes="112px"
                  className="object-contain object-left"
                />
              </span>
              <span className="tower__stamp flex items-baseline gap-3">
                {floor ? <span className="t-small text-ink-soft">{floor}</span> : null}
                <span style={foundedStyle}>{business.founded}</span>
              </span>
            </span>
            {/* Who runs it, not what it sells. The home page already
                carries each unit's positioning line; repeating it here
                told the reader nothing new (G2). */}
            <span className="t-small text-ink-soft">{business.leaders.join(" and ")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
