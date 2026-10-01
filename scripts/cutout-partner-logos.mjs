/**
 * Cut the partner logos out of their canvases and write the size manifest.
 *
 * The home marquee sets logos straight on the page ground with no tile, so a
 * white or cream canvas baked into a logo file would show as a box. This
 * removes that canvas (with an exact un-matte of the anti-aliased edge, so no
 * light halo is left on any light ground), trims every file to its ink, and
 * records each logo's trimmed size and treatment in
 * src/content/partner-logo-sizes.ts, keyed by slug because production image
 * URLs are Sanity CDN URLs, not these paths.
 *
 * Originals live in assets/partner-logos-original/{slug}.webp. That folder is
 * outside public/, so it is never served, and nothing imports it, so it is
 * never traced into the build. Every run reads the originals and overwrites
 * public/images/partners/{slug}.webp, so running it again gives the same
 * output: feathering never stacks on earlier feathering.
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/cutout-partner-logos.mjs [flags]
 *
 *   --bootstrap    copy public/images/partners/*.webp into the originals folder
 *                  and stop. Refuses to overwrite an original whose bytes differ.
 *   --dry-run      process and report, write nothing
 *   --only=a,b     process only these slugs (no manifest write)
 *   --out=DIR      write the WebPs to DIR instead of public/ (no manifest write)
 *   --verbose      also log how each file's enclosed near-white regions were settled
 *
 * Class table, thresholds and per-file fixes are the measured values from the
 * round-3 logo spec. A new partner must be added to CLASS_TABLE before this
 * runs: the guard fails on any slug it cannot place.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(root, "public", "images", "partners");
const ORIGINALS_DIR = path.join(root, "assets", "partner-logos-original");
const MANIFEST_PATH = path.join(root, "src", "content", "partner-logo-sizes.ts");
const PARTNERS_TS = path.join(root, "src", "content", "partners.ts");

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? undefined : hit.slice(name.length + 3);
};
const VERBOSE = hasFlag("verbose");

/* ------------------------------------------------------------------ */
/* Classification                                                       */
/* ------------------------------------------------------------------ */

/** Every slug in exactly one class. */
const CLASS_TABLE = {
  /** Already on a transparent canvas: trim and pad only. */
  transparent: [
    "7l", "a-cube", "cool-colors", "country-wide-shirts", "indian-terrain",
    "juniper", "kathy", "skechers", "wildcraft", "yaaron",
  ],
  /** Ink on a white canvas: flood the edge-connected white away. */
  white: [
    "alvaro-castagnino", "amidhara", "azzurro", "bad-boys", "beevee",
    "believe-in-shirts", "blazo", "bonny", "catwalk", "charter",
    "chocolate-baby", "clubwear", "cross-world", "dagerrfly", "deal-jeans",
    "exceed", "gemini", "grab-it", "hatchers", "hoffmen", "kashmiera",
    "kidzello", "little-collars", "little-kangaroos", "mikki-house",
    "minerals-jeans", "mohit-industries", "nivia", "obaby", "octave",
    "peppermint", "perri-palley", "raksha", "rangriti", "spykar",
    "sulphur-style-lab", "tadpole", "yvon-satin",
  ],
  /** A plate with white lettering on a white canvas: only edge-connected
   *  white goes, with a strict threshold, so the lettering survives. */
  whiteBadge: ["dare-jeans", "dida", "focus-jeans", "four-buttons"],
  /** The logo is a full-bleed coloured block: shave seams, trim, no keying. */
  block: [
    "biba", "ethniks-neu-ron", "integriti", "juliet", "la-scoot", "libas",
    "mj-mashup", "mollys", "nostrum", "pretty-woman", "raw-star", "re-pink",
    "red-flame", "rexstraut-jeans", "stori", "sweet-dreams", "tassel",
    "tiny-girl", "twills", "zola",
  ],
  /** Ink on a tinted canvas: key every pixel near the measured tint,
   *  enclosed counters included. */
  tint: ["dhwaja", "kooki-ethnics", "vriti"],
  /** Photographic: the file is left untouched. */
  artwork: ["caroline-clothing", "mayur"],
};

/** whiteBadge files that read as plates, so they size like blocks. */
const WHITE_BADGE_PLATES = new Set(["dida", "focus-jeans", "four-buttons"]);

const T_HARD = { white: 18, whiteBadge: 14, tint: 20 };

/**
 * Per-file fixes, measured on the originals.
 *  crop       pixels to drop from each edge before anything else
 *  gridlines  the spreadsheet gridlines detection must find (asserted)
 *  tHard      threshold override
 *  protect    [[x0, y0, x1, y1], ...] inclusive rectangles, in original
 *             (post-crop) coordinates, that keying never touches
 *  erase      [[x0, y0, x1, y1], ...] inclusive rectangles of scan debris,
 *             painted to canvas before keying (cleared on a transparent file)
 */
