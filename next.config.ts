import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next doesn't infer it from a
  // stray lockfile in a parent directory.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // AVIF first, WebP second. Both beat the source PNG/JPEG substantially and
    // every browser this site targets takes one of them.
    formats: ["image/avif", "image/webp"],
    // Next's default deviceSizes top out at 3840, and the widest entry becomes
    // the `src` fallback on every <Image>. On /brands that put a 3840px URL on
    // 77 lazy logo tiles rendered at 180px (change brief, G11). No source image
    // in this repo is wider than ~2400px, so 2048 is the honest ceiling.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Logo tiles render at 128-180px; these are the widths `sizes` resolves to.
    imageSizes: [16, 32, 48, 64, 96, 128, 180, 256, 384],
  },
};

export default nextConfig;
