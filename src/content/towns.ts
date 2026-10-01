/**
 * Towns on the Arihant Retail store atlas (change round 3).
 *
 * City-level centroids only. Only Guwahati's address is confirmed (it is the
 * one store with a `mapsQuery`); every other row here is the town, never the
 * shop. This is geography that is never printed: no coordinate, distance or
 * cell appears on the page, and none of it is a business figure, which is why
 * it lives here and not in facts.ts.
 *
 * A store gets a pin when `townKey(store.city)` matches a row. A store in a
 * town not listed here still gets its list entry, just no pin (with a dev
 * warning), so adding a town is one line in this table.
 *
 * Per row:
 *  - `lon`, `lat`: the town centroid, snapped to a grid cell by `cellOf`.
 *  - `tag`: where the swing tag hangs, as the offset in cells from the pin
 *    centre to the tag's eyelet. Placed by hand and checked for collisions at
 *    768px and wider (see the retail spec, section 3.2).
 *  - `phoneSide`: which side of the pin the phone chip sits.
 */

export interface Town {
  lon: number;
  lat: number;
  tag: { dx: number; dy: number };
  phoneSide: "above" | "below";
}

/** The town the routes stitch out from: the group's home and warehouse. */
export const RETAIL_HUB = "guwahati";

/** Normalise a store's city to a TOWNS key. */
export function townKey(city: string): string {
  return city.trim().toLowerCase();
}

export const TOWNS: Readonly<Record<string, Town>> = {
  guwahati: { lon: 91.75, lat: 26.14, tag: { dx: 1.5, dy: 1.9 }, phoneSide: "below" },
  goalpara: { lon: 90.62, lat: 26.17, tag: { dx: -3.2, dy: 1.8 }, phoneSide: "above" },
  kohima: { lon: 94.11, lat: 25.67, tag: { dx: 0, dy: 2.1 }, phoneSide: "below" },
  itanagar: { lon: 93.61, lat: 27.08, tag: { dx: 2.8, dy: 1.7 }, phoneSide: "below" },
};
