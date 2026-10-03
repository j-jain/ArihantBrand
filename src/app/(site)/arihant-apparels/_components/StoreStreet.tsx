import { SectionHeading } from "@/components";
import { storeStreetCopy as COPY } from "@/content/sectionArt";
import { unitScope } from "@/lib/units";
import { StreetBehaviour } from "./StreetBehaviour";
import {
  FAIR,
  INSET,
  LANE_X,
  ROWS,
  ROW_BASE,
  SIS_BAY,
  STORE,
  STORES,
  STREET_END,
  STRIPES,
  VB_H,
  VB_W,
  WH,
  WH_DOOR,
  storeTop,
  storeX,
  type StoreSpec,
} from "./streetModel";

interface StoreStreetProps {
  heading: string;
  lead?: string;
  stages: { title: string; text: string }[];
}

/**
 * "From first counter to category leader" (change round 6; styles in
 * src/app/street.css, phone rules in mobile.css section 20): how a label
 * grows across a street of multi-brand stores, in the brand FAQ's three
 * stages. Drawn, not mapped: a warehouse, a fair stall, twelve stores and one
 * shop-in-shop corner seen up close.
 *
 * Server-rendered finished: nine stores lit, two with shop-in-shop counters,
 * the detail open, all three stage texts in the flow. That is what no-JS and
 * reduced motion read. StreetBehaviour (client) holds the drawing beside the
 * stages and scrubs it with the scroll.
 */
