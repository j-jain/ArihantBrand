import Image from "next/image";
import type { Store } from "@/content/types";

interface StoreCardProps {
  store: Store;
}

/** A single store: a real photo with caption, or — for a store still in
 *  fit-out — an honest dashed placeholder that states the format instead of
 *  faking a photo. */
export function StoreCard({ store }: StoreCardProps) {
  const isFitout = store.status === "Fit-out";
  const hasPhoto = Boolean(store.image) && !isFitout;

  return (
    <figure className="flex flex-col gap-3">
      {hasPhoto ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line">
          <Image
            src={store.image as string}
            alt={store.caption ?? `${store.name} — Arihant Retail store, ${store.city}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 380px"
          />
          <span className="t-label absolute left-3 top-3 rounded-full border border-line bg-paper px-3 py-1 text-ink">
            {store.status}
          </span>
        </div>
      ) : (
        <div className="relative flex aspect-[4/3] flex-col justify-between rounded-md border border-dashed border-line-dark bg-charcoal-raise p-5">
          <span className="t-label self-start rounded-full border border-dashed border-line-dark px-3 py-1 text-on-charcoal-soft">
            {store.status}
          </span>
          <p className="t-h4 text-on-charcoal">{store.format} store</p>
        </div>
      )}

      <figcaption className="flex flex-col gap-1">
        <span className="t-h4 text-ink">{store.name}</span>
        <span className="t-small text-ink-soft">
          {store.city} · {store.format}
        </span>
        {store.caption ? (
          <span className="t-small measure text-ink-soft">{store.caption}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
