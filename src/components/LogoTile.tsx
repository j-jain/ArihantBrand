import Image from "next/image";
import type { Partner } from "@/content/types";

interface LogoTileProps {
  partner: Partner;
}

/** White bordered logo tile, uniform 3:2, logo padded and object-contained.
 *  The grid parent controls the tile's rendered size. */
export function LogoTile({ partner }: LogoTileProps) {
  return (
    <div className="relative aspect-[3/2] rounded-md border border-line bg-white p-[16%]">
      <div className="relative h-full w-full">
        <Image
          src={partner.image}
          alt={partner.name}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 40vw, 180px"
        />
      </div>
    </div>
  );
}
