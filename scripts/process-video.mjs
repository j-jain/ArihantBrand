/**
 * One-off: transcode the 161 MB "Arihant Event Promo.mov" (720p, 18 Mbps, PCM
 * audio) into a web-sized MP4 plus a poster frame. WebM is produced separately.
 * Run: `node scripts/process-video.mjs`
 */
import { mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "Arihant Event Promo.mov");
const videoDir = path.join(root, "public", "videos");
const posterPath = path.join(root, "public", "images", "photos", "apparels-promo-poster.jpg");
const mp4 = path.join(videoDir, "apparels-promo.mp4");

if (!existsSync(src)) {
  console.error("Source video not found:", src);
  process.exit(1);
}
await mkdir(videoDir, { recursive: true });

const run = (args) => execFileSync(ffmpegPath, args, { stdio: "inherit" });

console.log("Encoding MP4 (H.264)...");
run([
  "-y", "-i", src,
  "-map", "0:v:0", "-map", "0:a:0",
  "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-crf", "28", "-maxrate", "1500k", "-bufsize", "3000k", "-preset", "medium", "-r", "24",
  "-c:a", "aac", "-b:a", "96k", "-ac", "2",
  "-movflags", "+faststart",
  mp4,
]);

console.log("Extracting poster frame...");
run(["-y", "-ss", "00:00:03", "-i", src, "-frames:v", "1", "-q:v", "3", posterPath]);

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
console.log(`\nMP4:    ${mb(mp4)} MB`);
console.log(`Poster: ${(statSync(posterPath).size / 1024).toFixed(0)} KB`);
