import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Button, SplitHeading, StaggerGroup, cn, trackClass } from "@/components";
import { townPhotos } from "@/content/images";
import { townKey } from "@/content/towns";
import type { Cta, Stat, Store } from "@/content/types";
import { directionsUrl } from "@/lib/seo";
import { unitScope } from "@/lib/units";
import { AtlasBehaviour } from "./AtlasBehaviour";
import { buildAtlas, type AtlasStore } from "./atlasGeometry";
import {
  ATLAS_RELIEF,
  INDIA_BORDER,
  MAP_LABELS,
  NEIGHBOUR_BORDERS,
  RIVERS,
  RIVER_LABEL,
  STATE_BORDERS,
} from "./atlasMap.data";
import { MAP_VIEWBOX } from "./atlasProjection";
import { OwnershipMark } from "./OwnershipMark";
import { StorePlaceholder } from "./StorePlaceholder";

interface StoreAtlasProps {
  heading: string;
  lead?: string;
  stores: Store[];
  stats: Stat[];
  primaryCta: Cta;
  secondaryCta?: Cta;
}

const figure = (stat: Stat) => `${stat.value}${stat.suffix ?? ""}`;

/** Pin head sizes in map units: the warehouse town is a size up. */
const HEAD = 20;
const HUB_HEAD = 25;

type Pinned = AtlasStore & Required<Pick<AtlasStore, "at" | "pin" | "eye" | "eyeAt" | "card">>;

/** The photograph a store's card shows: the store's own (set in the Studio)
 *  always first, else a licensed photograph of its town, credited. With
 *  neither, the card draws the shopfront instead (StorePlaceholder). */
function cardPhoto(s: AtlasStore) {
  if (s.store.image) {
    return { src: s.store.image, credit: undefined as string | undefined };
  }
  const town = townPhotos[townKey(s.store.city)];
  return town ? { src: town.src, credit: `${town.credit}, ${town.license}` } : null;
}

