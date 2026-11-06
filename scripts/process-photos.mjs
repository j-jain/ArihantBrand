/**
 * One-off: resize the real client photos (Team / Warehouse) from the
 * repo-root source folders into web-sized WebP files under public/images/photos/
 * (WebP since the performance pass; the award photos it used to write are the
 * cut-outs scripts/cutout-awards.py makes now). Run: `node scripts/process-photos.mjs`
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "photos");

/** [source relative to repo root, destination relative to public/images/photos, maxEdge] */
const jobs = [
  // Team
  ["Team/WhatsApp Image 2026-07-21 at 7.01.35 PM.jpeg", "apparels-team.webp", 2000],
  ["Team/WhatsApp Image 2026-07-21 at 7.01.45 PM.jpeg", "apparels-fair-2024.webp", 2000],
  // Warehouse
  ["Warehouse/WhatsApp Image 2026-07-21 at 7.01.33 PM (2).jpeg", "apparels-warehouse-1.webp", 2000],
  ["Warehouse/WhatsApp Image 2026-07-21 at 7.01.34 PM (2).jpeg", "apparels-warehouse-2.webp", 2000],
  ["Warehouse/WhatsApp Image 2026-07-21 at 7.01.34 PM.jpeg", "apparels-warehouse-3.webp", 2000],
];

await mkdir(outDir, { recursive: true });

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
    // q82: about JPEG q80's fidelity at ~25% fewer bytes; next/image
    // re-encodes it for delivery anyway.
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(dest);
  ok += 1;
  console.log(`${destRel}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
}
console.log(`\nDone: ${ok}/${jobs.length} images written to public/images/photos/`);
