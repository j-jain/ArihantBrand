/**
 * The site's one pixel vocabulary (change round 3).
 *
 * Pixel formation appears in exactly one place since change round 4: the
 * home hero word ("leading" assembling from square pixels). The Arihant
 * Retail store atlas read its ring and stitch timings from here until it
 * became a terrain map; those tokens went in change round 10. A second use
 * needs a DESIGN.md change first.
 */
export const PIXEL = {
  /** Square size as a fraction of its grid cell (the gap is the rest). */
  fill: 0.8,
  /** Ease for a pixel arriving. */
  ease: "power2.out",
} as const;
