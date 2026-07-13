import { Besley, Archivo } from "next/font/google";

/** Display + headings — Clarendon-slab trade-poster DNA. Variable weight,
 *  italic enabled for one-word emphasis inside headings. */
export const besley = Besley({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-besley",
  display: "swap",
});

/** Body, UI, labels, stats. Variable width + weight; the `wdth` axis powers
 *  the condensed thread-label caps and big stat figures (font-stretch). */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
