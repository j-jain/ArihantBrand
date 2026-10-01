/**
 * Optical sizing for the home logo marquee (change round 3).
 *
 * With the white tiles gone, logos range from about 11:1 (skechers) to
 * roughly square, so a fixed box would make some shout and others vanish.
 * Marks are sized to an equal visual AREA, clamped by height and width;
 * coloured-block logos (whose block is the mark) are set as badges at one
 * height. Geometry comes from the generated manifest
 * (src/content/partner-logo-sizes.ts, written by scripts/cutout-partner-logos.mjs)
 * and is keyed by slug, because in production the image URL is a Sanity CDN
 * URL that says nothing about the file.
 */
import { partnerLogoSizes, type PartnerLogoGeometry } from "@/content/partner-logo-sizes";
import type { Partner } from "@/content/types";

/** rem, and rem² for the area. */
export const MARQUEE = {
  markArea: 11,
  markMinH: 1.5,
  markMaxH: 3.25,
  markMaxW: 11,
  badgeH: 2.25,
} as const;

/** A partner added in the Studio with no manifest entry is never excluded:
 *  it gets a neutral 2:1 mark. */
export function logoGeometry(slug: string): PartnerLogoGeometry {
  return partnerLogoSizes[slug] ?? { w: 2, h: 1, treatment: "mark" };
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** The logo's box in rem. */
export function marqueeBox(g: PartnerLogoGeometry): { w: number; h: number } {
  const ratio = g.w > 0 && g.h > 0 ? g.w / g.h : 2;
  if (g.treatment === "badge") {
    return { w: r3(MARQUEE.badgeH * ratio), h: r3(MARQUEE.badgeH) };
  }
  let h = Math.min(MARQUEE.markMaxH, Math.max(MARQUEE.markMinH, Math.sqrt(MARQUEE.markArea / ratio)));
  let w = h * ratio;
  if (w > MARQUEE.markMaxW) {
    w = MARQUEE.markMaxW;
    h = w / ratio;
  }
  return { w: r3(w), h: r3(h) };
}

/** Marquee order: photographic/artwork logos are left out (they cannot be cut
 *  out cleanly and stay on /brands); the ranked prefix keeps its order; the
 *  unranked tail is interleaved so no two badges sit side by side. The tail's
 *  order carries no ranking claim, so reordering it changes nothing a reader
 *  is told. */
export function marqueeSequence(partners: Partner[]): Partner[] {
  const usable = partners.filter((p) => logoGeometry(p.slug).treatment !== "artwork");
  const ranked = usable.filter((p) => p.rank !== undefined);
  const tail = usable.filter((p) => p.rank === undefined);
  const marks = tail.filter((p) => logoGeometry(p.slug).treatment !== "badge");
  const badges = tail.filter((p) => logoGeometry(p.slug).treatment === "badge");
  const out: Partner[] = [...ranked];
  const nm = marks.length;
  const nb = badges.length;
  let placed = 0;
  for (let i = 0; i < nm; i++) {
    out.push(marks[i]);
    if (nm && Math.floor(((i + 1) * nb) / nm) > placed && placed < nb) {
      out.push(badges[placed]);
      placed += 1;
    }
  }
  while (placed < nb) {
    out.push(badges[placed]);
    placed += 1;
  }
  return out;
}
