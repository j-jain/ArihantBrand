import Image from "next/image";
import type { Store } from "@/content/types";
import { StaggerGroup } from "@/components";

/** A three-up row of real store photographs — the proof that the managed
 *  model already trades. Only stores that carry an image are shown; captions
 *  double as descriptive alt text in the brand voice. The figures reveal in a
 *  staggered sequence as the strip scrolls into view. */
export function ProofStrip({ stores }: { stores: Store[] }) {
  const shots = stores.filter((store) => store.image);
  if (shots.length === 0) return null;

  return (
    <StaggerGroup
      from="up"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
              sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
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
