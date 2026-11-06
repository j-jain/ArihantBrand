import { Besley, Archivo } from "next/font/google";

/** Display + headings — Clarendon-slab trade-poster DNA. Variable weight.
 *  The upright face is preloaded: it sets every hero headline. */
export const besley = Besley({
  subsets: ["latin"],
  style: ["normal"],
  variable: "--font-besley",
  display: "swap",
});

/** Besley's italic as its own family (performance pass), NOT preloaded: it is
 *  only ever used below the fold (the testimonial quotes, the Apparels
 *  mission line, an atlas label), so it no longer competes with the hero for
 *  the first bytes. Italic text names it first: `var(--font-besley-italic),
 *  var(--font-besley)`; a plain `var(--font-besley)` in italic would get a
 *  synthesised slant, since that family now has no italic face. */
export const besleyItalic = Besley({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-besley-italic",
  display: "swap",
  preload: false,
});

/** Body, UI, labels, stats. Variable width + weight; the `wdth` axis powers
 *  the condensed thread-label caps and big stat figures (font-stretch). */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
