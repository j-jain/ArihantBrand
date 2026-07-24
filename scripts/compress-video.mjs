/**
 * Re-encode the Apparels promo down to a size a phone on Indian mobile data
 * will actually finish.
 *
 * The shipped file is 65 seconds of 1280x720 at ~1350 kb/s, which is 11 MB.
 * The change brief (AA8) reported it as "renders as a raw file link"; the file
 * plays fine, so the likely complaint is that 11 MB does not start on a phone
 * connection. This drops it to 960x540 at ~600 kb/s video / 64 kb/s mono
 * audio, which is the right size for a click-to-play promo inside a page and
 * lands around 5 MB.
 *
 * No WebM: VP9 at a matching quality came out LARGER than H.264 on this
 * footage (11 MB against 5.3 MB), so a second file would have cost bytes and
 * bought nothing. H.264 in MP4 plays everywhere this site is opened.
 *
 * `+faststart`, so playback can begin before the file has finished.
 *
 * Run: `node scripts/compress-video.mjs`
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync, renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videoDir = path.join(root, "public", "videos");
const src = path.join(videoDir, "apparels-promo.mp4");
const tmpMp4 = path.join(videoDir, "apparels-promo.tmp.mp4");

if (!existsSync(src)) {
  console.error("Source not found:", src);
  process.exit(1);
}

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
const run = (args) => execFileSync(ffmpegPath, args, { stdio: "inherit" });

const before = mb(src);

console.log("Encoding MP4 (H.264, 960x540)...");
run([
  "-y", "-i", src,
  "-map", "0:v:0", "-map", "0:a:0",
  "-vf", "scale=960:-2",
  "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-crf", "30", "-maxrate", "700k", "-bufsize", "1400k",
  "-preset", "slow", "-r", "24",
  "-c:a", "aac", "-b:a", "64k", "-ac", "1",
  "-movflags", "+faststart",
  tmpMp4,
]);

renameSync(tmpMp4, src);

console.log(`\nMP4  ${before} MB -> ${mb(src)} MB`);
