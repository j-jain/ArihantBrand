/**
 * Builds the Arihant Retail store atlas's map (change round 4). Run by hand,
 * offline; the outputs are committed and the raw inputs are not.
 *
 *   node scripts/build-atlas-map.mjs
 *
 * Inputs (assets/atlas-source/, unserved, git-ignored):
 *  - Natural Earth 10m (public domain), from github.com/nvkelso/natural-earth-vector:
 *      ne_10m_admin_0_countries_ind.geojson   country borders, India's official line
 *      ne_10m_admin_1_states_provinces_lines.geojson   state borders
 *      ne_10m_rivers_lake_centerlines.geojson   rivers
 *  - AWS open terrain tiles (terrarium encoding, zoom 8), tiles/8_<x>_<y>.png,
 *    from s3.amazonaws.com/elevation-tiles-prod (Mapzen / Tilezen joerd sources).
 *
 * Outputs:
 *  - public/images/atlas/ne-relief.webp: shaded relief toned to the site's
 *    paper, India at full strength and its neighbours dimmed.
 *  - src/app/(site)/arihant-retail/_components/atlasMap.data.ts: the borders,
 *    rivers and labels as SVG path data in the map's own units.
 *
 * Both are drawn through atlasProjection.ts, the same file the page uses to
 * place the store pins, so nothing can drift out of register.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  LAT0,
  LAT1,
  LON0,
  LON1,
  MAP_H,
  MAP_W,
  project,
} from "../src/app/(site)/arihant-retail/_components/atlasProjection.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "assets/atlas-source");
const OUT_IMG = path.join(ROOT, "public/images/atlas/ne-relief.webp");
const OUT_DATA = path.join(ROOT, "src/app/(site)/arihant-retail/_components/atlasMap.data.ts");

/* The relief image: 1.1x the map units, the shape of the stage. */
const RW = 1980;
const RH = 1100;

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));

/* ------------------------------------------------------------------ */
/* Colour: OKLCH (the site's token space) to sRGB bytes                 */
/* ------------------------------------------------------------------ */

function oklchToLinear([L, C, h]) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const toByte = (v) => {
  const c = Math.min(1, Math.max(0, v));
  const g = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(g * 255);
};

/* Elevation tints, quiet enough to sit on the site's paper: a pale sage
 * valley floor, warm stone on the hills, snow on the high Himalaya. */
const TINTS = [
  [0, [0.952, 0.02, 128]],
  [150, [0.948, 0.022, 122]],
  [450, [0.94, 0.024, 108]],
  [1000, [0.93, 0.022, 90]],
  [2000, [0.92, 0.018, 74]],
  [3500, [0.925, 0.01, 62]],
  [4700, [0.962, 0.004, 250]],
  [6000, [0.985, 0.002, 250]],
].map(([e, c]) => [e, oklchToLinear(c)]);
const PAPER_SHADE = oklchToLinear([0.955, 0.004, 30]);

function tintAt(e) {
  if (e <= TINTS[0][0]) return TINTS[0][1];
  for (let i = 1; i < TINTS.length; i++) {
    if (e <= TINTS[i][0]) {
      const [e0, c0] = TINTS[i - 1];
      const [e1, c1] = TINTS[i];
      const t = (e - e0) / (e1 - e0);
      return [0, 1, 2].map((k) => c0[k] + (c1[k] - c0[k]) * t);
    }
  }
  return TINTS[TINTS.length - 1][1];
}

/* ------------------------------------------------------------------ */
/* Elevation: terrarium tiles to one Web Mercator mosaic                */
/* ------------------------------------------------------------------ */

const Z = 8;
const TILES = fs
  .readdirSync(path.join(SRC, "tiles"))
  .map((f) => f.match(/^8_(\d+)_(\d+)\.png$/))
  .filter(Boolean)
  .map((m) => [Number(m[1]), Number(m[2])]);
const TX0 = Math.min(...TILES.map((t) => t[0]));
const TY0 = Math.min(...TILES.map((t) => t[1]));
const TW = (Math.max(...TILES.map((t) => t[0])) - TX0 + 1) * 256;
const TH = (Math.max(...TILES.map((t) => t[1])) - TY0 + 1) * 256;
const N = 256 * 2 ** Z;

async function loadElevation() {
  const dem = new Float32Array(TW * TH);
  for (const [tx, ty] of TILES) {
    const { data, info } = await sharp(path.join(SRC, "tiles", `8_${tx}_${ty}.png`))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    const ox = (tx - TX0) * 256;
    const oy = (ty - TY0) * 256;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * ch;
        dem[(oy + y) * TW + ox + x] = data[i] * 256 + data[i + 1] + data[i + 2] / 256 - 32768;
      }
    }
  }
  return dem;
}

