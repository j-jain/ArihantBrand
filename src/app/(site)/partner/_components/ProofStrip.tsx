import Image from "next/image";
import type { Store } from "@/content/types";
import type { PhotoSlot } from "@/content/images";
import { StaggerGroup } from "@/components";

/** A row of real store photographs — the proof that the managed model
 *  already trades. Only stores that carry an image are shown (four of the
 *  five since change round 11: Guwahati, Goalpara, Kohima and Tura; the
 *  Itanagar store has none), four up from 768px; captions double as
 *  descriptive alt text in the brand voice. The figures reveal in a
 *  staggered sequence as the strip scrolls into view.
 *
 *  Should no store record carry a photograph, the strip shows `fallback`
 *  (the partner page passes photoSlots.retailInterior) in the first place
 *  instead, uncaptioned, at the photo's own ratio under a 15.5rem cap. */
export function ProofStrip({
  stores,
  fallback,
}: {
  stores: Store[];
  fallback?: PhotoSlot;
}) {
  const shots = stores.filter((store) => store.image);

  if (shots.length === 0) {
    if (!fallback?.src) return null;
    return (
      <StaggerGroup from="up" className="grid gap-6 md:grid-cols-3" stagger={0.12}>
        <div
          className="proof-storefront relative w-full max-w-[15.5rem] overflow-hidden border border-line"
          style={{ aspectRatio: fallback.ratio, borderRadius: "6px" }}
        >
          <Image
            src={fallback.src}
            alt={fallback.alt}
            fill
            sizes="(max-width: 767px) 100vw, 15.5rem"
            className="object-cover"
          />
        </div>
      </StaggerGroup>
    );
  }

  return (
    <StaggerGroup
      from="up"
      className="m-rail grid gap-6 sm:grid-cols-2 md:grid-cols-4"
      stagger={0.12}
    >
      {shots.map((store) => (
        <figure key={`${store.name}-${store.city}`} className="flex flex-col gap-3">
          <div
            className="relative aspect-[3/2] w-full overflow-hidden border border-line"
            style={{ borderRadius: "6px" }}
          >
            <Image
              src={store.image as string}
              alt={
                store.caption
                  ? `${store.name}, ${store.city}: ${store.caption.charAt(0).toLowerCase()}${store.caption.slice(1)}.`
                  : `${store.name}, an Arihant Retail store in ${store.city}.`
              }
              fill
              sizes="(min-width: 768px) 17rem, (min-width: 640px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          {/* The store and its town (change round 11): the record's caption
              says what the picture shows and goes into the alt text above. */}
          <figcaption className="t-small text-ink-soft">
            {store.name}, {store.city}
          </figcaption>
        </figure>
      ))}
    </StaggerGroup>
  );
}
