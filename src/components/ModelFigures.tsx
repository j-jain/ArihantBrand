import type { ModelPillarId } from "@/content/types";

/**
 * The four diagrams that sit beside the ModelBoard rows.
 *
 * These are NOT icons and do not belong in `icons.tsx`. That file holds a
 * reusable 24-grid glyph set at a fixed stroke; these are single-purpose
 * 72-grid diagrams whose sub-parts are addressed individually by GSAP. Merging
 * the two would mean either animating an icon set nobody else animates or
 * flattening these into shapes that cannot move.
 *
 * Conventions, so the motion layer can rely on them:
 *  - stroke width comes from CSS (`.model-fig`), never from an attribute, so
 *    the mobile layer can thicken the hairline at 56px without touching markup;
 *  - the accent part of each figure carries `.model-fig__accent`;
 *  - every part the motion layer animates carries its own class;
 *  - the resting state drawn here IS the finished state. JS only ever
 *    manufactures the "before", so no-JS and reduced-motion render complete.
 */

const frame = {
  viewBox: "0 0 72 72",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

/** Stock leaves the owner's bracket and rests in ours. */
function ZeroDeadstockFigure() {
  return (
    <svg {...frame} className="model-fig model-fig--deadstock">
      {/* Owner's side: an empty bracket, drawn dashed because nothing lives
          there. That emptiness is the entire claim. */}
      <path
        className="model-fig__bracket model-fig__bracket--owner"
        d="M14 16H6v40h8"
        strokeDasharray="4 4"
      />
      {/* Ours: a solid bracket holding the stock. */}
      <path className="model-fig__bracket" d="M58 16h8v40h-8" />
      <g className="model-fig__units model-fig__accent">
        <rect className="model-fig__unit" x="44" y="22" width="11" height="9" rx="1.5" />
        <rect className="model-fig__unit" x="44" y="34.5" width="11" height="9" rx="1.5" />
        <rect className="model-fig__unit" x="44" y="47" width="11" height="9" rx="1.5" />
      </g>
      {/* The return path: out of the owner's floor, back to ours. */}
      <path className="model-fig__return" d="M18 62q18 8 32-8" />
      <path className="model-fig__return-head" d="M50 54v6M50 54h-6" />
    </svg>
  );
}

/** Tags of three widths hanging off one rail. */
function MultiBrandFigure() {
  const tags: { x: number; w: number }[] = [
    { x: 8, w: 10 },
    { x: 21, w: 7 },
    { x: 31, w: 12 },
    { x: 46, w: 8 },
    { x: 57, w: 9 },
  ];
  return (
    <svg {...frame} className="model-fig model-fig--multibrand">
      <path className="model-fig__rail" d="M5 20h62" />
      <g className="model-fig__tags">
        {tags.map((tag, i) => (
          <g
            key={tag.x}
            className={
              i === 2 ? "model-fig__tag model-fig__accent" : "model-fig__tag"
            }
          >
            <path d={`M${tag.x + tag.w / 2} 20v8`} />
            <rect
              x={tag.x}
              y={28}
              width={tag.w}
              height={tag.w > 9 ? 26 : 20}
              rx="2"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** A shopfront with nothing in it but racks. The plainness is the argument. */
function NoFrillsFigure() {
  return (
    <svg {...frame} className="model-fig model-fig--nofrills">
      <path className="model-fig__shell" d="M10 26v34h52V26" />
      <path className="model-fig__shell" d="M6 26l6-12h48l6 12H6z" />
      <path className="model-fig__door model-fig__accent" d="M30 60V42h12v18" />
      <g className="model-fig__racks">
        <path d="M16 36h8" />
        <path d="M16 44h8" />
        <path d="M48 36h8" />
        <path d="M48 44h8" />
      </g>
    </svg>
  );
}

/** One bar split in two: the run half hatched, the owned half plain. */
function CompanyRunFigure() {
  return (
    <svg {...frame} className="model-fig model-fig--split">
      <g className="model-fig__half model-fig__half--run model-fig__accent">
        <rect x="6" y="26" width="30" height="20" rx="2" />
        <path d="M12 46l6-20M20 46l6-20M28 46l6-20" />
      </g>
      <g className="model-fig__half model-fig__half--own">
        <rect x="36" y="26" width="30" height="20" rx="2" />
        {/* The key notch: the owner holds the asset. */}
        <circle cx="55" cy="36" r="3.5" />
        <path d="M55 39.5V44" />
      </g>
      <path className="model-fig__seam" d="M36 22v28" />
    </svg>
  );
}

const FIGURES: Record<ModelPillarId, () => React.JSX.Element> = {
  "zero-deadstock": ZeroDeadstockFigure,
  "multi-brand": MultiBrandFigure,
  "no-frills": NoFrillsFigure,
  "company-run": CompanyRunFigure,
};

/** Returns null for an unrecognised id, so a bad CMS value cannot throw. */
export function ModelFigure({ id }: { id: ModelPillarId }) {
  const Figure = FIGURES[id];
  return Figure ? <Figure /> : null;
}