const PER_FILE = {
  "little-collars": { crop: { left: 2, top: 2, right: 0, bottom: 1 } },
  // A stray red mark on the top edge of the scan, 6px and opaque enough to
  // survive the despeckle; left in, it would also hold the trim 16px high.
  obaby: { erase: [[121, 0, 125, 2]] },
  "little-kangaroos": {
    gridlines: { rows: [18, 19, 37, 48, 77, 87, 116, 117], cols: [23, 109, 187] },
  },
  "mikki-house": { tHard: 42 }, // its faint frame runs about 233 to 250
  bonny: { tHard: 24 }, // its top row is 240,244,250
};

/** Seam shaves the block pass should find on the current originals. */
const EXPECTED_SHAVES = {
  juliet: { L: 1, R: 1 },
  "la-scoot": { B: 1 },
  libas: { T: 1 },
  nostrum: { T: 1, L: 1, R: 2 },
  "pretty-woman": { L: 1 },
  "raw-star": { B: 1 },
  stori: { T: 2, B: 1 },
  "sweet-dreams": { T: 1, B: 1 },
  tassel: { L: 1 },
};

const treatmentOf = (slug, cls) => {
  if (cls === "artwork") return "artwork";
  if (cls === "block" || WHITE_BADGE_PLATES.has(slug)) return "badge";
  return "mark";
};

/* ------------------------------------------------------------------ */
/* Image helpers. An image is { w, h, px } with px RGBA, row-major.      */
/* ------------------------------------------------------------------ */

async function decode(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) throw new Error(`${file}: expected 4 channels`);
  return { w: info.width, h: info.height, px: new Uint8ClampedArray(data) };
}

function encode(img) {
  return sharp(Buffer.from(img.px.buffer, img.px.byteOffset, img.px.byteLength), {
    raw: { width: img.w, height: img.h, channels: 4 },
  })
    .webp({ lossless: true, effort: 6 })
    .toBuffer();
}

function crop(img, left, top, right, bottom) {
  const w = img.w - left - right;
  const h = img.h - top - bottom;
  if (w <= 0 || h <= 0) throw new Error("crop leaves nothing");
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const from = ((y + top) * img.w + left) * 4;
    px.set(img.px.subarray(from, from + w * 4), y * w * 4);
  }
  return { w, h, px };
}

function pad(img, n) {
  if (n === 0) return img;
  const w = img.w + 2 * n;
  const h = img.h + 2 * n;
  const px = new Uint8ClampedArray(w * h * 4); // transparent black
  for (let y = 0; y < img.h; y++) {
    px.set(img.px.subarray(y * img.w * 4, (y + 1) * img.w * 4), ((y + n) * w + n) * 4);
  }
  return { w, h, px };
}

const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

function median(values) {
  if (values.length === 0) return undefined;
  const sorted = Float64Array.from(values).sort();
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function borderIndices(w, h) {
  const out = [];
  for (let x = 0; x < w; x++) {
    out.push(x);
    if (h > 1) out.push((h - 1) * w + x);
  }
  for (let y = 1; y < h - 1; y++) {
    out.push(y * w);
    if (w > 1) out.push(y * w + w - 1);
  }
  return out;
}

const distTo = (px, i, B) =>
  Math.hypot(px[i * 4] - B[0], px[i * 4 + 1] - B[1], px[i * 4 + 2] - B[2]);

/** Distance counting only the channels darker than B: how much ink a pixel
 *  could hold. A pixel lighter than a tinted ground scores 0. */
const darkerDistTo = (px, i, B) =>
  Math.hypot(
    Math.max(0, B[0] - px[i * 4]),
    Math.max(0, B[1] - px[i * 4 + 1]),
    Math.max(0, B[2] - px[i * 4 + 2]),
  );

function protectMask(w, h, rects = []) {
  const mask = new Uint8Array(w * h);
  for (const [x0, y0, x1, y1] of rects) {
    for (let y = Math.max(0, y0); y <= Math.min(h - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(w - 1, x1); x++) mask[y * w + x] = 1;
    }
  }
  return mask;
}

/** One 3x3 (Chebyshev radius 1) dilation. */
function dilate(mask, w, h) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < w) out[yy * w + xx] = 1;
        }
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Step 1: per-file clean-ups                                           */
/* ------------------------------------------------------------------ */

