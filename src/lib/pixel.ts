/**
 * The site's one pixel vocabulary (change round 3).
 *
 * Pixel formation appears in exactly two places: the home hero word
 * ("leading" assembling from square pixels) and the Arihant Retail store
 * atlas (land lighting up in stepped rings, routes stitching out of
 * Guwahati). Both read their timing and finish from here so they feel like
 * one system. A third use needs a DESIGN.md change first.
 */
export const PIXEL = {
  /** Square size as a fraction of its grid cell (the gap is the rest). */
  fill: 0.8,
  /** Ease for a pixel arriving or a stitch scaling in. */
  ease: "power2.out",
  /** Stepped ease for a whole ring of land lighting up. */
  step: "steps(3)",
  /** Delay between successive land rings, in seconds. */
  ringStagger: 0.028,
  /** Delay between successive route stitches, in seconds. */
  stitchStagger: 0.035,
} as const;
