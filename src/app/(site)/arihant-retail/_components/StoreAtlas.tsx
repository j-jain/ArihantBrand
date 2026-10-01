import Link from "next/link";
import type { CSSProperties } from "react";

import { Button, SplitHeading, StaggerGroup, cn, trackClass } from "@/components";
import type { Cta, Stat, Store } from "@/content/types";
import { directionsUrl } from "@/lib/seo";
import { unitScope } from "@/lib/units";
import { AtlasBehaviour } from "./AtlasBehaviour";
import { ATLAS_VIEWBOX, CROP, buildAtlas, type AtlasStore, type StagePoint } from "./atlasGeometry";
import { OwnershipMark } from "./OwnershipMark";

interface StoreAtlasProps {
  heading: string;
  lead?: string;
  stores: Store[];
  stats: Stat[];
  primaryCta: Cta;
  secondaryCta?: Cta;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Stage percent back to SVG user units (one unit per cell). */
const toUser = (p: StagePoint) => ({
  x: r2(CROP.col + (p.x / 100) * CROP.cols),
  y: r2(CROP.row + (p.y / 100) * CROP.rows),
});

const figure = (stat: Stat) => `${stat.value}${stat.suffix ?? ""}`;

/**
 * "On the street today": the Arihant Retail stores on a square-pixel map of the
 * Northeast, keyed by the unit's three figures, over a ruled list of the
 * stores themselves (change round 3, the store atlas).
 *
 * Server-rendered in its finished state: land, stitched routes out of
 * Guwahati, a pin and a swing tag per town, the key and the list. Nothing is
 * hidden by CSS. AtlasBehaviour (client) adds the hover/focus/pin state and
 * the one-shot entry build; with JS off the tags are plain anchors into the
 * list and `:target` highlights the entry.
 *
 * Honesty rails: trading stores only, town-level pins only (src/content/
 * towns.ts), directions only where a confirmed `mapsQuery` exists, and every
 * printed figure from `business.stats`, never a count of records.
 *
 * Deliberately distinct from the footer NetworkMap: square pixels on
 * paper-shade (never round dots on charcoal), purple and ink (never
 * vermillion), stepped stitches to trading stores only, one build then still.
 */
export function StoreAtlas({
  heading,
  lead,
  stores,
  stats,
  primaryCta,
  secondaryCta,
}: StoreAtlasProps) {
  const model = buildAtlas(stores, stats);
  const byId = new Map(model.stores.map((s) => [s.id, s]));
  const pinned = model.buildOrder
    .map((id) => byId.get(id))
    .filter((s): s is AtlasStore & Required<Pick<AtlasStore, "cell" | "pin" | "eye">> =>
      Boolean(s?.cell && s.pin && s.eye),
    );
  const tagged = model.stores.filter((s) => s.pin && s.eye);
  const routed = pinned.filter((s) => s.route?.length);
  const hasKey = Boolean(model.tally) || model.legend.length > 0;

  return (
    <section
      id="stores"
      aria-labelledby="stores-heading"
      className="section-pad bg-paper-shade"
      style={unitScope("retail")}
    >
      <AtlasBehaviour className="atlas container-site" hubId={model.hubId}>
        <div className="atlas__head">
          <SplitHeading as="h2" id="stores-heading" className="t-h2 text-ink" text={heading} />
          {lead ? <p className="atlas__lead t-lead text-ink-soft">{lead}</p> : null}
        </div>

        <div className="atlas__figure">
          {hasKey ? (
            <div className="atlas__key">
              {model.tally ? (
                <p className="atlas__tally">
                  <span className="atlas__tally-fig">{figure(model.tally)}</span>{" "}
                  <span className="t-label text-ink-soft">{model.tally.label}</span>
                </p>
              ) : null}
              {model.legend.length ? (
                <ul className="atlas__legend">
                  {model.legend.map(({ own, stat }) => (
                    <li key={own} className="atlas__legend-row">
                      <OwnershipMark own={own} className="atlas__legend-mark" />
                      <span className="atlas__legend-fig">{figure(stat)}</span>{" "}
                      <span className="t-label text-ink-soft">{stat.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="atlas__stage m-bleed">
            <svg className="atlas-map" viewBox={ATLAS_VIEWBOX} aria-hidden="true" focusable="false">
              <g className="atlas-land">
                {model.landRings.map((d, i) => (
                  <path key={i} className="atlas-ring" d={d} />
                ))}
              </g>

              <g className="atlas-threads">
                {pinned.map((s) => {
                  const a = toUser(s.pin);
                  const b = toUser(s.eye);
                  return (
                    <line
                      key={s.id}
                      className="atlas-thread"
                      data-store={s.id}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      strokeOpacity={1}
                    />
                  );
                })}
              </g>

              <g className="atlas-routes">
                {routed.map((s) => (
                  <g key={s.id} className="atlas-route" data-store={s.id}>
                    {s.route!.map(([c, r]) => (
                      <rect
                        key={`${c},${r}`}
                        className="atlas-stitch"
                        x={r2(c + 0.28)}
                        y={r2(r + 0.28)}
                        width={0.44}
                        height={0.44}
                      />
                    ))}
                  </g>
                ))}
              </g>

              <g className="atlas-pins">
                {pinned.map((s) => {
                  const [c, r] = s.cell;
                  return (
                    <g
                      key={s.id}
                      className="atlas-pin"
                      data-store={s.id}
                      data-hub={s.hub ? "" : undefined}
                    >
                      <g className="atlas-pin__scale">
                        <g className="atlas-pin__mark">
                          <rect
                            className="atlas-pin__keyline"
                            x={r2(c - 0.12)}
                            y={r2(r - 0.12)}
                            width={1.24}
                            height={1.24}
                          />
                          {s.own === "franchisee" ? (
                            <rect
                              className="atlas-pin__framed"
                              x={r2(c + 0.1)}
                              y={r2(r + 0.1)}
                              width={0.8}
                              height={0.8}
                            />
                          ) : s.own === "company" ? (
                            <rect className="atlas-pin__solid" x={c} y={r} width={1} height={1} />
                          ) : (
                            // No ownership on record: a neutral ink-framed pin,
                            // so it never reads as the legend's company-owned
                            // solid square (matches its neutral paper tag).
                            <rect
                              className="atlas-pin__unknown"
                              x={r2(c + 0.1)}
                              y={r2(r + 0.1)}
                              width={0.8}
                              height={0.8}
                            />
                          )}
                        </g>
                        <rect
                          className="atlas-pin__frame"
                          x={r2(c - 0.4)}
                          y={r2(r - 0.4)}
                          width={1.8}
                          height={1.8}
                        />
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {tagged.length ? (
              <ul className="atlas-tags">
                {tagged.map((s) => (
                  <li
                    key={s.id}
                    className="atlas-tags__item"
                    data-phone-side={s.phoneSide}
                    style={
                      {
                        "--x": String(s.eye!.x),
                        "--y": String(s.eye!.y),
                        "--px": String(s.pin!.x),
                        "--py": String(s.pin!.y),
                      } as CSSProperties
                    }
                  >
                    <a
                      className="atlas-tag"
                      href={`#${s.entryId}`}
                      data-store={s.id}
                      data-own={s.own ?? "none"}
                    >
                      <span className="atlas-tag__body">
                        <span className="atlas-tag__town">{s.store.city}</span>{" "}
                        <span className="atlas-tag__name">{s.store.name}</span>
                        {s.store.ownership ? (
                          <span className="sr-only">, {s.store.ownership}</span>
                        ) : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <StaggerGroup as="ul" from="up" stagger={0.08} mLedger className="atlas__list">
          {model.stores.map((s) => (
            <li
              key={s.id}
              id={s.entryId}
              tabIndex={-1}
              className="atlas-entry"
              data-store={s.id}
              data-own={s.own ?? "none"}
            >
              {s.store.ownership ? (
                <p className="atlas-entry__own t-label text-ink-soft">
                  {s.own ? <OwnershipMark own={s.own} className="atlas-entry__mark" /> : null}
                  {s.store.ownership}
                </p>
              ) : null}
              <h3 className="atlas-entry__name">{s.store.name}</h3>
              <p className="t-small text-ink-soft">
                {s.store.city} · {s.store.format}
              </p>
              {s.store.caption ? (
                <p className="atlas-entry__caption t-small text-ink-soft">{s.store.caption}</p>
              ) : null}
              {s.store.mapsQuery ? (
                <a
                  className={cn("atlas-entry__dir t-small", trackClass("Store directions"))}
                  href={directionsUrl(s.store.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </li>
          ))}
        </StaggerGroup>

        <div className="atlas__cta m-cta">
          <Button href={primaryCta.href} variant="primary" size="lg" className="press">
            {primaryCta.label}
          </Button>
          {secondaryCta ? (
            <Link href={secondaryCta.href} className="atlas__cta-link group press">
              <span className="underline-offset-4 group-hover:underline">{secondaryCta.label}</span>
              <span aria-hidden="true" className="atlas__cta-chev">
                ▸
              </span>
            </Link>
          ) : null}
        </div>
      </AtlasBehaviour>
    </section>
  );
}