/* A gridline pixel: neutral grey, lighter than ink, darker than the canvas.
   The ceiling is 248, not 250: each little-kangaroos line has a one-pixel
   anti-alias shadow at 249 (rows 78 and 88, columns 108 and 188). Those are
   canvas-white for keying purposes and flood away with it, while row 19, the
   lower half of the first line, sits at 248 and must be found. */
const isGridNeutral = (r, g, b) => {
  const lum = luminance(r, g, b);
  return Math.max(r, g, b) - Math.min(r, g, b) <= 10 && lum >= 150 && lum <= 248;
};

function detectGridlines(img) {
  const { w, h, px } = img;
  const rows = [];
  const cols = [];
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (isGridNeutral(px[i], px[i + 1], px[i + 2])) n++;
    }
    if (n >= 0.6 * w) rows.push(y);
  }
  for (let x = 0; x < w; x++) {
    let n = 0;
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      if (isGridNeutral(px[i], px[i + 1], px[i + 2])) n++;
    }
    if (n >= 0.6 * h) cols.push(x);
  }
  return { rows, cols };
}

function toBands(lines) {
  const bands = [];
  for (const v of lines) {
    const last = bands[bands.length - 1];
    if (last && v === last[1] + 1) last[1] = v;
    else bands.push([v, v]);
  }
  return bands;
}

/** Paint each gridline band over with the average of the pixels just outside
 *  it, rows first, then columns. Only grid-neutral pixels are replaced, so
 *  coloured ink crossing a line is never touched. */
function inpaintGridlines(img, expected, slug) {
  const found = detectGridlines(img);
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  if (!same(found.rows, expected.rows) || !same(found.cols, expected.cols)) {
    throw new Error(
      `${slug}: gridlines found rows [${found.rows}] cols [${found.cols}], ` +
        `expected rows [${expected.rows}] cols [${expected.cols}]`,
    );
  }
  const { w, h, px } = img;
  let replaced = 0;
  /* Per-channel average of the two outside pixels. Where they disagree (the
     band runs along the edge of a letter, ink on one side and canvas on the
     other) the average would paint a half-tone smear under the letter, so the
     lighter side wins: a gridline that shows at all is not covered by ink. */
  const fill = (target, a, b) => {
    let from = null;
    if (a === -1 || b === -1) from = a === -1 ? b : a;
    else if (Math.hypot(px[a] - px[b], px[a + 1] - px[b + 1], px[a + 2] - px[b + 2]) > 40) {
      from = luminance(px[a], px[a + 1], px[a + 2]) >= luminance(px[b], px[b + 1], px[b + 2]) ? a : b;
    }
    for (let c = 0; c < 3; c++) {
      px[target + c] = from === null ? Math.round((px[a + c] + px[b + c]) / 2) : px[from + c];
    }
    replaced++;
  };
  for (const [r0, r1] of toBands(found.rows)) {
    for (let x = 0; x < w; x++) {
      const above = r0 > 0 ? ((r0 - 1) * w + x) * 4 : -1;
      const below = r1 < h - 1 ? ((r1 + 1) * w + x) * 4 : -1;
      for (let y = r0; y <= r1; y++) {
        const i = (y * w + x) * 4;
        if (isGridNeutral(px[i], px[i + 1], px[i + 2])) fill(i, above, below);
      }
    }
  }
  for (const [c0, c1] of toBands(found.cols)) {
    for (let y = 0; y < h; y++) {
      const left = c0 > 0 ? (y * w + c0 - 1) * 4 : -1;
      const right = c1 < w - 1 ? (y * w + c1 + 1) * 4 : -1;
      for (let x = c0; x <= c1; x++) {
        const i = (y * w + x) * 4;
        if (isGridNeutral(px[i], px[i + 1], px[i + 2])) fill(i, left, right);
      }
    }
  }
  return replaced;
}

/** rgb*a + 255*(1-a), alpha 255: merges transparent strips into the plate. */
function flattenOnWhite(img) {
  const { px } = img;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3] / 255;
    for (let c = 0; c < 3; c++) px[i + c] = Math.round(px[i + c] * a + 255 * (1 - a));
    px[i + 3] = 255;
  }
}

/* ------------------------------------------------------------------ */
/* Steps 2 to 5: background, core, feather, despeckle                   */
/* ------------------------------------------------------------------ */

function backgroundColour(img, cls) {
  const { w, h, px } = img;
  const border = borderIndices(w, h);
  const pick =
    cls === "tint"
      ? border
      : border.filter((i) => distTo(px, i, [255, 255, 255]) <= 48);
  if (pick.length === 0) return [255, 255, 255];
  return [0, 1, 2].map((c) => median(pick.map((i) => px[i * 4 + c])));
}

