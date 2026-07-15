"use client";

import Image from "next/image";
import type { Partner } from "@/content/types";
import { cn } from "./cn";

interface LogoTileProps {
  partner: Partner;
  /** When provided the tile renders as a button that opens the partner modal.
   *  Without it, the tile is a static plate (unchanged original behaviour). */
  onSelect?: (partner: Partner) => void;
}

/** White bordered logo tile, uniform 3:2, logo padded and object-contained.
 *  The grid parent controls the tile's rendered size. As a button it carries a
 *  quiet lift on hover/focus and announces the dialog it opens. */
export function LogoTile({ partner, onSelect }: LogoTileProps) {
  const base = "relative aspect-[3/2] rounded-md border border-line bg-white p-[16%]";
  const media = (
    <span className="relative block h-full w-full">
      <Image
        src={partner.image}
        alt={onSelect ? "" : partner.name}
        fill
        className="object-contain"
        sizes="(max-width: 640px) 40vw, 180px"
      />
    </span>
  );

  if (!onSelect) {
    return <div className={base}>{media}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(partner)}
      aria-haspopup="dialog"
      aria-label={partner.name}
      className={cn(base, "logo-tile-btn")}
    >
      {media}
    </button>
  );
}
