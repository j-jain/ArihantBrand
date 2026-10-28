/**
 * Build the browser tab and home-screen icons from the Arihant Marketing logo.
 *
 * Until now src/app/favicon.ico was the create-next-app default (the Vercel
 * triangle). This keeps only the logo's emblem, the grey towers and the red
 * pocket: the "ARIHANT MARKETING" wordmark and its two rules sit below a gap
 * of empty rows and are dropped, since no letter survives at 16 to 48px. The
 * emblem is centred on a white tile so it reads on light and dark tab strips.
 *
 * Reads public/images/logos/arihant-marketing.png (the transparent cutout from
 * scripts/cutout-unit-logos.mjs) and writes, by Next's file conventions:
 *   src/app/favicon.ico     16, 32 and 48px PNGs in one ICO
 *   src/app/icon.png        192px (a multiple of 48, as Google's favicon asks)
 *   src/app/apple-icon.png  180px, opaque white square (iOS rounds it)
 * Re-run after the logo changes; never hand-edit the outputs.
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/build-favicon.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public", "images", "logos", "arihant-marketing.png");
const APP_DIR = path.join(root, "src", "app");

/** A row counts as inked when any pixel's alpha is above this. */
const ALPHA_MIN = 8;
/** Empty rows that end the emblem (the gap above the first rule is ~20). */
const GAP_ROWS = 6;
/** Master tile size; every output is a downscale of it. */
const MASTER = 512;
/** Emblem width as a share of the tile. */
const FILL = 0.86;
/** Corner radius of the tab tile as a share of its side. */
const RADIUS = 0.22;
/** The apple tile is cropped round by iOS, so it keeps more margin. */
const APPLE_FILL = 0.78;

/** The emblem's box: the first block of inked rows, then its inked columns. */
async function emblemBox() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const alpha = (x, y) => data[(y * width + x) * channels + 3];
  const rowInked = (y) => {
    for (let x = 0; x < width; x++) if (alpha(x, y) > ALPHA_MIN) return true;
    return false;
  };

  let top = 0;
  while (top < height && !rowInked(top)) top++;
  let bottom = top;
  let empty = 0;
  for (let y = top; y < height; y++) {
    if (rowInked(y)) {
      bottom = y;
      empty = 0;
    } else if (++empty >= GAP_ROWS) break;
  }

  let left = width;
  let right = 0;
  for (let y = top; y <= bottom; y++) {
    for (let x = 0; x < width; x++) {
      if (alpha(x, y) <= ALPHA_MIN) continue;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  if (bottom <= top || right <= left) throw new Error("no emblem found in the logo");
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/** The emblem centred on a white tile of `size`, rounded unless `square`. */
async function tile(box, size, { fill, square }) {
  const emblem = await sharp(SOURCE)
    .extract(box)
    .resize({ width: Math.round(size * fill) })
    .png()
    .toBuffer();
  const meta = await sharp(emblem).metadata();
  const r = square ? 0 : Math.round(size * RADIUS);
  const ground = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${r}" fill="#ffffff"/></svg>`,
  );
  return sharp(ground)
    .composite([
      {
        input: emblem,
        left: Math.round((size - meta.width) / 2),
        top: Math.round((size - meta.height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

/** An ICO holding PNG images (every browser since IE Vista reads these). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // no palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

const box = await emblemBox();
const master = await tile(box, MASTER, { fill: FILL, square: false });
const at = (size) => sharp(master).resize(size, size).png().toBuffer();

const icoImages = [];
for (const size of [16, 32, 48]) icoImages.push({ size, png: await at(size) });
const outputs = {
  "favicon.ico": ico(icoImages),
  "icon.png": await at(192),
  "apple-icon.png": await sharp(await tile(box, MASTER, { fill: APPLE_FILL, square: true }))
    .resize(180, 180)
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer(),
};

for (const [name, buf] of Object.entries(outputs)) {
  await writeFile(path.join(APP_DIR, name), buf);
  console.log(`${name}  ${buf.length} bytes`);
}
console.log(`emblem box: ${JSON.stringify(box)}`);