function coreMask(img, B, tHard, cls, prot) {
  const { w, h, px } = img;
  const n = w * h;
  const core = new Uint8Array(n);
  if (cls === "tint") {
    /* JPEG ringing and the lighter cream inside kooki-ethnics' elephant sit
       just past tHard but on the light side of the tint. Kept, the un-matte
       would read them as fully opaque (lighter than B has no ink to recover)
       and leave cream and white specks on the paper, so a pixel that is
       barely darker than the tint in any channel is ground too. */
    for (let i = 0; i < n; i++) {
      if (prot[i]) continue;
      if (distTo(px, i, B) <= tHard || darkerDistTo(px, i, B) <= tHard / 2) core[i] = 1;
    }
    return core;
  }
  // Flood from the border through near-B pixels, 4-connected.
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (const i of borderIndices(w, h)) {
    if (!core[i] && !prot[i] && distTo(px, i, B) <= tHard) {
      core[i] = 1;
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const y = (i - x) / w;
    const next = [];
    if (x > 0) next.push(i - 1);
    if (x < w - 1) next.push(i + 1);
    if (y > 0) next.push(i - w);
    if (y < h - 1) next.push(i + w);
    for (const j of next) {
      if (!core[j] && !prot[j] && distTo(px, j, B) <= tHard) {
        core[j] = 1;
        queue[tail++] = j;
      }
    }
  }
  return core;
}

/**
 * Near-B pixels the flood did not reach are enclosed: letter counters, or
 * white detail inside the mark. The flood alone keeps them whole, but the
 * feather band reaches 2px past the core, through a thin stroke, and would
 * clear the near side of a counter and leave a white crescent behind. So each
 * enclosed region is decided whole: one that lies entirely inside the band is
 * a sliver (a sealed gap between blurred letters, a pinhole) and joins the
 * core; anything larger is kept untouched, edge to edge.
 */
function settleEnclosed(img, core, B, tHard, prot) {
  const { w, h, px } = img;
  const n = w * h;
  const near = dilate(dilate(core, w, h), w, h);
  const keep = new Uint8Array(n);
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sliverPx = 0;
  let keptPx = 0;
  let keptRegions = 0;
  const enclosed = (i) => !core[i] && !prot[i] && distTo(px, i, B) <= tHard;
  for (let s = 0; s < n; s++) {
    if (seen[s] || !enclosed(s)) continue;
    const members = [];
    let allNear = true;
    let top = 0;
    stack[top++] = s;
    seen[s] = 1;
    while (top > 0) {
      const i = stack[--top];
      members.push(i);
      if (!near[i]) allNear = false;
      const x = i % w;
      const y = (i - x) / w;
      const next = [];
      if (x > 0) next.push(i - 1);
      if (x < w - 1) next.push(i + 1);
      if (y > 0) next.push(i - w);
      if (y < h - 1) next.push(i + w);
      for (const j of next) {
        if (!seen[j] && enclosed(j)) {
          seen[j] = 1;
          stack[top++] = j;
        }
      }
    }
    if (allNear) {
      for (const i of members) core[i] = 1;
      sliverPx += members.length;
    } else {
      for (const i of members) keep[i] = 1;
      keptPx += members.length;
      keptRegions++;
    }
  }
  return { keep, sliverPx, keptPx, keptRegions };
}

/** Core goes fully transparent; the 2px band around it is un-matted against
 *  B, which recovers the true ink colour and coverage of every edge pixel.
 *  `keep` marks enclosed regions that stay exactly as they are. */
function keyOut(img, core, B, tHard, prot, keep) {
  const { w, h, px } = img;
  const n = w * h;
  const near = dilate(dilate(core, w, h), w, h);
  let cored = 0;
  let feathered = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (core[i]) {
      if (px[o + 3] > 0) cored++;
      px[o] = B[0];
      px[o + 1] = B[1];
      px[o + 2] = B[2];
      px[o + 3] = 0;
      continue;
    }
    if (!near[i] || prot[i] || (keep && keep[i])) continue;
    /* Colour-to-alpha. A channel lighter than B carries no ink on a light
       ground: the (p-B)/(255-B) term would turn one level of noise above an
       off-white B (253, 254) into full opacity, so it counts as ground. */
    let a = 0;
    for (let c = 0; c < 3; c++) {
      const p = px[o + c];
      const b = B[c];
      const ac = p > b ? 0 : b === 0 ? 0 : (b - p) / b;
      if (ac > a) a = ac;
    }
    if (distTo(px, i, B) <= tHard) a = 0;
    if (a >= 0.9) continue; // opaque ink, original colour
    feathered++;
    if (a < 0.03) {
      px[o] = B[0];
      px[o + 1] = B[1];
      px[o + 2] = B[2];
      px[o + 3] = 0;
      continue;
    }
    for (let c = 0; c < 3; c++) {
      px[o + c] = Math.max(0, Math.min(255, Math.round(B[c] + (px[o + c] - B[c]) / a)));
    }
    px[o + 3] = Math.round(a * px[o + 3]);
  }
  return { cored, feathered };
}

