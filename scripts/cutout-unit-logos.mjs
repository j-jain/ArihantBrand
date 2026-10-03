/**
 * Cut the three business logos out of their white canvases (change round 5).
 *
 * The unit logos (Arihant Marketing, Apparels, Retail) were drawn on an opaque
 * white canvas, which showed as a white box wherever a logo sat on the paper
 * ground: the header's Businesses menu, the unit-hero lockup, the phone menu.
 * This keys the canvas out with the same steps the partner logos use
 * (scripts/cutout-partner-logos.mjs: a flood from the border, enclosed
 * counters decided whole, an exact un-matte of the anti-aliased edge so no
 * light halo is left), trims each file to its ink and pads it by 2px.
 *
 * Originals live in assets/unit-logos-original/{slug}.png (never served).
 * Every run reads the originals and overwrites public/images/logos/{slug}.png,
 * so running it again gives the same output.
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/cutout-unit-logos.mjs [--bootstrap] [--dry-run]
 *
 *   --bootstrap  copy public/images/logos/*.png into the originals folder and
 *                stop. Refuses to overwrite an original whose bytes differ.
 *   --dry-run    process and report, write nothing
 *
 * The seed uploads these files to Sanity, so a re-run reaches production only
 * through `npm run seed` (after the matching deploy).
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import {
  backgroundColour,
  coreMask,
  decode,
  despeckle,
  flattenOnWhite,
  keyOut,
  pad,
  protectMask,
  settleEnclosed,
  trim,
  T_HARD,
} from "./cutout-partner-logos.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(root, "public", "images", "logos");
const ORIGINALS_DIR = path.join(root, "assets", "unit-logos-original");
const SLUGS = ["arihant-marketing", "arihant-apparels", "arihant-retail"];

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);

async function bootstrap() {
  await mkdir(ORIGINALS_DIR, { recursive: true });
  for (const slug of SLUGS) {
    const from = path.join(PUBLIC_DIR, `${slug}.png`);
    const to = path.join(ORIGINALS_DIR, `${slug}.png`);
    if (existsSync(to)) {
      const [a, b] = await Promise.all([readFile(from), readFile(to)]);
      if (!a.equals(b)) throw new Error(`${slug}: an original already exists and differs; not overwriting`);
      console.log(`  ${slug}: original already in place`);
      continue;
    }
    await copyFile(from, to);
    console.log(`  ${slug}: original saved`);
  }
}

async function processLogo(slug) {
  let img = await decode(path.join(ORIGINALS_DIR, `${slug}.png`));
  const inSize = [img.w, img.h];
  flattenOnWhite(img);
  const B = backgroundColour(img, "white");
  const tHard = T_HARD.white;
  const prot = protectMask(img.w, img.h);
  const core = coreMask(img, B, tHard, "white", prot);
  const settled = settleEnclosed(img, core, B, tHard, prot);
  const keyed = keyOut(img, core, B, tHard, prot, settled.keep);
  const specks = despeckle(img);
  img = pad(trim(img), 2);
  const bytes = await sharp(Buffer.from(img.px.buffer, img.px.byteOffset, img.px.byteLength), {
    raw: { width: img.w, height: img.h, channels: 4 },
  })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  return {
    slug,
    inSize,
    outSize: [img.w, img.h],
    B,
    cored: keyed.cored,
    feathered: keyed.feathered,
    enclosedKept: settled.keptRegions,
    specks: specks.removedPixels,
    bytes,
  };
}

async function main() {
  if (hasFlag("bootstrap")) {
    await bootstrap();
    return;
  }
  for (const slug of SLUGS) {
    if (!existsSync(path.join(ORIGINALS_DIR, `${slug}.png`))) {
      throw new Error(`${slug}: no original in assets/unit-logos-original (run --bootstrap first)`);
    }
  }
  const rows = [];
  for (const slug of SLUGS) rows.push(await processLogo(slug));
  for (const r of rows) {
    console.log(
      `  ${r.slug}: ${r.inSize.join("x")} -> ${r.outSize.join("x")}, ground ${r.B.join(",")}, ` +
        `${r.cored} px cleared, ${r.feathered} edge px un-matted, ${r.enclosedKept} enclosed region(s) kept, ` +
        `${r.specks} speck px, ${(r.bytes.byteLength / 1024).toFixed(0)} KB`,
    );
  }
  if (hasFlag("dry-run")) {
    console.log("  Dry run: nothing written.");
    return;
  }
  for (const r of rows) await writeFile(path.join(PUBLIC_DIR, `${r.slug}.png`), r.bytes);
  console.log(`  Wrote ${rows.length} PNG(s) to ${path.relative(root, PUBLIC_DIR)}.`);
}

main().catch((err) => {
  console.error(`\n  ${err.message ?? err}\n`);
  process.exit(1);
});