const mercX = (lon) => ((lon + 180) / 360) * N - TX0 * 256;
const mercY = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N - TY0 * 256;
};

function sample(dem, fx, fy) {
  const x = Math.min(TW - 2, Math.max(0, fx - 0.5));
  const y = Math.min(TH - 2, Math.max(0, fy - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const dx = x - x0, dy = y - y0;
  const i = y0 * TW + x0;
  return (
    dem[i] * (1 - dx) * (1 - dy) +
    dem[i + 1] * dx * (1 - dy) +
    dem[i + TW] * (1 - dx) * dy +
    dem[i + TW + 1] * dx * dy
  );
}

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

/** Every line of a geometry, as arrays of [lon, lat]. Polygons give rings. */
function linesOf(geom) {
  if (!geom) return [];
  switch (geom.type) {
    case "LineString":
      return [geom.coordinates];
    case "MultiLineString":
    case "Polygon":
      return geom.coordinates;
    case "MultiPolygon":
      return geom.coordinates.flat();
    default:
      return [];
  }
}

const M = 24; // keep a margin outside the frame so lines run off the edge
const inFrame = ([x, y]) => x >= -M && x <= MAP_W + M && y >= -M && y <= MAP_H + M;

/** Projects a line and keeps only its runs inside (or touching) the frame. */
function clipLine(line) {
  const pts = line.map(([lon, lat]) => project(lon, lat));
  const runs = [];
  let run = [];
  for (let i = 0; i < pts.length; i++) {
    const inside = inFrame(pts[i]) || (i > 0 && inFrame(pts[i - 1])) || (i < pts.length - 1 && inFrame(pts[i + 1]));
    if (inside) run.push(pts[i]);
    else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length > 1);
}

/** Douglas-Peucker. */
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let worst = -1, at = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
      if (d > worst) {
        worst = d;
        at = i;
      }
    }
    if (worst > tol) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const f1 = (n) => Math.round(n * 10) / 10;
const pathOf = (runs) =>
  runs
    .map((r) => "M" + r.map(([x, y]) => `${f1(x)} ${f1(y)}`).join("L"))
    .join("");

function linesToPath(lines, tol = 0.8) {
  return pathOf(lines.flatMap(clipLine).map((r) => simplify(r, tol)).filter((r) => r.length > 1));
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const countries = readJson("ne_10m_admin_0_countries_ind.geojson").features;
const india = countries.find((f) => f.properties.ADMIN === "India");
const NEIGHBOURS = ["China", "Bhutan", "Nepal", "Bangladesh", "Myanmar"];
const neighbours = countries.filter((f) => NEIGHBOURS.includes(f.properties.ADMIN));

const stateLines = readJson("ne_10m_admin_1_states_provinces_lines.geojson").features.filter((f) => {
  const p = f.properties;
  if (p.ADM0_NAME !== "India") return false;
  const NE = ["Assam", "Arunachal Pradesh", "Meghalaya", "Nagaland", "Manipur", "Mizoram", "Tripura", "Sikkim"];
  return NE.some((s) => (p.NAME ?? "").includes(s));
});

/* Rivers worth naming at this scale, with their drawn width in CSS px. */
const RIVER_WIDTH = {
  Brahmaputra: 2.6,
  Dihang: 1.9,
  Yarlung: 1.5,
  Luhit: 1.3,
  Mamas: 1.2,
  Tista: 1.2,
  Balak: 1.2,
  Chindwin: 1.2,
  Kaladan: 1,
  "Zayü": 1,
  Nmai: 1,
};
const rivers = readJson("ne_10m_rivers_lake_centerlines.geojson").features.filter(
  (f) => f.properties.featurecla === "River" && RIVER_WIDTH[f.properties.name] !== undefined,
);

/* Hand-placed labels, in degrees, checked against the stores' tags. */
const LABELS = [
  { text: "Arunachal Pradesh", lon: 94.55, lat: 28.25, kind: "state", rotate: -14 },
  { text: "Assam", lon: 93.08, lat: 25.8, kind: "state", rotate: -8 },
  { text: "Meghalaya", lon: 90.75, lat: 25.4, kind: "state" },
  { text: "Nagaland", lon: 94.68, lat: 26.0, kind: "state", rotate: -30 },
  { text: "Manipur", lon: 93.9, lat: 24.95, kind: "state" },
  { text: "Sikkim", lon: 88.47, lat: 27.62, kind: "state" },
  { text: "Bhutan", lon: 90.45, lat: 27.42, kind: "country" },
  { text: "Bangladesh", lon: 90.35, lat: 24.98, kind: "country" },
  { text: "Myanmar", lon: 96.45, lat: 25.55, kind: "country" },
];

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

async function buildRelief(dem) {
  const latMid = (LAT0 + LAT1) / 2;
  const dxm = ((LON1 - LON0) / RW) * 111320 * Math.cos((latMid * Math.PI) / 180);
  const dym = ((LAT1 - LAT0) / RH) * 110574;

  // Elevation resampled onto the map grid, lightly smoothed (3x3).
  const raw = new Float32Array(RW * RH);
  for (let y = 0; y < RH; y++) {
    const lat = LAT1 - ((y + 0.5) / RH) * (LAT1 - LAT0);
    const my = mercY(lat);
    for (let x = 0; x < RW; x++) {
      const lon = LON0 + ((x + 0.5) / RW) * (LON1 - LON0);
      raw[y * RW + x] = Math.max(0, sample(dem, mercX(lon), my));
    }
  }
  const E = new Float32Array(RW * RH);
  for (let y = 0; y < RH; y++) {
    for (let x = 0; x < RW; x++) {
      let s = 0, n = 0;
      for (let j = -1; j <= 1; j++) {
        const yy = Math.min(RH - 1, Math.max(0, y + j));
        for (let i = -1; i <= 1; i++) {
          const xx = Math.min(RW - 1, Math.max(0, x + i));
          s += raw[yy * RW + xx];
          n++;
        }
      }
      E[y * RW + x] = s / n;
    }
  }

  // India, rasterised through the same projection, as a soft mask.
  const ringPath = linesOf(india.geometry)
    .map((ring) => {
      const pts = ring.map(([lon, lat]) => project(lon, lat)).map(([x, y]) => [(x * RW) / MAP_W, (y * RH) / MAP_H]);
      return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
    })
    .join("");
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${RW}" height="${RH}"><rect width="100%" height="100%" fill="#000"/><path d="${ringPath}" fill="#fff" fill-rule="evenodd"/></svg>`;
  const mask = await sharp(Buffer.from(maskSvg)).greyscale().raw().toBuffer();

  // Multi-directional hillshade: a main light from the north-west, with
  // softer fills so slopes facing away still read as form, not as black.
  const ALT = (42 * Math.PI) / 180;
  const LIGHTS = [
    [315, 0.52],
    [270, 0.2],
    [0, 0.18],
    [225, 0.1],
  ].map(([az, w]) => {
    const a = (az * Math.PI) / 180;
    return [Math.sin(a) * Math.cos(ALT), Math.cos(a) * Math.cos(ALT), Math.sin(ALT), w];
  });
  const EXAG = 2.2;
  const flat = Math.sin(ALT);

  const out = Buffer.alloc(RW * RH * 3);
  for (let y = 0; y < RH; y++) {
    const yn = Math.max(0, y - 1), ys = Math.min(RH - 1, y + 1);
    for (let x = 0; x < RW; x++) {
      const xw = Math.max(0, x - 1), xe = Math.min(RW - 1, x + 1);
      const i = y * RW + x;
      const dzdx = ((E[y * RW + xe] - E[y * RW + xw]) / ((xe - xw) * dxm)) * EXAG;
      const dzdn = ((E[yn * RW + x] - E[ys * RW + x]) / ((ys - yn) * dym)) * EXAG;
      const nl = Math.hypot(dzdx, dzdn, 1);
      const nx = -dzdx / nl, ny = -dzdn / nl, nz = 1 / nl;
      let shade = 0;
      for (const [lx, ly, lz, w] of LIGHTS) shade += w * Math.max(0, nx * lx + ny * ly + nz * lz);
      const f = shade / flat; // 1 on flat ground

      const inIndia = mask[i] / 255;
      const strength = 0.62 * inIndia + 0.36 * (1 - inIndia);
      let m = 1 + strength * (f - 1);
      m = Math.min(1.1, Math.max(0.5, m));

      const tint = tintAt(E[i]);
      // Neighbours: pulled toward paper-shade, so India reads first.
      const fade = 0.55 * (1 - inIndia);
      const base = [0, 1, 2].map((k) => tint[k] + (PAPER_SHADE[k] - tint[k]) * fade);
      // Shadows lean warm (toward the site's ink), highlights toward paper.
      const r = base[0] * m * (m < 1 ? 1.0 : 1);
      const g = base[1] * m * (m < 1 ? 0.985 : 1);
      const b = base[2] * m * (m < 1 ? 0.96 : 1);
      out[i * 3] = toByte(r);
      out[i * 3 + 1] = toByte(g);
      out[i * 3 + 2] = toByte(b);
    }
  }

  fs.mkdirSync(path.dirname(OUT_IMG), { recursive: true });
  await sharp(out, { raw: { width: RW, height: RH, channels: 3 } })
    .webp({ quality: 74, effort: 6, smartSubsample: true })
    .toFile(OUT_IMG);
  return E;
}

/** Orients a river line downstream (from its higher end), using the DEM. */
function downstream(dem, line) {
  const e = ([lon, lat]) => sample(dem, mercX(lon), mercY(lat));
  return e(line[0]) >= e(line[line.length - 1]) ? line : [...line].reverse();
}

/** A smooth path along a stretch of river, for its label to ride. */
function labelPath(line, lonFrom, lonTo) {
  const pts = line
    .filter(([lon]) => lon >= lonFrom && lon <= lonTo)
    .map(([lon, lat]) => project(lon, lat))
    .sort((a, b) => a[0] - b[0]);
  const win = 6;
  const smooth = pts.map((_, i) => {
    const s = pts.slice(Math.max(0, i - win), i + win + 1);
    return [s.reduce((a, p) => a + p[0], 0) / s.length, s.reduce((a, p) => a + p[1], 0) / s.length];
  });
  return pathOf([simplify(smooth, 2.5)]);
}

async function main() {
  const dem = await loadElevation();
  await buildRelief(dem);
  const img = fs.statSync(OUT_IMG).size;

  const riverOut = [];
  let label = "";
  for (const f of rivers) {
    const name = f.properties.name;
    for (const line of linesOf(f.geometry)) {
      const down = downstream(dem, line);
      const d = linesToPath([down], 0.7);
      if (d) riverOut.push({ name: f.properties.name_en ?? name, d, w: RIVER_WIDTH[name] });
      if (name === "Brahmaputra" && !label) {
        const p = labelPath(line, 94.25, 95.35);
        if (p) label = p;
      }
    }
  }
  // Wide rivers last, so they sit over their tributaries' mouths.
  riverOut.sort((a, b) => a.w - b.w);

  const labels = LABELS.map(({ lon, lat, ...rest }) => {
    const [x, y] = project(lon, lat);
    return { ...rest, x: f1(x), y: f1(y) };
  });

  const data = `/* Generated by scripts/build-atlas-map.mjs. Do not edit by hand.
 *
 * The store atlas's drawn layer, in map units (atlasProjection.ts). Borders
 * and rivers: Natural Earth 10m, public domain; international borders as
 * shown in India's official boundary (Natural Earth's India point of view).
 * The relief image beside it: AWS open terrain tiles (Tilezen joerd).
 */

export const ATLAS_RELIEF = {
  src: "/images/atlas/ne-relief.webp",
  width: ${RW},
  height: ${RH},
} as const;

/** India's international borders inside the frame. */
export const INDIA_BORDER = ${JSON.stringify(linesToPath(linesOf(india.geometry), 0.6))};

/** Neighbouring countries' own outlines (drawn lighter, under India's). */
export const NEIGHBOUR_BORDERS = ${JSON.stringify(linesToPath(neighbours.flatMap((f) => linesOf(f.geometry)), 0.9))};

/** Borders between the Northeast states. */
export const STATE_BORDERS = ${JSON.stringify(linesToPath(stateLines.flatMap((f) => linesOf(f.geometry)), 0.8))};

/** Rivers, each drawn from source to mouth (so a stroke draw flows downstream). */
export const RIVERS: readonly { name: string; d: string; w: number }[] = ${JSON.stringify(riverOut, null, 2)};

/** The Brahmaputra's label rides this smoothed stretch of upper Assam. */
export const RIVER_LABEL = { text: "Brahmaputra", d: ${JSON.stringify(label)} } as const;

export const MAP_LABELS: readonly {
  text: string;
  x: number;
  y: number;
  kind: "state" | "country";
  rotate?: number;
}[] = ${JSON.stringify(labels, null, 2)};
`;
  fs.writeFileSync(OUT_DATA, data);
  console.log(`relief ${RW}x${RH} ${(img / 1024).toFixed(0)} KB -> ${path.relative(ROOT, OUT_IMG)}`);
  console.log(`data ${(Buffer.byteLength(data) / 1024).toFixed(1)} KB -> ${path.relative(ROOT, OUT_DATA)}`);
  console.log(`frame lon ${LON0}..${LON1}, lat ${LAT0.toFixed(3)}..${LAT1}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