/** Drop 8-connected specks: faint (max alpha < 0.35) or tiny (<= 3 px). */
function despeckle(img) {
  const { w, h, px } = img;
  const n = w * h;
  const label = new Int32Array(n).fill(-1);
  const stack = new Int32Array(n);
  let removedComponents = 0;
  let removedPixels = 0;
  for (let s = 0; s < n; s++) {
    if (label[s] !== -1 || px[s * 4 + 3] === 0) continue;
    const members = [];
    let top = 0;
    stack[top++] = s;
    label[s] = s;
    let maxA = 0;
    while (top > 0) {
      const i = stack[--top];
      members.push(i);
      if (px[i * 4 + 3] > maxA) maxA = px[i * 4 + 3];
      const x = i % w;
      const y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w || (dx === 0 && dy === 0)) continue;
          const j = yy * w + xx;
          if (label[j] === -1 && px[j * 4 + 3] > 0) {
            label[j] = s;
            stack[top++] = j;
          }
        }
      }
    }
    if (maxA < 0.35 * 255 || members.length <= 3) {
      removedComponents++;
      removedPixels += members.length;
      for (const i of members) px[i * 4 + 3] = 0;
    }
  }
  return { removedComponents, removedPixels };
}

/* ------------------------------------------------------------------ */
/* Step 6: block seam shave                                             */
/* ------------------------------------------------------------------ */

function seamShave(img) {
  const { w, h, px } = img;
  // Reference: median of the ring 4px in from the edges.
  const ring = [];
  const inset = 4;
  for (let x = inset; x <= w - 1 - inset; x++) ring.push(inset * w + x, (h - 1 - inset) * w + x);
  for (let y = inset + 1; y < h - 1 - inset; y++) ring.push(y * w + inset, y * w + (w - 1 - inset));
  const solid = ring.filter((i) => px[i * 4 + 3] > 200);
  const ref = [0, 1, 2].map((c) => median(solid.map((i) => px[i * 4 + c])) ?? 0);

  const line = (edge, k) => {
    const out = [];
    if (edge === "T" || edge === "B") {
      const y = edge === "T" ? k : h - 1 - k;
      for (let x = 0; x < w; x++) out.push(y * w + x);
    } else {
      const x = edge === "L" ? k : w - 1 - k;
      for (let y = 0; y < h; y++) out.push(y * w + x);
    }
    return out;
  };
  // Share of the line's pixels that are solid and close to the reference.
  const fraction = (idx) =>
    idx.filter((i) => px[i * 4 + 3] > 200 && distTo(px, i, ref) <= 40).length / idx.length;

  const shaves = { T: 0, B: 0, L: 0, R: 0 };
  for (const edge of Object.keys(shaves)) {
    const bar = fraction(line(edge, inset)) - 0.25;
    for (let k = 0; k <= 2; k++) {
      if (fraction(line(edge, k)) < bar) shaves[edge]++;
      else break;
    }
  }
  return { img: crop(img, shaves.L, shaves.T, shaves.R, shaves.B), shaves, ref };
}

/* ------------------------------------------------------------------ */
/* Step 7: trim and pad                                                  */
/* ------------------------------------------------------------------ */

function trim(img) {
  const { w, h, px } = img;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (px[o + 3] < 8) {
        px[o + 3] = 0;
        continue;
      }
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error("nothing left after keying");
  return crop(img, x0, y0, w - 1 - x1, h - 1 - y1);
}

/* ------------------------------------------------------------------ */
/* Step 9: checks                                                       */
/* ------------------------------------------------------------------ */

/** Share of edge pixels (partial alpha, or opaque beside a clear pixel)
 *  whose colour sits within 40 of B: a light rim that would read as halo. */
function haloScore(img, B) {
  const { w, h, px } = img;
  let edges = 0;
  let halo = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const a = px[i * 4 + 3];
      if (a === 0) continue;
      let edge = a < 255;
      if (!edge) {
        edge =
          (x > 0 && px[(i - 1) * 4 + 3] === 0) ||
          (x < w - 1 && px[(i + 1) * 4 + 3] === 0) ||
          (y > 0 && px[(i - w) * 4 + 3] === 0) ||
          (y < h - 1 && px[(i + w) * 4 + 3] === 0);
      }
      if (!edge) continue;
      edges++;
      if (distTo(px, i, B) <= 40) halo++;
    }
  }
  return edges === 0 ? 0 : halo / edges;
}

