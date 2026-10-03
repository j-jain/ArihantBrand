import type { Store } from "@/content/types";

interface StorePlaceholderProps {
  store: Store;
}

/** Awning stripes, left to right across the 220-unit shopfront. */
const STRIPES = Array.from({ length: 11 }, (_, i) => 40 + i * 20);

/** Garments on a window's rail: a hanger hook and a straight-sided body. */
function Rail({ x }: { x: number }) {
  return (
    <g className="ph-rack">
      <path className="ph-line" pathLength={1} d={`M${x + 6} 113h60`} />
      {[0, 1, 2].map((k) => {
        const cx = x + 18 + k * 18;
        return (
          <path
            key={k}
            className="ph-line ph-line--soft"
            pathLength={1}
            d={`M${cx} 113v3l-6 5v19h12v-19l-6-5`}
          />
        );
      })}
    </g>
  );
}

/**
 * The hover card's stand-in until a store has its own photograph (change
 * round 5): a drawn shopfront, not a stock photo, so it can never be taken
 * for the real store. The fascia carries the store's own name, the awning
 * the retail purple, the windows a rail of garments, all in the line idiom of
 * the ModelBoard figures. A store photo set in the Studio replaces it.
 *
 * Every stroke has pathLength 1, so atlas.css can draw the front in when the
 * card opens. Decorative: the card itself is aria-hidden and its text says
 * what the drawing shows.
 */
export function StorePlaceholder({ store }: StorePlaceholderProps) {
  const name = store.name.trim();
  // A long name steps down so it stays on the fascia.
  const size = name.length > 16 ? 13 : name.length > 11 ? 15 : 17;
  return (
    <svg
      className="store-ph"
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* Ground and pavement. */}
      <rect className="ph-ground" x="0" y="170" width="300" height="30" />
      <path className="ph-line" pathLength={1} d="M0 170h300" />

      {/* The building and its fascia. */}
      <path className="ph-line" pathLength={1} d="M40 170V46h220v124" />
      <rect className="ph-fascia" x="40" y="46" width="220" height="30" />
      <text
        className="ph-name"
        x="150"
        y="61"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: `${size}px` }}
      >
        {name}
      </text>

      {/* Awning: stripes in the unit purple, a scalloped edge. */}
      <g className="ph-awning">
        {STRIPES.map((x, i) =>
          i % 2 === 0 ? (
            <rect key={x} className="ph-stripe" x={x} y="76" width="20" height="14" />
          ) : null,
        )}
        <path
          className="ph-line"
          pathLength={1}
          d={`M40 76h220v14${STRIPES.map(() => "a10 6 0 0 1 -20 0").join("")}z`}
        />
      </g>

      {/* Two display windows with a rail each, and the door between. */}
      <path className="ph-line" pathLength={1} d="M52 104h76v56H52z" />
      <path className="ph-line" pathLength={1} d="M172 104h76v56h-76z" />
      <Rail x={52} />
      <Rail x={172} />
      <path className="ph-line ph-door" pathLength={1} d="M136 170v-66h28v66" />
      <circle className="ph-knob" cx="158" cy="138" r="1.8" />
    </svg>
  );
}
