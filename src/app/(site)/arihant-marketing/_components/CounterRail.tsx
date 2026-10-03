import { Button, SectionHeading } from "@/components";
import { counterRailLabels as L } from "@/content/sectionArt";
import type { Cta } from "@/content/types";
import type { Pillar } from "@/lib/content";
import { unitScope } from "@/lib/units";
import { CounterRailBehaviour } from "./CounterRailBehaviour";
import {
  BOARDS,
  BOARD_H,
  CHIP_H,
  CHIP_X,
  CHIP_Y,
  COIN,
  DEEP,
  DEPTH,
  DIAL,
  EMPTY,
  FLAG,
  FLOOR,
  FTOP,
  FX0,
  FX1,
  LEDGER,
  PORTFOLIO,
  REP,
  SHELF_TONE,
  SHIRT,
  SIZES,
  STATUS,
  STRUCK,
  TAG,
  THIN,
  VB_H,
  VB_W,
  arc,
  arrowHead,
  chipW,
  portfolioTags,
  shirtAt,
  shirtFold,
  slotCx,
  slotX,
  stackTop,
  statusY,
  tagPath,
} from "./railModel";

interface CounterRailProps {
  heading: string;
  lead?: string;
  steps: Pillar[];
  cta: Cta;
}

/**
 * "How we work with retailers" as a counter rail (change round 6, re-placed
 * in round 7). Styles in src/app/rail.css, phone rules in mobile.css
 * section 19.
 *
 * The whole screen holds while it plays: the heading across the top, then on
 * the left the four step titles, one fixed slot for the active step's text
 * and the ask, and on the right the drawing, played by the scroll.
 *
 * Server-rendered finished: the whole drawing as a one-picture summary of the
 * four steps, and every step's text open in the list. That is what no-JS and
 * reduced motion read. CounterRailBehaviour (client) pins the section on
 * desktop and builds the drawing step by step; a phone keeps the drawing in
 * view above the steps instead of pinning.
 */