/** Opaque near-B pixels on the trimmed bounding box: leftover canvas. */
function residue(img, B) {
  const { w, h, px } = img;
  let n = 0;
  for (const i of borderIndices(w, h)) {
    if (px[i * 4 + 3] === 255 && distTo(px, i, B) <= 40) n++;
  }
  return n;
}

/** Opaque near-white pixels kept inside the mark (whiteBadge lettering). */
function interiorWhite(img) {
  const { px } = img;
  let n = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 255 && distTo(px, i / 4, [255, 255, 255]) <= 48) n++;
  }
  return n;
}

const countClear = (img) => {
  let n = 0;
  for (let i = 3; i < img.px.length; i += 4) if (img.px[i] === 0) n++;
  return n;
};

/* ------------------------------------------------------------------ */
/* One logo                                                             */
/* ------------------------------------------------------------------ */

async function processLogo(slug, cls) {
  const file = path.join(ORIGINALS_DIR, `${slug}.webp`);
  const opts = PER_FILE[slug] ?? {};
  const treatment = treatmentOf(slug, cls);
  const row = { slug, cls, treatment, flags: [], failures: [] };

  if (cls === "artwork") {
    const bytes = await readFile(file);
    const meta = await sharp(bytes).metadata();
    Object.assign(row, {
      bytes,
      inSize: [meta.width, meta.height],
      outSize: [meta.width, meta.height],
    });
    return row;
  }

  let img = await decode(file);
  row.inSize = [img.w, img.h];

  // 1. Clean-ups.
  if (opts.crop) {
    const { left = 0, top = 0, right = 0, bottom = 0 } = opts.crop;
    img = crop(img, left, top, right, bottom);
    row.notes = `crop L${left} T${top} R${right} B${bottom}`;
  }
  if (opts.gridlines) {
    const replaced = inpaintGridlines(img, opts.gridlines, slug);
    row.notes = `gridlines inpainted (${replaced} px)`;
  }
  if (cls === "white" || cls === "whiteBadge") flattenOnWhite(img);
  for (const [x0, y0, x1, y1] of opts.erase ?? []) {
    const flat = cls === "white" || cls === "whiteBadge";
    for (let y = Math.max(0, y0); y <= Math.min(img.h - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(img.w - 1, x1); x++) {
        const o = (y * img.w + x) * 4;
        if (flat) img.px.fill(255, o, o + 4);
        else img.px[o + 3] = 0;
      }
    }
    row.notes = `${row.notes ? `${row.notes}; ` : ""}erased [${x0},${y0},${x1},${y1}]`;
  }

  const total = img.w * img.h;
  const clearBefore = countClear(img);
  row.shaves = "-";
  row.specks = "-";

  if (cls === "white" || cls === "whiteBadge" || cls === "tint") {
    // 2. Background colour.
    const B = backgroundColour(img, cls);
    const tHard = opts.tHard ?? T_HARD[cls];
    row.B = B;
    row.tHard = tHard;
    // 3. Core, 4. feather band.
    const prot = protectMask(img.w, img.h, opts.protect);
    const core = coreMask(img, B, tHard, cls, prot);
    let keep = null;
    if (cls !== "tint") {
      const settled = settleEnclosed(img, core, B, tHard, prot);
      keep = settled.keep;
      row.enclosed = `${settled.sliverPx} sliver px cleared, ${settled.keptPx} px in ${settled.keptRegions} enclosed region(s) kept`;
    }
    const keyed = keyOut(img, core, B, tHard, prot, keep);
    row.cored = keyed.cored;
    row.feathered = keyed.feathered;
    // 5. Despeckle.
    const sp = despeckle(img);
    row.specks = `${sp.removedPixels}/${sp.removedComponents}`;
    if (sp.removedPixels > 200) row.flags.push(`despeckle removed ${sp.removedPixels} px`);
  }

  if (cls === "block") {
    // 6. Seam shave.
    const shaved = seamShave(img);
    img = shaved.img;
    const s = shaved.shaves;
    row.shaves = Object.entries(s).filter(([, v]) => v > 0).map(([k, v]) => `${k}${v}`).join(" ") || "0";
    const want = EXPECTED_SHAVES[slug] ?? {};
    const wantText = Object.entries(want).map(([k, v]) => `${k}${v}`).join(" ") || "0";
    if (wantText !== row.shaves) row.flags.push(`shaves ${row.shaves}, expected ${wantText}`);
  }

  row.madeClear = (countClear(img) - clearBefore) / total;

  // 7. Trim and pad.
  img = trim(img);
  const B = row.B ?? [255, 255, 255];
  if (row.B) row.residue = residue(img, B);
  img = pad(img, treatment === "badge" ? 0 : 2);
  row.outSize = [img.w, img.h];

  // 9. Checks.
  row.halo = cls === "block" ? undefined : haloScore(img, B);
  if (row.halo !== undefined && row.halo > 0.2) row.flags.push(`halo ${row.halo.toFixed(2)}`);
  if (row.residue > 0) row.flags.push(`residue ${row.residue}`);
  if (cls === "white" && row.cored === 0) row.failures.push("white file had nothing removed");
  if (cls === "whiteBadge") {
    row.interiorWhite = interiorWhite(img);
    if (row.interiorWhite <= 500) {
      row.failures.push(`only ${row.interiorWhite} interior white px kept (lettering eaten?)`);
    }
  }
  if (treatment === "badge" && img.w / img.h > 4.5) {
    row.failures.push(`badge aspect ${(img.w / img.h).toFixed(2)} > 4.5`);
  }

  // 8. Encode.
  row.bytes = await encode(img);
  return row;
}