export function StoreStreet({ heading, lead, stages }: StoreStreetProps) {
  return (
    <section
      aria-labelledby="growth-heading"
      className="ga-section section-pad bg-paper"
      style={unitScope("apparels")}
    >
      <StreetBehaviour className="ga container-site">
        <div className="ga__head">
          <SectionHeading id="growth-heading" heading={heading} lead={lead} />
        </div>

        <div className="ga__body grid gap-x-12 gap-y-10 md:grid-cols-12">
          <ol className="ga-stages md:col-span-4">
            {stages.map((stage, i) => (
              <li key={stage.title} className="ga-stage" data-stage={i}>
                <span className="ga-stage__rule" aria-hidden="true">
                  <span className="ga-stage__fill" />
                </span>
                <span className="ga-stage__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="ga-stage__title t-h4 text-ink">{stage.title}</h3>
                <p className="ga-stage__text t-body text-ink-soft">{stage.text}</p>
              </li>
            ))}
          </ol>

          <div className="ga__mapcol md:col-span-8">
            <figure className="ga__sticky">
              <div className="ga__plate">
                <StreetFigure />
              </div>
              <figcaption className="ga__key">
                <ul className="ga-key">
                  <li>
                    <KeyMark kind="warehouse" /> {COPY.key.warehouse}
                  </li>
                  <li>
                    <KeyMark kind="store" /> {COPY.key.store}
                  </li>
                  <li>
                    <KeyMark kind="sis" /> {COPY.key.sis}
                  </li>
                </ul>
                <p className="ga-key__note">{COPY.note}</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </StreetBehaviour>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The drawing                                                          */
/* ------------------------------------------------------------------ */

/** A hanging garment: hook, shoulders, a straight body. */
const garment = (cx: number, y: number, h = 15) =>
  `M ${cx} ${y} v 3 l -5 4 v ${h} h 10 v ${-h} l -5 -4`;

/** A swing tag hanging from (x, y): string, then a small upright tag. */
function SwingTag({ x, y, className = "" }: { x: number; y: number; className?: string }) {
  return (
    <g className={`ga-tag ${className}`}>
      <path className="ga-tag__string" d={`M ${x} ${y} V ${y + 6}`} />
      <path className="ga-tag__body" d={`M ${x - 6} ${y + 9} L ${x} ${y + 6} L ${x + 6} ${y + 9} V ${y + 24} H ${x - 6} Z`} />
      <circle className="ga-tag__eye" cx={x} cy={y + 10.5} r={1.4} />
    </g>
  );
}

/** The shop-in-shop mark: a counter framed within a store. */
function SisBadge({ x, y, size = 12 }: { x: number; y: number; size?: number }) {
  const inner = size * 0.42;
  return (
    <g className="ga-badge">
      <rect className="ga-badge__frame" x={x} y={y} width={size} height={size} rx={1} />
      <rect
        className="ga-badge__core"
        x={x + (size - inner) / 2}
        y={y + (size - inner) / 2}
        width={inner}
        height={inner}
      />
    </g>
  );
}

function Store({ spec }: { spec: StoreSpec }) {
  const x = storeX(spec.col);
  const t = storeTop(spec.row);
  const b = t + STORE.h;
  const w = STORE.w;
  const stripeW = w / STRIPES.length;
  return (
    <g
      className="ga-store"
      data-store={spec.id}
      data-stage={spec.stage ?? "none"}
      data-sis={spec.sis ? "" : undefined}
      data-opens={spec.opens ? "" : undefined}
    >
      {/* The street as it stands before the label: every store a ghost. */}
      <g className="ga-store__ghost">
        <path d={`M ${x} ${b} V ${t + 14} H ${x + w} V ${b}`} />
        <path d={`M ${x} ${t + 32} H ${x + w}`} />
        <path d={`M ${x + 10} ${t + 56} h 42 v 42 h -42 z M ${x + 62} ${b} v -52 h 26 v 52`} />
      </g>

      {spec.stage !== null ? (
        <g className="ga-store__lit">
          <path className="ga-ink" d={`M ${x} ${b} V ${t + 14} H ${x + w} V ${b}`} pathLength={1} />
          <rect className="ga-fascia" x={x} y={t + 14} width={w} height={18} />
          <g className="ga-awning">
            {STRIPES.map((i) => (
              <rect
                key={i}
                className={i % 2 ? "ga-stripe ga-stripe--paper" : "ga-stripe"}
                x={x + i * stripeW}
                y={t + 32}
                width={stripeW}
                height={11}
              />
            ))}
            <path
              className="ga-ink ga-ink--thin"
              d={`M ${x} ${t + 32} H ${x + w} V ${t + 43} ${STRIPES.map(() => `a ${stripeW / 2} 4 0 0 1 ${-stripeW} 0`).join(" ")} Z`}
            />
          </g>
          <g className="ga-window">
            <path className="ga-ink ga-ink--thin" d={`M ${x + 10} ${t + 56} h 42 v 42 h -42 z`} pathLength={1} />
            <path className="ga-ink ga-ink--thin" d={`M ${x + 14} ${t + 63} H ${x + 48}`} />
            {[20, 31, 42].map((dx) => (
              <path key={dx} className="ga-garment" d={garment(x + dx, t + 63, 13)} />
            ))}
          </g>
          <path className="ga-ink ga-ink--thin ga-door" d={`M ${x + 62} ${b} v -52 h 26 v 52`} pathLength={1} />
          <SwingTag x={x + w - 8} y={t + 32} />
          {spec.sis ? (
            <g className="ga-store__sis">
              <SisBadge x={x + 6} y={t + 17} />
            </g>
          ) : null}
        </g>
      ) : null}
    </g>
  );
}

function StreetFigure() {
  const opener = STORES.find((s) => s.opens)!;
  const ox = storeX(opener.col);
  const ot = storeTop(opener.row);
  const anchors = STORES.filter((s) => s.stage === 1);

  return (
    <svg className="ga-fig" viewBox={`0 0 ${VB_W} ${VB_H}`} role="presentation" focusable="false">
      <defs>
        <filter id="ga-lift" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1d1716" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* ---------------- roads ---------------- */}
      <g className="ga-roads">
        <path className="ga-ground" d={`M 8 ${WH.base} H ${STREET_END}`} pathLength={1} />
        {ROW_BASE.slice(0, ROWS - 1).map((y) => (
          <path key={y} className="ga-ground" d={`M ${LANE_X} ${y} H ${STREET_END}`} pathLength={1} />
        ))}
        <path className="ga-lane" d={`M ${LANE_X} ${WH.base} V ${ROW_BASE[0]}`} pathLength={1} />
      </g>

      {/* ---------------- the warehouse ---------------- */}
      <g className="ga-warehouse">
        <path
          className="ga-ink"
          d={`M ${WH.x} ${WH.base} V ${WH.top + 30} L ${WH.x + WH.w / 2} ${WH.top - 10} L ${WH.x + WH.w} ${WH.top + 30} V ${WH.base}`}
          pathLength={1}
        />
        <rect className="ga-fascia" x={WH.x + 26} y={WH.top + 40} width={WH.w - 52} height={20} />
        <g className="ga-shutter">
          <path className="ga-ink ga-ink--thin" d={`M ${WH_DOOR.x} ${WH.base} V ${WH_DOOR.top} H ${WH_DOOR.x + WH_DOOR.w} V ${WH.base}`} />
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              className="ga-ink ga-ink--slat"
              d={`M ${WH_DOOR.x} ${WH_DOOR.top + 10 + i * 9.5} H ${WH_DOOR.x + WH_DOOR.w}`}
            />
          ))}
        </g>
        <SwingTag x={WH.x + WH.w - 18} y={WH.top + 60} className="ga-tag--wh" />
        {/* Stock waiting at the door. */}
        <g className="ga-stockpile">
          <rect x={WH_DOOR.x - 42} y={WH.base - 18} width={24} height={18} rx={1.5} />
          <rect x={WH_DOOR.x - 36} y={WH.base - 34} width={20} height={16} rx={1.5} />
        </g>
      </g>

      {/* ---------------- the fair stall (stage two) ---------------- */}
      <g className="ga-fair">
        <path className="ga-bunting" d={`M ${FAIR.x - 10} ${FAIR.top - 22} Q ${FAIR.x + FAIR.w / 2} ${FAIR.top - 2} ${FAIR.x + FAIR.w + 10} ${FAIR.top - 22}`} pathLength={1} />
        {Array.from({ length: 8 }, (_, i) => {
          const u = (i + 0.5) / 8;
          const px = FAIR.x - 10 + u * (FAIR.w + 20);
          const py = FAIR.top - 22 + 2 * u * (1 - u) * 20;
          return (
            <path
              key={i}
              className={i % 2 ? "ga-pennant ga-pennant--paper" : "ga-pennant"}
              d={`M ${px - 7} ${py} H ${px + 7} L ${px} ${py + 13} Z`}
            />
          );
        })}
        <path className="ga-canopy" d={`M ${FAIR.x + 6} ${FAIR.top + 28} H ${FAIR.x + FAIR.w - 6} L ${FAIR.x + FAIR.w - 18} ${FAIR.top} H ${FAIR.x + 18} Z`} />
        <path
          className="ga-ink ga-ink--thin ga-fair__frame"
          d={`M ${FAIR.x + 14} ${FAIR.top + 28} V ${FAIR.base} M ${FAIR.x + FAIR.w - 14} ${FAIR.top + 28} V ${FAIR.base} M ${FAIR.x} ${FAIR.base} H ${FAIR.x + FAIR.w}`}
          pathLength={1}
        />
        <g className="ga-fair__rail">
          <path className="ga-ink ga-ink--thin" d={`M ${FAIR.x + 24} ${FAIR.top + 48} H ${FAIR.x + FAIR.w - 24}`} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} className="ga-garment ga-garment--accent" d={garment(FAIR.x + 38 + i * 21, FAIR.top + 48, 18)} />
          ))}
        </g>
        <rect className="ga-counter" x={FAIR.x + 22} y={FAIR.base - 46} width={FAIR.w - 44} height={46} />
        <g className="ga-crowd">
          {[0, 1, 2].map((i) => {
            const cx = FAIR.x + 40 + i * 40;
            return (
              <g key={i}>
                <circle cx={cx} cy={FAIR.base + 14} r={6} />
                <path d={`M ${cx - 11} ${FAIR.base + 34} q 0 -12 11 -12 q 11 0 11 12 Z`} />
              </g>
            );
          })}
        </g>
      </g>

      {/* ---------------- the street ---------------- */}
      <g className="ga-street">
        {STORES.map((s) => (
          <Store key={s.id} spec={s} />
        ))}
      </g>

      {/* Movers (transient): one carton per anchor, one slip per fair store. */}
      <g className="ga-movers">
        {anchors.map((s) => (
          <g key={s.id} className="ga-carton" data-to={s.id} filter="url(#ga-lift)">
            <rect x={-12} y={-17} width={24} height={17} rx={1.5} />
            <path d="M -12 -11 H 12 M 0 -17 V -11" />
          </g>
        ))}
        {STORES.filter((s) => s.stage === 2).map((s) => (
          <g key={s.id} className="ga-slip" data-to={s.id} filter="url(#ga-lift)">
            <path d="M -8 -6 H 5 L 8 -3 V 6 H -8 Z" />
            <path d="M -5 -1 H 4 M -5 2.5 H 2" />
          </g>
        ))}
      </g>

      {/* ---------------- the shop-in-shop, up close (stage three) ---------------- */}
      <g className="ga-zoom">
        <path
          className="ga-zoom__line"
          d={`M ${ox + STORE.w} ${ot + 14} L ${INSET.x} ${INSET.y} M ${ox + STORE.w} ${ot + STORE.h} L ${INSET.x} ${INSET.y + INSET.h}`}
          pathLength={1}
        />
      </g>
      <g className="ga-inset">
        <rect className="ga-inset__panel" x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={4} />
        <text className="ga-inset__caption" x={INSET.x + 14} y={INSET.y + 24}>
          {COPY.inset}
        </text>
        <path
          className="ga-ink ga-ink--thin ga-inset__room"
          d={`M ${INSET.x + 12} ${INSET.y + INSET.h - 28} H ${INSET.x + INSET.w - 12} M ${INSET.x + 12} ${INSET.y + 70} H ${INSET.x + INSET.w - 12}`}
          pathLength={1}
        />
        {/* Other labels on the floor, kept quiet. */}
        <g className="ga-inset__others">
          {[INSET.x + 18, INSET.x + INSET.w - 30].map((rx) => (
            <g key={rx}>
              <path d={`M ${rx - 4} ${INSET.y + 104} H ${rx + 16}`} />
              {[0, 1].map((k) => (
                <path key={k} d={garment(rx + 2 + k * 10, INSET.y + 104, 26)} />
              ))}
              <path d={`M ${rx - 4} ${INSET.y + 196} H ${rx + 16}`} />
              {[0, 1].map((k) => (
                <path key={k} d={garment(rx + 2 + k * 10, INSET.y + 196, 26)} />
              ))}
            </g>
          ))}
        </g>
        {/* The label's own counter within the store. */}
        <g className="ga-bay">
          <rect className="ga-bay__frame" x={SIS_BAY.x} y={SIS_BAY.y} width={SIS_BAY.w} height={SIS_BAY.h} pathLength={1} />
          <rect className="ga-fascia ga-bay__fascia" x={SIS_BAY.x} y={SIS_BAY.y} width={SIS_BAY.w} height={24} />
          <SisBadge x={SIS_BAY.x + 10} y={SIS_BAY.y + 6} size={12} />
          <SwingTag x={SIS_BAY.x + SIS_BAY.w - 14} y={SIS_BAY.y + 24} className="ga-tag--bay" />
          {[SIS_BAY.y + 58, SIS_BAY.y + 132].map((ry, r) => (
            <g key={ry} className="ga-bay__rail" data-rail={r}>
              <path className="ga-ink ga-ink--thin" d={`M ${SIS_BAY.x + 14} ${ry} H ${SIS_BAY.x + SIS_BAY.w - 26}`} pathLength={1} />
              {[0, 1, 2, 3, 4].map((k) => (
                <path
                  key={k}
                  className="ga-garment ga-garment--accent ga-bay__garment"
                  d={garment(SIS_BAY.x + 26 + k * 20, ry, 34)}
                />
              ))}
            </g>
          ))}
          <rect className="ga-bay__plinth" x={SIS_BAY.x + 10} y={SIS_BAY.y + SIS_BAY.h - 18} width={SIS_BAY.w - 20} height={10} />
        </g>
      </g>
    </svg>
  );
}

function KeyMark({ kind }: { kind: "warehouse" | "store" | "sis" }) {
  return (
    <svg className="ga-key__mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === "warehouse" ? (
        <>
          <path className="ga-key__line" d="M 3 21 V 10 L 12 4 L 21 10 V 21" />
          <path className="ga-key__line" d="M 8 21 V 14 H 16 V 21" />
        </>
      ) : kind === "store" ? (
        <>
          <path className="ga-key__line" d="M 3 21 V 6 H 21 V 21" />
          <rect className="ga-key__fill" x={3} y={6} width={18} height={5} />
          <path className="ga-key__line" d="M 10 21 V 14 H 15 V 21" />
        </>
      ) : (
        <>
          <rect className="ga-key__frame" x={4} y={4} width={16} height={16} rx={1} />
          <rect className="ga-key__fill" x={9} y={9} width={6} height={6} />
        </>
      )}
    </svg>
  );
}
