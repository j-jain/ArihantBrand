import type { Stat, Store } from "@/content/types";
import { RETAIL_HUB, TOWNS, townKey } from "@/content/towns";
import { MAP_H, MAP_W, project } from "./atlasProjection";
import type { Ownership } from "./OwnershipMark";

/**
 * Geometry for the Arihant Retail store atlas (change round 4: the terrain
 * map). Pure, and run on the server, so the served markup is the finished map
 * and the client only ever animates it.
 *
 * Everything here is in map units (atlasProjection.ts, 1800 x 1000), the same
 * space as the relief image and the drawn borders and rivers.
 */

/** A tag offset "cell": 1/45 of the stage's width (and 1/25 of its height),
 *  the unit towns.ts places the swing tags in. */
export const CELL = MAP_W / 45;

/** How far the routes bow north, as a share of their length. */
const ROUTE_BEND = 0.16;
/** The running stitch: stitch and gap lengths, and the clearance left
 *  round each pin, in map units. */
const STITCH = 10;
const STITCH_GAP = 7;
const PIN_CLEAR = 16;

const isDev = process.env.NODE_ENV !== "production";

/** A position on the stage, in percent of its width and height. */
export interface StagePoint {
  x: number;
  y: number;
}

export type Segment = [x1: number, y1: number, x2: number, y2: number];

export interface AtlasStore {
  /** State key shared by every element of this store (`data-store`). */
  id: string;
  /** The list entry's element id, the target of the map tag's link. */
  entryId: string;
  store: Store;
  own?: Ownership;
  /** Pin centre, in map units. */
  at?: [number, number];
  /** Pin centre on the stage. */
  pin?: StagePoint;
  /** Where the swing tag's eyelet hangs, in map units and on the stage. */
  eyeAt?: [number, number];
  eye?: StagePoint;
  phoneSide?: "above" | "below";
  /** The running stitch from the hub to this store (destinations only). */
  route?: Segment[];
  hub?: boolean;
  /** Which side of the pin the hover card opens on, clear of the tag. */
  card?: { x: "left" | "right"; y: "above" | "below" };
}

export interface AtlasModel {
  /** Open stores, in data order. */
  stores: AtlasStore[];
  /** Pinned stores in build order: the hub first, then nearest first. */
  buildOrder: string[];
  hubId?: string;
  tally?: Stat;
  legend: { own: Ownership; stat: Stat }[];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const pct = (n: number) => Math.round(n * 100) / 100;

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toStage = ([x, y]: [number, number]): StagePoint => ({
  x: pct((x / MAP_W) * 100),
  y: pct((y / MAP_H) * 100),
});

function ownOf(store: Store): Ownership | undefined {
  if (store.ownership === "Company-owned") return "company";
  if (store.ownership === "Franchisee-owned") return "franchisee";
  return undefined;
}

/** A running stitch along a quadratic curve from a to b, bowed north. */
function stitchRoute(a: [number, number], b: [number, number]): Segment[] {
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  // The normal that points north (up the page).
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = (ax + bx) / 2 + nx * ROUTE_BEND * len;
  const cy = (ay + by) / 2 + ny * ROUTE_BEND * len;

  // Sample the curve, then walk it by arc length.
  const pts: [number, number][] = [];
  for (let i = 0; i <= 240; i++) {
    const t = i / 240;
    const u = 1 - t;
    pts.push([u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by]);
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  const at = (s: number): [number, number] => {
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    return [
      pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
      pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
    ];
  };

  const segs: Segment[] = [];
  for (let s = PIN_CLEAR; s + STITCH <= total - PIN_CLEAR; s += STITCH + STITCH_GAP) {
    const p = at(s);
    const q = at(s + STITCH);
    segs.push([r1(p[0]), r1(p[1]), r1(q[0]), r1(q[1])]);
  }
  return segs;
}

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

    const [x, y] = project(town.lon, town.lat);
    const at: [number, number] = [r1(x), r1(y)];
    const eyeAt: [number, number] = [r1(x + town.tag.dx * CELL), r1(y + town.tag.dy * CELL)];
    entry.at = at;
    entry.pin = toStage(at);
    entry.eyeAt = eyeAt;
    entry.eye = toStage(eyeAt);
    entry.phoneSide = town.phoneSide;
    // The card opens away from the tag: on the other side vertically, and
    // toward the middle of the map horizontally.
    entry.card = {
      x: town.tag.dx > 0 ? "left" : town.tag.dx < 0 ? "right" : x < MAP_W / 2 ? "right" : "left",
      y: town.tag.dy > 0 ? "above" : "below",
    };
    if (tk === RETAIL_HUB) entry.hub = true;
    return entry;
  });

  // Routes stitch out of the hub, and only if the hub has a pinned store.
  const hub = atlasStores.find((s) => s.hub);
  const destinations = atlasStores
    .filter((s) => s.at && !s.hub)
    .map((s) => ({
      s,
      d: hub?.at ? Math.hypot(s.at![0] - hub.at[0], s.at![1] - hub.at[1]) : 0,
    }))
    .sort((a, b) => a.d - b.d)
    .map(({ s }) => s);

  if (hub?.at) {
    for (const dest of destinations) dest.route = stitchRoute(hub.at, dest.at!);
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
    stores: atlasStores,
    buildOrder: [...(hub?.at ? [hub.id] : []), ...destinations.map((s) => s.id)],
    hubId: hub?.at ? hub.id : undefined,
    tally,
    legend,
  };
}