/**
 * "On the street today": the Arihant Retail stores on a terrain map of the
 * Northeast, keyed by the unit's three figures, over a ruled list of the
 * stores themselves (change round 3; the terrain map is change round 4).
 *
 * The map is a shaded-relief image with the borders, rivers and place names
 * drawn over it as SVG, all through one projection (atlasProjection.ts), and
 * built offline by scripts/build-atlas-map.mjs from Natural Earth and open
 * terrain data. India's borders are shown as India draws them.
 *
 * Server-rendered in its finished state: terrain, borders, rivers, running
 * stitches out of the Guwahati warehouse, a raised pin and a swing tag per
 * town, the key and the list. Nothing is hidden by CSS except the hover cards,
 * which only exist with JS (they repeat the list, plus a photograph).
 * AtlasBehaviour (client) adds hover/focus/pin state, the cards and the
 * one-shot entry build; with JS off the tags are plain anchors into the list
 * and `:target` highlights the entry.
 *
 * Honesty rails: trading stores only, town-level pins only (src/content/
 * towns.ts), directions only where a confirmed `mapsQuery` exists, every
 * printed figure from `business.stats`, and a town photograph is captioned
 * and credited as the town, never as the store.
 *
 * Still distinct from the footer NetworkMap: a paper terrain map in purple
 * and ink (never round dots on charcoal, never vermillion), routes to trading
 * stores only, one build then still.
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
    .filter((s): s is Pinned => Boolean(s?.at && s.pin && s.eye && s.eyeAt && s.card));
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
            <div className="atlas-relief">
              <Image
                src={ATLAS_RELIEF.src}
                width={ATLAS_RELIEF.width}
                height={ATLAS_RELIEF.height}
                alt=""
                sizes="(max-width: 767px) 100vw, 72rem"
              />
            </div>

            <svg className="atlas-map" viewBox={MAP_VIEWBOX} aria-hidden="true" focusable="false">
              <defs>
                <filter id="atlas-pin-shadow" x="-60%" y="-60%" width="220%" height="240%">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="#1d1716" floodOpacity="0.38" />
                </filter>
                <path id="atlas-river-label" d={RIVER_LABEL.d} />
              </defs>

              <g className="atlas-geo">
                <path className="atlas-border atlas-border--neighbour" d={NEIGHBOUR_BORDERS} />
                <path className="atlas-border atlas-border--state" d={STATE_BORDERS} />
                <path className="atlas-border atlas-border--india" d={INDIA_BORDER} />
                <g className="atlas-rivers">
                  {RIVERS.map((r, i) => (
                    <path
                      key={i}
                      className="atlas-river"
                      d={r.d}
                      pathLength={1}
                      strokeWidth={r.w * 1.5}
                    />
                  ))}
                </g>
                <text className="atlas-label atlas-label--river">
                  <textPath href="#atlas-river-label" startOffset="50%" textAnchor="middle">
                    {RIVER_LABEL.text}
                  </textPath>
                </text>
                <g className="atlas-labels">
                  {MAP_LABELS.map((l) => (
                    <text
                      key={l.text}
                      className={`atlas-label atlas-label--${l.kind}`}
                      x={l.x}
                      y={l.y}
                      textAnchor="middle"
                      transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
                    >
                      {l.text}
                    </text>
                  ))}
                </g>
              </g>

              <g className="atlas-threads">
                {pinned.map((s) => (
                  <line
                    key={s.id}
                    className="atlas-thread"
                    data-store={s.id}
                    x1={s.at[0]}
                    y1={s.at[1]}
                    x2={s.eyeAt[0]}
                    y2={s.eyeAt[1]}
                    strokeOpacity={1}
                  />
                ))}
              </g>

              <g className="atlas-routes">
                {routed.map((s) => (
                  <g key={s.id} className="atlas-route" data-store={s.id}>
                    {s.route!.map(([x1, y1, x2, y2], i) => (
                      <line key={i} className="atlas-stitch" x1={x1} y1={y1} x2={x2} y2={y2} />
                    ))}
                  </g>
                ))}
              </g>

              <g className="atlas-pins">
                {pinned.map((s) => {
                  const h = s.hub ? HUB_HEAD : HEAD;
                  const k = h + 7; // the paper keyline round the head
                  return (
                    <g
                      key={s.id}
                      className="atlas-pin"
                      data-store={s.id}
                      data-hub={s.hub ? "" : undefined}
                      transform={`translate(${s.at[0]} ${s.at[1]})`}
                    >
                      <rect className="atlas-pin__hit" x={-24} y={-24} width={48} height={48} />
                      <rect className="atlas-pin__ripple" x={-h / 2} y={-h / 2} width={h} height={h} />
                      <g className="atlas-pin__scale">
                        <g className="atlas-pin__drop">
                          <g className="atlas-pin__head" filter="url(#atlas-pin-shadow)">
                            <rect className="atlas-pin__keyline" x={-k / 2} y={-k / 2} width={k} height={k} />
                            {s.own === "franchisee" ? (
                              <rect
                                className="atlas-pin__framed"
                                x={-h / 2 + 2.5}
                                y={-h / 2 + 2.5}
                                width={h - 5}
                                height={h - 5}
                              />
                            ) : s.own === "company" ? (
                              <rect className="atlas-pin__solid" x={-h / 2} y={-h / 2} width={h} height={h} />
                            ) : (
                              // No ownership on record: a neutral ink-framed
                              // pin, so it never reads as the legend's
                              // company-owned solid square.
                              <rect
                                className="atlas-pin__unknown"
                                x={-h / 2 + 2.5}
                                y={-h / 2 + 2.5}
                                width={h - 5}
                                height={h - 5}
                              />
                            )}
                          </g>
                        </g>
                        <rect
                          className="atlas-pin__frame"
                          x={-(h + 18) / 2}
                          y={-(h + 18) / 2}
                          width={h + 18}
                          height={h + 18}
                        />
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {pinned.length ? (
              <ul className="atlas-tags">
                {pinned.map((s) => (
                  <li
                    key={s.id}
                    className="atlas-tags__item"
                    data-phone-side={s.phoneSide}
                    style={
                      {
                        "--x": String(s.eye.x),
                        "--y": String(s.eye.y),
                        "--px": String(s.pin.x),
                        "--py": String(s.pin.y),
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

          {/* Hover cards. They repeat what the tag and the list already say,
              plus a photograph, so they are hidden from assistive tech. */}
          {pinned.length ? (
            <div className="atlas-cards" aria-hidden="true">
              {pinned.map((s) => {
                const photo = cardPhoto(s);
                return (
                  <div
                    key={s.id}
                    className="atlas-card"
                    data-store={s.id}
                    data-card-x={s.card.x}
                    data-card-y={s.card.y}
                    data-photo=""
                    data-placeholder={photo ? undefined : ""}
                    style={{ "--px": String(s.pin.x), "--py": String(s.pin.y) } as CSSProperties}
                  >
                    <div className="atlas-card__photo">
                      {photo ? (
                        <Image src={photo.src} alt="" fill sizes="16rem" />
                      ) : (
                        <>
                          <StorePlaceholder store={s.store} />
                          <span className="atlas-card__soon">Store photo coming soon</span>
                        </>
                      )}
                    </div>
                    <div className="atlas-card__body">
                      <p className="atlas-card__town">{s.store.city}</p>
                      <p className="atlas-card__name">{s.store.name}</p>
                      {s.store.ownership ? (
                        <p className="atlas-card__own">
                          {s.own ? <OwnershipMark own={s.own} className="atlas-card__mark" /> : null}
                          {s.store.ownership}
                        </p>
                      ) : null}
                      {photo?.credit ? (
                        <p className="atlas-card__credit">
                          {s.store.city}. Photo: {photo.credit}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
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
