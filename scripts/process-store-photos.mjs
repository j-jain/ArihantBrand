/**
 * Change round 11: the client's photographs from the shared `Arihant\Photo`
 * folder (store shoots, the Marketing godown, the group's building) resized
 * into web-sized JPEGs under public/images/photos/.
 *
 * The source folder sits OUTSIDE the repo (a sibling of Website/) and is never
 * served. Every run reads the originals and overwrites the outputs, so running
 * it again gives the same files. EXIF orientation is applied first and the
 * metadata is stripped. A job may carry a crop, given as fractions of the
 * oriented image, for the frames that need a particular window (the Goalpara
 * sign for the retail hero's 6:7 front frame, the Goalpara street front for
 * the 3:2 store cards).
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/process-store-photos.mjs [--src=<folder>] [--dry-run]
 *
 *   --src      the photo folder (default ../Photo, relative to the repo root)
 *   --dry-run  report what would be written, write nothing
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const srcArg = args.find((a) => a.startsWith("--src="))?.slice("--src=".length);
const srcRoot = path.resolve(root, srcArg || "../Photo");
const outDir = path.join(root, "public", "images", "photos");

/** [source relative to the photo folder, destination relative to public/images/photos, maxEdge, crop?]
 *  crop = { left, top, width, height } as fractions of the oriented image. */
const jobs = [
  // Urban Closet, Guwahati (the "Guwahati Store Photos" set)
  ["Guwahati Store Photos/SST.jpeg", "stores/store-guwahati-front.jpg", 1600],
  ["Guwahati Store Photos/SST2.jpeg", "stores/store-guwahati-floor.jpg", 1600],
  ["Guwahati Store Photos/SST3.jpeg", "stores/store-guwahati-shirts.jpg", 1600],
  // Urban Closet, Goalpara
  [
    "Urban Closet Goalpara/IMG-20260723-WA0039.jpg.jpeg",
    "stores/store-goalpara-front.jpg",
    1600,
    { left: 0, top: 0.35, width: 1, height: 0.55 },
  ],
  [
    "Urban Closet Goalpara/DSCF0048.JPG",
    "stores/store-goalpara-sign.jpg",
    1600,
    { left: 0.227, top: 0, width: 0.5714, height: 1 },
  ],
  ["Urban Closet Goalpara/DSCF0040.JPG", "stores/store-goalpara-aisle.jpg", 2000],
  ["Urban Closet Goalpara/DSCF0030.JPG", "stores/store-goalpara-floor.jpg", 2000],
  ["Urban Closet Goalpara/DSCF0015.JPG", "stores/store-goalpara-shirtwall.jpg", 2000],
  ["Urban Closet Goalpara/DSCF0001.JPG", "stores/store-goalpara-entry.jpg", 2000],
  // K.A.K, Kohima
  ["KAK, Kohima Photos/IMG-20250617-WA0040.jpg", "stores/store-kohima-front.jpg", 1600],
  ["KAK, Kohima Photos/IMG_4957.jpg", "stores/store-kohima-menswear.jpg", 2000],
  ["KAK, Kohima Photos/IMG-20240325-WA0031.jpg", "stores/store-kohima-floor.jpg", 1600],
  ["KAK, Kohima Photos/IMG_4962.jpg", "stores/store-kohima-kids.jpg", 2000],
  ["KAK, Kohima Photos/IMG_4866.jpg", "stores/store-kohima-indian-terrain.jpg", 2000],
  // Tanzee, Itanagar (interiors only: the front's sign reads Urban Closet).
  // The floor shot runs as the Apparels hero; the interior on the store card.
  ["Urban Closet Itanagar Photos/DSCF0401.JPG", "stores/store-itanagar-floor.jpg", 2000],
  ["Urban Closet Itanagar Photos/DSCF0311.JPG", "stores/store-itanagar-interior.jpg", 2000],
  // The polo wall, the home hero since change round 12
  ["Urban Closet Itanagar Photos/WhatsApp Image 2026-03-16 at 11.52.10.jpeg", "stores/store-itanagar-polos.jpg", 1600],
  // Urban Closet, Tura
  ["Urban Closet Tura/Store Front.jpeg", "stores/store-tura-front.jpg", 1600],
  // Arihant Marketing godown, and the group's building
  ["Arihant Marketing Photos/Arihant Marketing Godown Photo 1.jpeg", "marketing-godown-1.jpg", 2000],
  ["Arihant Marketing Photos/Arihant Marketing Godown Photo 4.jpeg", "marketing-godown-2.jpg", 2000],
  ["Arihant Marketing Photos/Arihant Group Building Photo.jpg", "group-building.jpg", 2000],
  // The building cut to a portrait window for the Marketing hero (change round 12)
  [
    "Arihant Marketing Photos/Arihant Group Building Photo.jpg",
    "group-building-portrait.jpg",
    2000,
    { left: 0.38, top: 0, width: 0.6, height: 1 },
  ],
];

await mkdir(path.join(outDir, "stores"), { recursive: true });

let ok = 0;
for (const [srcRel, destRel, maxEdge, crop] of jobs) {
  const src = path.join(srcRoot, srcRel);
  const dest = path.join(outDir, destRel);
  if (!existsSync(src)) {
    console.warn("MISSING source:", srcRel);
    continue;
  }
  // Orient first, as its own pass, so a crop is measured on the picture as it
  // is seen rather than on the sensor's raw orientation.
  const oriented = await sharp(src).rotate().toBuffer();
  let image = sharp(oriented);
  if (crop) {
    const { width, height } = await image.metadata();
    const region = {
      left: Math.round(crop.left * width),
      top: Math.round(crop.top * height),
      width: Math.round(crop.width * width),
      height: Math.round(crop.height * height),
    };
    image = image.extract(region);
  }
  image = image
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true });
  if (dryRun) {
    const { width, height } = await image.toBuffer({ resolveWithObject: true }).then((r) => r.info);
    console.log(`(dry) ${destRel}  ${width}x${height}`);
    ok += 1;
    continue;
  }
  const info = await image.toFile(dest);
  ok += 1;
  console.log(`${destRel}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
}
console.log(`\nDone: ${ok}/${jobs.length} images written to public/images/photos/`);