export function CounterRail({ heading, lead, steps, cta }: CounterRailProps) {
  return (
    <section
      aria-labelledby="rail-heading"
      className="rail-section bg-paper-shade"
      style={unitScope("marketing")}
    >
      <CounterRailBehaviour className="rail section-pad">
        <div className="rail__stage container-site grid gap-x-12 gap-y-10 md:grid-cols-12">
          {/* The heading runs across the top (change round 7), so the step
              titles below it start on the same line as the drawing they
              drive. */}
          <div className="rail__head md:col-span-12">
            <SectionHeading id="rail-heading" heading={heading} lead={lead} />
          </div>
          <div className="rail__copy md:col-span-5">
            <ol className="rail-steps">
              {steps.map((step, i) => (
                <li key={step.title} className="rail-step" data-step={i}>
                  <span className="rail-step__rule" aria-hidden="true">
                    <span className="rail-step__fill" />
                  </span>
                  <h3 className="rail-step__title-wrap">
                    <button type="button" className="rail-step__head" data-step-go={i}>
                      <span className="rail-step__num" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="rail-step__title t-h4 text-ink">{step.title}</span>
                    </button>
                  </h3>
                  <p className="rail-step__text t-body text-ink-soft">{step.text}</p>
                </li>
              ))}
            </ol>
            {/* The active step's text, in one slot that never changes height:
                every paragraph shares the slot's one grid cell, so the slot is
                as tall as the longest and the column above it never moves.
                A duplicate for sighted readers only; the list keeps the text. */}
            <div className="rail-detail" aria-hidden="true">
              {steps.map((step, i) => (
                <p key={step.title} className="rail-detail__text t-body text-ink-soft" data-step={i}>
                  {step.text}
                </p>
              ))}
            </div>
            <div className="rail__cta m-cta">
              <Button href={cta.href} variant="primary" size="lg" className="press">
                {cta.label}
              </Button>
            </div>
          </div>

          <figure className="rail__figure md:col-span-7" aria-hidden="true">
            <div className="rail__plate">
              <RailFigure />
            </div>
          </figure>
        </div>
        {/* Resolves the pinned stage's height budget to pixels for the fit guard. */}
        <span className="rail-probe" aria-hidden="true" />
      </CounterRailBehaviour>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The plate                                                            */
/* ------------------------------------------------------------------ */

function Shirt({ shelf, slot, k }: { shelf: number; slot: number; k: number }) {
  const [x, y] = shirtAt(shelf, slot, k);
  const thin = shelf === THIN.shelf && slot === THIN.slot;
  return (
    <g
      className="rail-shirt"
      data-shelf={shelf}
      data-slot={slot}
      data-k={k}
      data-sells={thin && k >= THIN.keep ? "" : undefined}
    >
      <rect className="rail-shirt__body" x={x} y={y} width={SHIRT.w} height={SHIRT.h} rx={2} />
      <path className="rail-shirt__fold" d={shirtFold(x, y)} />
    </g>
  );
}

function Tag({ x, y, struck }: { x: number; y: number; struck?: boolean }) {
  return (
    <>
      <path className="rail-tag__body" d={tagPath(x, y)} />
      <circle className="rail-tag__eye" cx={x + 8} cy={y + TAG.h / 2} r={2.2} />
      <path className="rail-tag__name" d={`M ${x + 14} ${y + TAG.h / 2} H ${x + TAG.w - 6}`} />
      {struck ? (
        <path
          className="rail-tag__strike"
          d={`M ${x - 3} ${y + TAG.h + 3} L ${x + TAG.w + 3} ${y - 3}`}
          pathLength={1}
        />
      ) : null}
    </>
  );
}

function Tick({ x, y, className }: { x: number; y: number; className: string }) {
  return <path className={className} d={`M ${x} ${y} l 4.5 4.5 l 9 -10`} pathLength={1} />;
}

function RailFigure() {
  const tags = portfolioTags();
  // Every filled slot gets a tag flown to it in step one, nearest first.
  const filled: { shelf: number; slot: number }[] = [];
  DEPTH.forEach((row, shelf) =>
    row.forEach((d, slot) => {
      if (d > 0) filled.push({ shelf, slot });
    }),
  );
  const thinTop = stackTop(THIN.shelf, THIN.slot, DEPTH[THIN.shelf][THIN.slot]);
  const flagTop = stackTop(FLAG.shelf, FLAG.slot, DEPTH[FLAG.shelf][FLAG.slot]);
  const ringStart = -Math.PI / 2 + 0.35;
  const ringEnd = ringStart + Math.PI * 1.7;

  return (
    <svg className="rail-fig" viewBox={`0 0 ${VB_W} ${VB_H}`} role="presentation" focusable="false">
      <defs>
        <filter id="rail-lift" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1d1716" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* ---------------- the store: shelving unit and floor ---------------- */}
      <g className="rail-base">
        <path className="rail-line rail-floor" d={`M ${FX0 - 16} ${FLOOR} H ${VB_W - 8}`} pathLength={1} />
        <path
          className="rail-line rail-frame"
          d={`M ${FX0} ${FLOOR} V ${FTOP} H ${FX1} V ${FLOOR}`}
          pathLength={1}
        />
        {BOARDS.map((y) => (
          <rect key={y} className="rail-board" x={FX0} y={y} width={FX1 - FX0} height={BOARD_H} />
        ))}
        {BOARDS.map((y) =>
          SIZES.map((size, slot) => (
            <g key={`${y}-${size}`} className="rail-ticket">
              <rect x={slotCx(slot) - 14} y={y + BOARD_H + 1} width={28} height={13} rx={1.5} />
              <text x={slotCx(slot)} y={y + BOARD_H + 10.5}>
                {size}
              </text>
            </g>
          )),
        )}
        {[1, 2, 3, 4].map((s) => (
          <path
            key={s}
            className="rail-line rail-line--soft rail-divider"
            d={`M ${slotX(s)} ${FTOP + 10} V ${BOARDS[1] - 8}`}
            pathLength={1}
          />
        ))}
        <g className="rail-stacks">
          {DEPTH.map((row, shelf) => (
            <g key={shelf} className={`tone-${SHELF_TONE[shelf]}`}>
              {row.map((d, slot) =>
                Array.from({ length: d }, (_, k) => (
                  <Shirt key={`${slot}-${k}`} shelf={shelf} slot={slot} k={k} />
                )),
              )}
            </g>
          ))}
        </g>
      </g>

      {/* The empty forms the later steps fill: the status rows' rules and
          the ledger's outline, ruled up with the store in step one. */}
      <g className="rail-forms">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className="rail-line rail-line--soft rail-form__rule"
            d={`M ${STATUS.x0} ${statusY(i) + 34} H ${STATUS.x1}`}
            pathLength={1}
          />
        ))}
        <rect
          className="rail-form__ledger"
          x={LEDGER.x}
          y={LEDGER.y}
          width={LEDGER.w}
          height={LEDGER.h}
          rx={4}
        />
      </g>

      {/* ---------------- 01 Map the counter ---------------- */}
      <g className="rail-grp" data-grp={0}>
        <text className="rail-label rail-label--strong" x={PORTFOLIO.x} y={PORTFOLIO.y - 18}>
          {L.portfolio}
        </text>
        <g className="rail-portfolio">
          {tags.map((t) => (
            <g key={t.i} className={`rail-tag tone-${t.tone}`} style={{ opacity: t.fade }}>
              <Tag x={t.x} y={t.y} />
            </g>
          ))}
        </g>
        <g className="rail-callout rail-callout--deep">
          <text className="rail-label" x={DEEP.x} y={DEEP.labelY} textAnchor="middle">
            {L.deep}
          </text>
          <path className="rail-leader" d={`M ${DEEP.x} ${DEEP.labelY + 7} V ${DEEP.tipY}`} pathLength={1} />
          <circle className="rail-leader__dot" cx={DEEP.x} cy={DEEP.tipY + 2} r={2.6} />
        </g>
        <g className="rail-callout rail-callout--sit">
          <text className="rail-label" x={slotCx(EMPTY.slot)} y={BOARDS[0] + 54} textAnchor="middle">
            <tspan x={slotCx(EMPTY.slot)}>{L.sit[0]}</tspan>
            <tspan x={slotCx(EMPTY.slot)} dy={15}>
              {L.sit[1]}
            </tspan>
          </text>
        </g>
        {/* The tag turned away: it rests, struck, in the slot left empty. */}
        <g className="rail-struck tone-paper" transform={`translate(${STRUCK.x} ${STRUCK.y})`}>
          <Tag x={0} y={0} struck />
        </g>
      </g>

      {/* Tags in flight (transient): one per filled slot, step one only. */}
      <g className="rail-flights">
        {filled.map(({ shelf, slot }) => (
          <g
            key={`${shelf}-${slot}`}
            className={`rail-flight tone-${SHELF_TONE[shelf]}`}
            data-shelf={shelf}
            data-slot={slot}
          >
            <Tag x={0} y={0} />
          </g>
        ))}
      </g>

      {/* ---------------- 02 Stand in the store ---------------- */}
      <g className="rail-grp" data-grp={1}>
        <g className="rail-dial">
          <circle className="rail-dial__track" cx={DIAL.cx} cy={DIAL.cy} r={DIAL.r} />
          <path
            className="rail-dial__arc"
            d={arc(DIAL.cx, DIAL.cy, DIAL.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.8)}
            pathLength={1}
          />
          <path
            className="rail-dial__head"
            d={arrowHead(DIAL.cx, DIAL.cy, DIAL.r, -Math.PI / 2 + Math.PI * 1.8, 4.5)}
          />
          <circle className="rail-dial__pin" cx={DIAL.cx} cy={DIAL.cy} r={2.4} />
          <text className="rail-label" x={DIAL.cx + DIAL.r + 10} y={DIAL.cy + 4}>
            {L.cycle}
          </text>
        </g>
        {L.chips.map((text, i) => (
          <g key={text} className="rail-chip" data-chip={i}>
            <rect x={CHIP_X} y={CHIP_Y[i] - CHIP_H / 2} width={chipW(text)} height={CHIP_H} rx={CHIP_H / 2} />
            <text x={CHIP_X + 13} y={CHIP_Y[i] + 4}>
              {text}
            </text>
          </g>
        ))}
        <g className="rail-rep">
          <circle className="rail-rep__body" cx={REP.x} cy={REP.head} r={13} />
          <path
            className="rail-rep__body"
            d={`M ${REP.x - 23} ${REP.head + 44} Q ${REP.x - 23} ${REP.head + 20} ${REP.x} ${REP.head + 20} Q ${REP.x + 23} ${REP.head + 20} ${REP.x + 23} ${REP.head + 44} V ${REP.head + 96} H ${REP.x - 23} Z`}
          />
          <rect className="rail-rep__body" x={REP.x - 19} y={REP.head + 94} width={15} height={FLOOR - REP.head - 94} rx={2} />
          <rect className="rail-rep__body" x={REP.x + 4} y={REP.head + 94} width={15} height={FLOOR - REP.head - 94} rx={2} />
          <g className="rail-rep__board">
            <rect x={REP.x - 42} y={REP.head + 48} width={20} height={27} rx={2} />
            <path d={`M ${REP.x - 37} ${REP.head + 58} H ${REP.x - 27} M ${REP.x - 37} ${REP.head + 64} H ${REP.x - 27}`} />
          </g>
        </g>
        {/* Reorder noted: a mark on the stack that sold through. */}
        <circle
          className="rail-noted"
          cx={slotCx(THIN.slot) + SHIRT.w / 2 + 7}
          cy={thinTop - 2}
          r={4}
        />
      </g>

      {/* ---------------- 03 Supply, settle, resolve ---------------- */}
      <g className="rail-grp" data-grp={2}>
        {L.status.map((text, i) => {
          const y = statusY(i);
          return (
            <g key={text} className="rail-status" data-row={i}>
              <g className="rail-status__icon">
                {i === 0 ? (
                  <>
                    <rect x={STATUS.x0 + 2} y={y + 6} width={24} height={18} rx={1.5} />
                    <path d={`M ${STATUS.x0 + 14} ${y + 6} V ${y + 14} M ${STATUS.x0 + 2} ${y + 11} H ${STATUS.x0 + 26}`} />
                  </>
                ) : i === 1 ? (
                  <>
                    <path d={`M ${STATUS.x0 + 4} ${y + 3} H ${STATUS.x0 + 18} L ${STATUS.x0 + 24} ${y + 9} V ${y + 27} H ${STATUS.x0 + 4} Z`} />
                    <path d={`M ${STATUS.x0 + 8} ${y + 14} H ${STATUS.x0 + 20} M ${STATUS.x0 + 8} ${y + 19} H ${STATUS.x0 + 18}`} />
                  </>
                ) : (
                  <>
                    <path d={`M ${STATUS.x0 + 7} ${y + 27} V ${y + 3}`} />
                    <path className="rail-status__pennant" d={`M ${STATUS.x0 + 8} ${y + 4} L ${STATUS.x0 + 24} ${y + 9} L ${STATUS.x0 + 8} ${y + 14} Z`} />
                  </>
                )}
              </g>
              <text className="rail-label rail-label--row" x={STATUS.x0 + 40} y={y + 20}>
                {text}
              </text>
              <Tick x={STATUS.x1 - 20} y={y + 15} className="rail-tick" />
            </g>
          );
        })}
        {/* The grievance, resolved where it was raised. */}
        <Tick x={slotCx(FLAG.slot) + SHIRT.w / 2 - 2} y={flagTop - 8} className="rail-tick rail-tick--flag" />
      </g>

      {/* Step three's movers (transient): the carton, the credit note, the flag. */}
      <g className="rail-carton" filter="url(#rail-lift)">
        <rect x={0} y={0} width={44} height={32} rx={2} />
        <path d="M 0 9 H 44 M 22 0 V 14" />
      </g>
      <g className="rail-slip" filter="url(#rail-lift)">
        <path d="M 0 0 H 18 L 24 6 V 30 H 0 Z" />
        <path d="M 5 12 H 18 M 5 18 H 16 M 5 24 H 14" />
      </g>
      <g className="rail-flag">
        <path className="rail-flag__pole" d={`M ${slotCx(FLAG.slot) + 18} ${flagTop - 2} V ${flagTop - 26}`} />
        <path
          className="rail-flag__cloth"
          d={`M ${slotCx(FLAG.slot) + 19} ${flagTop - 26} L ${slotCx(FLAG.slot) + 36} ${flagTop - 21} L ${slotCx(FLAG.slot) + 19} ${flagTop - 16} Z`}
        />
      </g>

      {/* ---------------- 04 Settle the books ---------------- */}
      <g className="rail-grp" data-grp={3}>
        <g className="rail-ledger">
          <rect className="rail-ledger__card" x={LEDGER.x} y={LEDGER.y} width={LEDGER.w} height={LEDGER.h} rx={4} />
          {L.ledger.map((text, i) => {
            const y = LEDGER.y + 26 + i * 46;
            return (
              <g key={text} className="rail-ledger__row" data-row={i}>
                <text className="rail-label rail-label--row" x={LEDGER.x + 14} y={y + 4}>
                  {text}
                </text>
                <rect className="rail-ledger__bar" x={LEDGER.x + 14} y={y + 14} width={i ? 104 : 82} height={7} rx={1} />
                <Tick x={LEDGER.x + LEDGER.w - 30} y={y + 10} className="rail-tick rail-tick--ink" />
                <path
                  className="rail-line rail-line--soft rail-ledger__rule"
                  d={`M ${LEDGER.x + 14} ${y + 30} H ${LEDGER.x + LEDGER.w - 14}`}
                  pathLength={1}
                />
              </g>
            );
          })}
          <path
            className="rail-double"
            d={`M ${LEDGER.x + 14} ${LEDGER.y + 122} H ${LEDGER.x + LEDGER.w - 14} M ${LEDGER.x + 14} ${LEDGER.y + 127} H ${LEDGER.x + LEDGER.w - 14}`}
            pathLength={1}
          />
          <text className="rail-label rail-label--foot" x={LEDGER.x + 14} y={LEDGER.y + 154}>
            {L.ledgerFoot}
          </text>
        </g>
        <g className="rail-capital">
          <circle className="rail-coin" cx={COIN.cx} cy={COIN.cy} r={COIN.r} />
          <text className="rail-coin__mark" x={COIN.cx} y={COIN.cy + 7} textAnchor="middle">
            ₹
          </text>
          <g className="rail-ring">
            <path className="rail-ring__arc" d={arc(COIN.cx, COIN.cy, COIN.ring, ringStart, ringEnd)} pathLength={1} />
            <path className="rail-ring__head" d={arrowHead(COIN.cx, COIN.cy, COIN.ring, ringEnd, 6)} />
          </g>
          <text className="rail-label" x={COIN.cx} y={COIN.cy + COIN.ring + 26} textAnchor="middle">
            <tspan x={COIN.cx}>{L.capital[0]}</tspan>
            <tspan x={COIN.cx} dy={15}>
              {L.capital[1]}
            </tspan>
          </text>
        </g>
      </g>
    </svg>
  );
}

