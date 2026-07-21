/**
 * One-off: resize the real client photos (Team / Warehouse / Awards) from the
 * repo-root source folders into web-sized JPEGs under public/images/photos/.
 * Real photos are referenced by raw path (never the stock-only images.ts
 * manifest). Run: `node scripts/process-photos.mjs`
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "photos");
const awardsOut = path.join(outDir, "awards");

/** [source relative to repo root, destination relative to public/images/photos, maxEdge] */
const jobs = [
  // Team
  ["Team/WhatsApp Image 2026-07-21 at 7.01.35 PM.jpeg", "apparels-team.jpg", 2000],
  ["Team/WhatsApp Image 2026-07-21 at 7.01.45 PM.jpeg", "apparels-fair-2024.jpg", 2000],
  // Warehouse
  ["Warehouse/WhatsApp Image 2026-07-21 at 7.01.33 PM (2).jpeg", "apparels-warehouse-1.jpg", 2000],
  ["Warehouse/WhatsApp Image 2026-07-21 at 7.01.34 PM (2).jpeg", "apparels-warehouse-2.jpg", 2000],
  ["Warehouse/WhatsApp Image 2026-07-21 at 7.01.34 PM.jpeg", "apparels-warehouse-3.jpg", 2000],
  // Awards (destinations match src/content/seed.ts recognitionPhotos)
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.33 PM.jpeg", "awards/award-tadpole-champion-2122.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.33 PM (1).jpeg", "awards/award-indian-terrain-east-india.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.31 PM (2).jpeg", "awards/award-twills-2021.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.32 PM (1).jpeg", "awards/award-indian-terrain-2023.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.32 PM (2).jpeg", "awards/award-distributor-of-the-year.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.31 PM (1).jpeg", "awards/award-octave-excellence-2024.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.32 PM.jpeg", "awards/award-tadpole-15yr-thailand.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.30 PM (1).jpeg", "awards/award-tadpole-launch-2018.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.31 PM.jpeg", "awards/award-tadpole-assam.jpg", 1600],
  ["Awards/WhatsApp Image 2026-07-21 at 7.01.30 PM.jpeg", "awards/award-cmai-nigf-2024.jpg", 1600],
];

await mkdir(outDir, { recursive: true });
await mkdir(awardsOut, { recursive: true });

let ok = 0;
for (const [srcRel, destRel, maxEdge] of jobs) {
  const src = path.join(root, srcRel);
  const dest = path.join(outDir, destRel);
  if (!existsSync(src)) {
    console.warn("MISSING source:", srcRel);
    continue;
  }
  const info = await sharp(src)
    .rotate() // respect EXIF orientation, then strip metadata
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(dest);
  ok += 1;
  console.log(`${destRel}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
}
console.log(`\nDone: ${ok}/${jobs.length} images written to public/images/photos/`);
