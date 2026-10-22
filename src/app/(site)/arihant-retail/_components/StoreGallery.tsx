import Image from "next/image";
import type { StorePhoto } from "@/content/types";

interface StoreGalleryProps {
  photos: StorePhoto[];
}

/**
 * "Inside the stores" (change round 11): the client's photographs of the
 * floors, on a four-column grid of 3:2 tiles with the portrait files two
 * rows tall (`tall`, placed densely so the grid closes without holes), each
 * tile captioned with its store and town in the feature heroes' chip idiom.
 * The enclosing SectionReveal staggers the tiles in (`data-sr="rows"`).
 * Phones get a snap rail of 4:3 tiles (mobile.css section 18). Styles:
 * atlas.css (page-local, with the rest of the retail page).
 */
export function StoreGallery({ photos }: StoreGalleryProps) {
  return (
    <ul className="store-gallery m-rail" data-sr="rows">
      {photos.map((photo) => (
        <li
          key={photo.src}
          className={photo.tall ? "store-gallery__tile store-gallery__tile--tall" : "store-gallery__tile"}
        >
          <figure className="store-gallery__fig">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 767px) 78vw, 17rem"
              className="store-gallery__img"
            />
            <figcaption className="store-gallery__cap">{photo.caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
