import Image from "next/image";
import type { Store } from "@/content/types";

interface StoreCardProps {
  store: Store;
}

function directionsUrl(query: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

/**
 * One store: name, town, format, a photograph where one exists, and a
 * directions link where the address is confirmed.
 *
 * The visual state keys off `status`, not off whether a photograph happens to
 * exist (change brief, AR3). Previously any store without a photo rendered the
 * dark dashed "not built yet" tile, so a trading store with no photograph
 * looked shut; and two fit-out entries rendered byte-identical, which read as a
 * duplicate rather than two doors.
 *
 *  - Trading, photographed  -> the photograph.
 *  - Trading, not yet shot  -> a light plate carrying the town, which is the
 *                             thing a shopper is actually scanning for.
 *  - In fit-out             -> the dark dashed plate, which now means exactly
 *                             one thing: this door is not open yet.
 */
export function StoreCard({ store }: StoreCardProps) {
  const isFitout = store.status === "Fit-out";
  const hasPhoto = Boolean(store.image) && !isFitout;

  return (
    <figure className="store-card flex flex-col gap-3">
      {hasPhoto ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line">
          <Image
            src={store.image as string}
            alt={store.caption ?? `${store.name}, an Arihant Retail store in ${store.city}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 380px"
          />
          <span className="t-label absolute left-3 top-3 rounded-full border border-line bg-paper px-3 py-1 text-ink">
            {store.status}
          </span>
        </div>
      ) : isFitout ? (
        <div className="relative flex aspect-[4/3] flex-col justify-between rounded-md border border-dashed border-line-dark bg-charcoal-raise p-5">
          <span className="t-label self-start rounded-full border border-dashed border-line-dark px-3 py-1 text-on-charcoal-soft">
            {store.status}
          </span>
          <p className="t-h4 text-on-charcoal">Opening in {store.city}</p>
        </div>
      ) : (
        <div className="store-card__plate relative flex aspect-[4/3] flex-col justify-between rounded-md border border-line bg-paper-shade p-5">
          <span className="t-label self-start rounded-full border border-line bg-paper px-3 py-1 text-ink">
            {store.status}
          </span>
          <p className="store-card__town font-display text-ink">{store.city}</p>
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
        {store.mapsQuery ? (
          <a
            className="store-card__directions t-small mt-1 inline-flex w-fit items-center gap-1.5 font-semibold text-vermillion-deep underline-offset-4 hover:underline"
            href={directionsUrl(store.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}
