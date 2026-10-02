/**
 * The store atlas's projection (change round 4): equirectangular with its
 * standard parallel at 26°N, the latitude of the Brahmaputra valley, so
 * distances there read true. Pure and import-free: the map builder
 * (scripts/build-atlas-map.mjs) imports this same file, so the relief image,
 * the drawn borders and rivers, and the store pins can never disagree.
 *
 * The frame keeps the stage's 45:25 shape: all of Sikkim and Arunachal
 * Pradesh, the Brahmaputra valley and the store towns, with the southern
 * states running off the bottom edge.
 */

/** West and east edges, degrees east. */
export const LON0 = 87.95;
export const LON1 = 97.55;
/** North edge, degrees north. The south edge follows from the frame shape. */
export const LAT1 = 29.5;

/** The map's coordinate space: SVG user units, and the relief image's pixels. */
export const MAP_W = 1800;
export const MAP_H = 1000;

const K = Math.cos((26 * Math.PI) / 180);
/** South edge: the latitude span that keeps 1° of latitude and 1° of
 *  longitude (at 26°N) the same length on the page. */
export const LAT0 = LAT1 - ((LON1 - LON0) * K * MAP_H) / MAP_W;

export const MAP_VIEWBOX = `0 0 ${MAP_W} ${MAP_H}`;

/** Longitude and latitude to map units. */
export function project(lon: number, lat: number): [number, number] {
  return [((lon - LON0) / (LON1 - LON0)) * MAP_W, ((LAT1 - lat) / (LAT1 - LAT0)) * MAP_H];
}