/* ------------------------------------------------------------------ */
/* Bootstrap, guard, report, manifest                                  */
/* ------------------------------------------------------------------ */

async function bootstrap() {
  await mkdir(ORIGINALS_DIR, { recursive: true });
  const files = (await readdir(PUBLIC_DIR)).filter((f) => f.endsWith(".webp")).sort();
  let copied = 0;
  let same = 0;
  const refused = [];
  for (const f of files) {
    const src = await readFile(path.join(PUBLIC_DIR, f));
    const dest = path.join(ORIGINALS_DIR, f);
    let existing;
    try {
      existing = await readFile(dest);
    } catch {
      existing = undefined;
    }
    if (existing === undefined) {
      await writeFile(dest, src, { flag: "wx" });
      copied++;
    } else if (Buffer.compare(existing, src) === 0) {
      same++;
    } else {
      refused.push(f);
    }
  }
  console.log(`\n  Bootstrap: ${copied} copied, ${same} already identical, ${refused.length} refused.`);
  if (refused.length) {
    console.error(
      `  Refused (an original with different bytes already exists, so the public\n` +
        `  file is probably processed output): ${refused.join(", ")}`,
    );
    process.exitCode = 1;
  }
}

async function guard() {
  const { partners } = await import(pathToFileURL(PARTNERS_TS).href);
  const slugs = partners.map((p) => p.slug);
  const originals = (await readdir(ORIGINALS_DIR))
    .filter((f) => f.endsWith(".webp"))
    .map((f) => f.slice(0, -5));
  const classOf = new Map();
  const problems = [];
  for (const [cls, list] of Object.entries(CLASS_TABLE)) {
    for (const slug of list) {
      if (classOf.has(slug)) problems.push(`${slug} is in the class table twice (${classOf.get(slug)}, ${cls})`);
      classOf.set(slug, cls);
    }
  }
  for (const slug of slugs) {
    if (!classOf.has(slug)) problems.push(`partner ${slug} is missing from the class table`);
    if (!originals.includes(slug)) problems.push(`partner ${slug} has no original in assets/partner-logos-original/`);
  }
  for (const slug of originals) {
    if (!classOf.has(slug)) problems.push(`original ${slug}.webp is missing from the class table`);
  }
  for (const slug of classOf.keys()) {
    if (!originals.includes(slug)) problems.push(`class-table slug ${slug} has no original file`);
  }
  if (new Set(slugs).size !== slugs.length) problems.push("partners.ts has a duplicate slug");
  if (problems.length) {
    throw new Error(`Classification guard failed:\n    ${problems.join("\n    ")}`);
  }
  return classOf;
}

