"use client";

import { useCallback, useId, useState } from "react";
import Image from "next/image";
import type { RecognitionPhoto } from "@/content/types";
import { Modal } from "./Modal";
import { cn } from "./cn";

interface TrophyShelfProps {
  photos: RecognitionPhoto[];
  /** Accessible name for the shelf as a group. */
  label: string;
  /** `cabinet` (default): every object on ruled shelves, captioned, each one
   *  a button that opens it large. `hero`: a few objects on one shelf inside
   *  the Recognition hero's plate, no captions, no buttons. */
  variant?: "cabinet" | "hero";
  className?: string;
}

/**
 * The trophy cabinet (change round 11). Every award is a photograph cut out
 * of its background (scripts/cutout-awards.py), so the objects stand on a
 * drawn shelf line the way they would on a real one: set by height, their
 * own shape casting the shadow, a certificate wide and a trophy tall. It
 * replaced the fan of snapshot cards: a snapshot of a trophy on an office
 * table in a 4:5 plate read as a phone album, not a cabinet.
 *
 * Motion is the enclosing SectionReveal's (`data-sr="rows"` staggers the
 * objects in as the band arrives); hover lifts an object on the soft spring
 * in CSS; nothing here needs GSAP. Styles: motion.css (desktop), mobile.css
 * section 16 (phones: a snap rail of plates). Reduced motion gets the shelf
 * as served.
 *
 * Click opens the object large in the shared Modal, the caption as its
 * title and the alt text (what the award actually says) as its description.
 */
export function TrophyShelf({ photos, label, variant = "cabinet", className }: TrophyShelfProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const titleId = useId();
  const descId = useId();
  const close = useCallback(() => setOpenIndex(null), []);
  const open = openIndex === null ? null : photos[openIndex];

  if (variant === "hero") {
    return (
      <ul className={cn("shelf shelf--hero", className)} aria-label={label}>
        {photos.map((photo) => (
          <li key={photo.src} className="shelf__item">
            <span className="shelf__obj">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                priority
                sizes="(max-width: 767px) 30vw, 12rem"
                className="shelf__img"
              />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <ul className={cn("shelf m-rail", className)} data-sr="rows" aria-label={label}>
        {photos.map((photo, index) => (
          <li key={photo.src} className="shelf__item">
            <figure className="shelf__fig">
              <button
                type="button"
                className="shelf__obj"
                onClick={() => setOpenIndex(index)}
                aria-haspopup="dialog"
                aria-label={`Enlarge: ${photo.caption}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 767px) 56vw, 14rem"
                  className="shelf__img"
                />
              </button>
              <figcaption className="shelf__cap">{photo.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <Modal
        open={open !== null}
        onClose={close}
        labelledBy={titleId}
        describedBy={descId}
        className="shelf-modal"
      >
        {open ? (
          <figure className="shelf-modal__fig">
            <span className="shelf-modal__plate">
              {/* Mounted only while the dialog is open, so it may load at
                  once rather than wait on an intersection the top layer
                  does not always report. */}
              <Image
                src={open.src}
                alt={open.alt}
                width={open.width}
                height={open.height}
                sizes="(max-width: 767px) 92vw, 46rem"
                loading="eager"
                className="shelf-modal__img"
              />
            </span>
            <figcaption className="shelf-modal__cap">
              <h2 id={titleId} className="t-h3 text-ink">
                {open.caption}
              </h2>
              <p id={descId} className="t-small measure text-ink-soft">
                {open.alt}
              </p>
            </figcaption>
          </figure>
        ) : null}
      </Modal>
    </>
  );
}
