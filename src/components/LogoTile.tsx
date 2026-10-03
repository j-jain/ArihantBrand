"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { Partner } from "@/content/types";
import { logoGeometry, wallBox } from "@/lib/logoGeometry";
import { cn } from "./cn";

interface LogoTileProps {
  partner: Partner;
  /** When provided the tile renders as a button that opens the partner modal.
   *  Without it, the tile is a static cell. */
  onSelect?: (partner: Partner) => void;
}

/** One logo in a wall, with no tile behind it (change round 5): the white
 *  bordered plate is gone and the logo sits straight on the section ground,
 *  in a uniform 3:2 cell that the grid sizes. Transparent cutouts are sized
 *  optically (equal area); a logo whose coloured block is the mark keeps it
 *  as a rounded badge at one height, as on the home marquee. As a button the
 *  mark lifts a little on hover and announces the dialog it opens. */
export function LogoTile({ partner, onSelect }: LogoTileProps) {
  const geometry = logoGeometry(partner.slug);
  const box = wallBox(geometry);
  const style = { "--lw": box.w, "--lh": box.h } as CSSProperties;
  const media = (
    <span
      className="logo-tile__mark"
      data-treatment={geometry.treatment === "mark" ? undefined : "badge"}
    >
      <Image
        src={partner.image}
        alt={onSelect ? "" : partner.name}
        fill
        className="object-contain"
        sizes="(max-width: 640px) 30vw, 160px"
      />
    </span>
  );

  if (!onSelect) {
    return (
      <div className="logo-tile" style={style}>
        {media}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(partner)}
      aria-haspopup="dialog"
      aria-label={partner.name}
      className={cn("logo-tile", "logo-tile-btn")}
      style={style}
    >
      {media}
    </button>
  );
}
