/**
 * One-off: convert the partner logos from PNG to WebP.
 *
 * They are line-art marks on flat grounds, which is the case WebP handles
 * best: lossless WebP lands them ~36% smaller with no visible change, and an
 * alpha channel survives wherever a mark actually uses one.
 *
 * Next re-encodes them on request anyway, but the source size still governs
 * cold-cache encode time and repo weight, and /brands requests all 77.
 *
 * Run: `node scripts/process-partner-logos.mjs`
 * Then update src/content/partners.ts to reference .webp (already done).
 */
import { readdir, readFile, writeFile, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "images", "partners");

const DELETE_SOURCE = process.argv.includes("--delete-png");

async function main() {
  const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith(".png"));
  if (files.length === 0) {
    console.log("  No PNGs left in public/images/partners — nothing to do.");
    return;
  }

  let before = 0;
  let after = 0;
  let converted = 0;

  for (const file of files) {
    const src = path.join(dir, file);
    const out = path.join(dir, file.replace(/\.png$/i, ".webp"));

    const input = await readFile(src);
    before += input.byteLength;

    // Lossless keeps flat brand colour exact; effort 6 is the practical
    // ceiling before compression time stops paying for itself.
    const buffer = await sharp(input)
      .webp({ lossless: true, effort: 6 })
      .toBuffer();

    await writeFile(out, buffer);
    after += buffer.byteLength;
    converted += 1;

    if (DELETE_SOURCE) await unlink(src);
  }

  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  console.log(`\n  Converted ${converted} logo(s).`);
  console.log(`  PNG:  ${kb(before)}`);
  console.log(`  WebP: ${kb(after)}  (${(100 - (after / before) * 100).toFixed(1)}% smaller)`);
  if (!DELETE_SOURCE) {
    console.log("\n  PNGs kept. Re-run with --delete-png once the site is verified.\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Keep `stat` imported for future size reporting without a second import edit.
void stat;
