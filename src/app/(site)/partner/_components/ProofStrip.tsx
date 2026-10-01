import Image from "next/image";
import type { Store } from "@/content/types";
import type { PhotoSlot } from "@/content/images";
import { StaggerGroup } from "@/components";

/** A three-up row of real store photographs — the proof that the managed
 *  model already trades. Only stores that carry an image are shown; captions
 *  double as descriptive alt text in the brand voice. The figures reveal in a
 *  staggered sequence as the strip scrolls into view.
 *
 *  While no store record carries a photograph of its own, the strip shows
 *  `fallback` (photoSlots.retailStorefront) in the first place instead,
 *  UNCAPTIONED: it is a real Arihant Retail storefront, but which town it
 *  shows is unconfirmed, so nothing beside it may name one (change round 3).
 *  It keeps the photo's own ratio and the 15.5rem cap for sub-500px photos. */
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
      className="m-rail grid gap-6 sm:grid-cols-2 md:grid-cols-3"
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
              alt={store.caption ?? `${store.name}, an Arihant Retail store in ${store.city}.`}
              fill
              sizes="(min-width: 768px) 22rem, (min-width: 640px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          {store.caption ? (
            <figcaption className="t-small text-ink-soft">{store.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </StaggerGroup>
  );
}