function printReport(rows) {
  const fmtSize = (s) => (s ? `${s[0]}x${s[1]}` : "-");
  const cols = [
    ["slug", (r) => r.slug, 20],
    ["class", (r) => r.cls, 11],
    ["in", (r) => fmtSize(r.inSize), 8],
    ["out", (r) => fmtSize(r.outSize), 8],
    ["B", (r) => (r.B ? r.B.join(",") : "-"), 12],
    ["tHard", (r) => (r.tHard ?? "-").toString(), 5],
    ["cleared", (r) => (r.madeClear === undefined ? "-" : `${(r.madeClear * 100).toFixed(1)}%`), 7],
    ["cored", (r) => (r.cored ?? "-").toString(), 6],
    ["feather", (r) => (r.feathered ?? "-").toString(), 7],
    ["seams", (r) => r.shaves ?? "-", 9],
    ["specks", (r) => r.specks ?? "-", 7],
    ["halo", (r) => (r.halo === undefined ? "-" : r.halo.toFixed(3)), 5],
    ["residue", (r) => (r.residue ?? "-").toString(), 7],
  ];
  const line = (cells) => "  " + cells.map((c, i) => String(c).padEnd(cols[i][2])).join(" ");
  console.log("");
  console.log(line(cols.map((c) => c[0])));
  for (const r of rows) {
    console.log(line(cols.map((c) => c[1](r))));
    if (r.notes) console.log(`      note: ${r.notes}`);
    if (r.enclosed && VERBOSE) console.log(`      enclosed: ${r.enclosed}`);
    if (r.interiorWhite !== undefined) console.log(`      interior white kept: ${r.interiorWhite} px`);
    for (const f of r.flags) console.log(`      flag: ${f}`);
    for (const f of r.failures) console.log(`      FAIL: ${f}`);
  }
}

function manifestSource(rows) {
  const body = [...rows]
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
    .map((r) => `  ${JSON.stringify(r.slug)}: { w: ${r.outSize[0]}, h: ${r.outSize[1]}, treatment: "${r.treatment}" },`)
    .join("\n");
  return `/* GENERATED by scripts/cutout-partner-logos.mjs. Do not edit by hand:
   re-run the script, which rewrites this file from the processed logos.

   Pixel size and marquee treatment of every partner logo after the canvas
   was cut away and the file trimmed. Keyed by slug, not path, because in
   production the image URL is a Sanity CDN URL.
     mark     transparent cutout, sized by equal area
     badge    a full-bleed coloured plate, shown at one height with a radius
     artwork  photographic, kept off the marquee */

export type LogoTreatment = "mark" | "badge" | "artwork";

export interface PartnerLogoGeometry {
  w: number;
  h: number;
  treatment: LogoTreatment;
}

export const partnerLogoSizes: Record<string, PartnerLogoGeometry> = {
${body}
};
`;
}

async function main() {
  if (hasFlag("bootstrap")) {
    await bootstrap();
    return;
  }

  const classOf = await guard();
  const only = option("only")?.split(",").map((s) => s.trim()).filter(Boolean);
  const outDir = option("out") ? path.resolve(option("out")) : PUBLIC_DIR;
  const dryRun = hasFlag("dry-run");
  const writeManifest = !dryRun && !only && outDir === PUBLIC_DIR;

  const slugs = [...classOf.keys()].sort();
  for (const s of only ?? []) if (!classOf.has(s)) throw new Error(`--only: unknown slug ${s}`);
  const todo = only ? slugs.filter((s) => only.includes(s)) : slugs;

  const rows = [];
  for (const slug of todo) rows.push(await processLogo(slug, classOf.get(slug)));

  printReport(rows);

  const byClass = {};
  for (const r of rows) byClass[r.cls] = (byClass[r.cls] ?? 0) + 1;
  const byTreatment = {};
  for (const r of rows) byTreatment[r.treatment] = (byTreatment[r.treatment] ?? 0) + 1;
  const failures = rows.flatMap((r) => r.failures.map((f) => `${r.slug}: ${f}`));
  const flags = rows.flatMap((r) => r.flags.map((f) => `${r.slug}: ${f}`));
  console.log(`\n  ${rows.length} logo(s). Classes: ${JSON.stringify(byClass)}. Treatments: ${JSON.stringify(byTreatment)}.`);
  console.log(`  ${flags.length} flag(s), ${failures.length} failure(s).`);

  if (failures.length) {
    console.error(`\n  Failures, nothing written:\n    ${failures.join("\n    ")}\n`);
    process.exitCode = 1;
    return;
  }
  if (dryRun) {
    console.log("  Dry run: nothing written.\n");
    return;
  }

  await mkdir(outDir, { recursive: true });
  let bytes = 0;
  for (const r of rows) {
    await writeFile(path.join(outDir, `${r.slug}.webp`), r.bytes);
    bytes += r.bytes.byteLength;
  }
  console.log(`  Wrote ${rows.length} WebP(s) to ${path.relative(root, outDir) || outDir} (${(bytes / 1024).toFixed(0)} KB).`);
  if (writeManifest) {
    await writeFile(MANIFEST_PATH, manifestSource(rows));
    console.log(`  Wrote ${path.relative(root, MANIFEST_PATH)}.`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(`\n  ${err.message ?? err}\n`);
  process.exit(1);
});
