import type { Stat, Store } from "@/content/types";
import { RETAIL_HUB, TOWNS, townKey } from "@/content/towns";
import {
  NE_LAND,
  cellOf,
  rasterArc,
  ringBuckets,
  squaresPath,
  type Cell,
} from "@/lib/ne-grid";
import { PIXEL } from "@/lib/pixel";
import type { Ownership } from "./OwnershipMark";

/**
 * Geometry for the Arihant Retail store atlas. Pure, and run on the server, so
 * the served markup is the finished map and the client only ever animates it.
 *
 * The crop is columns 5 to 49 and rows 0 to 24 of the dot field (45 x 25
 * cells, one SVG user unit per cell). It keeps every land cell of Arunachal
 * Pradesh, drops Sikkim whole, and cuts straight through Nagaland, Manipur and
 * Mizoram at the bottom edge. No borders are drawn.
 */

export const CROP = { col: 5, row: 0, cols: 45, rows: 25 } as const;
export const ATLAS_VIEWBOX = `${CROP.col} ${CROP.row} ${CROP.cols} ${CROP.rows}`;

/** Route curvature: negative bows the stitched arcs north. */
const ROUTE_BEND = -0.14;

const isDev = process.env.NODE_ENV !== "production";

/** A position on the stage, in percent of its width and height. */
export interface StagePoint {
  x: number;
  y: number;
}

export interface AtlasStore {
  /** State key shared by every element of this store (`data-store`). */
  id: string;
  /** The list entry's element id, the target of the map tag's link. */
  entryId: string;
  store: Store;
  own?: Ownership;
  cell?: Cell;
  /** Pin centre on the stage. */
  pin?: StagePoint;
  /** Where the swing tag's eyelet hangs. */
  eye?: StagePoint;
  phoneSide?: "above" | "below";
  /** Stitched cells from the hub to this store (destinations only). */
  route?: Cell[];
  hub?: boolean;
}

export interface AtlasModel {
  /** One squares path per land ring, nearest Guwahati first. */
  landRings: string[];
  /** Open stores, in data order. */
  stores: AtlasStore[];
  /** Pinned stores in build order: the hub first, then nearest first. */
  buildOrder: string[];
  hubId?: string;
  tally?: Stat;
  legend: { own: Ownership; stat: Stat }[];
}

const pct = (n: number) => Math.round(n * 100) / 100;

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function toPoint(cx: number, cy: number): StagePoint {
  return {
    x: pct(((cx - CROP.col) / CROP.cols) * 100),
    y: pct(((cy - CROP.row) / CROP.rows) * 100),
  };
}

function ownOf(store: Store): Ownership | undefined {
  if (store.ownership === "Company-owned") return "company";
  if (store.ownership === "Franchisee-owned") return "franchisee";
  return undefined;
}

const inCrop = ([c, r]: Cell) =>
  c >= CROP.col && c < CROP.col + CROP.cols && r >= CROP.row && r < CROP.row + CROP.rows;

/* The land never changes, so the rings are computed once per server process.
 * About 32 paths, so the build tweens 32 nodes rather than 505 squares. */
const HUB_TOWN = TOWNS[RETAIL_HUB];
const HUB_CELL: Cell = HUB_TOWN ? cellOf(HUB_TOWN.lon, HUB_TOWN.lat) : [19, 16];
const LAND_RINGS: string[] = ringBuckets(
  [...NE_LAND].map((k) => k.split(",").map(Number) as unknown as Cell).filter(inCrop),
  HUB_CELL,
).map((ring) => squaresPath(ring, PIXEL.fill));

function warn(message: string) {
  if (isDev) console.warn(`[store atlas] ${message}`);
}

export function buildAtlas(stores: Store[], stats: Stat[]): AtlasModel {
  // Trading stores only. Matches storeListJsonLd, and keeps any fit-out
  // document still sitting in the Studio off the page.
  const open = stores.filter((store) => store.status === "Open");

  const pinnedTowns = new Set<string>();
  const usedIds = new Set<string>();
  const atlasStores: AtlasStore[] = open.map((store) => {
    let id = `${slug(store.city)}-${slug(store.name)}`;
    for (let n = 2; usedIds.has(id); n++) id = `${slug(store.city)}-${slug(store.name)}-${n}`;
    usedIds.add(id);

    const own = ownOf(store);
    const entry: AtlasStore = { id, entryId: `store-${id}`, store, own };

    const tk = townKey(store.city);
    const town = TOWNS[tk];
    if (!town) {
      warn(`"${store.city}" is not in src/content/towns.ts, so ${store.name} is listed without a pin.`);
      return entry;
    }
    if (pinnedTowns.has(tk)) {
      warn(`${store.city} already has a pin, so ${store.name} is listed without one.`);
      return entry;
    }
    pinnedTowns.add(tk);

    const cell = cellOf(town.lon, town.lat);
    const cx = cell[0] + 0.5;
    const cy = cell[1] + 0.5;
    entry.cell = cell;
    entry.pin = toPoint(cx, cy);
    entry.eye = toPoint(cx + town.tag.dx, cy + town.tag.dy);
    entry.phoneSide = town.phoneSide;
    if (tk === RETAIL_HUB) entry.hub = true;
    return entry;
  });

  // Routes stitch out of the hub, and only if the hub has a pinned store.
  const hub = atlasStores.find((s) => s.hub);
  const destinations = atlasStores
    .filter((s) => s.cell && !s.hub)
    .map((s) => ({
      s,
      d: hub?.cell
        ? Math.hypot(s.cell![0] - hub.cell[0], s.cell![1] - hub.cell[1])
        : 0,
    }))
    .sort((a, b) => a.d - b.d)
    .map(({ s }) => s);

  if (hub?.cell) {
    for (const dest of destinations) {
      dest.route = rasterArc(hub.cell, dest.cell!, ROUTE_BEND);
    }
  }

  // Printed figures always come from business.stats, never from a count of
  // records. A disagreement is a data problem to fix, so say so in dev.
  const byId = (id: string) => stats.find((s) => s.id === id);
  const tally = byId("open");
  const company = byId("company-owned");
  const franchisee = byId("franchisee");
  const check = (label: string, stat: Stat | undefined, count: number) => {
    if (stat && stat.value !== count) {
      warn(`the ${label} figure is ${stat.value} but ${count} open store records match.`);
    }
  };
  check("stores trading", tally, open.length);
  check("company-owned", company, atlasStores.filter((s) => s.own === "company").length);
  check("franchisee-owned", franchisee, atlasStores.filter((s) => s.own === "franchisee").length);

  const legend: AtlasModel["legend"] = [];
  if (company) legend.push({ own: "company", stat: company });
  if (franchisee) legend.push({ own: "franchisee", stat: franchisee });

  return {
    landRings: LAND_RINGS,
    stores: atlasStores,
    buildOrder: [...(hub?.cell ? [hub.id] : []), ...destinations.map((s) => s.id)],
    hubId: hub?.cell ? hub.id : undefined,
    tally,
    legend,
  };
}
