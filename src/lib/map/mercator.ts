// Web Mercator helpers, with no MapLibre runtime import so pure modules and
// tests can use them. World units: x and y both run 0..1, y grows southward.

/** MapLibre's tile size: at zoom z the world is TILE_SIZE · 2^z pixels wide. */
export const TILE_SIZE = 512;

const EARTH_RADIUS_KM = 6371.0088;
const EARTH_CIRCUMFERENCE_M = 2 * Math.PI * 6_378_137;
export const KM_PER_DEGREE_LAT = (Math.PI * EARTH_RADIUS_KM) / 180;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const toX = (lng: number) => (lng + 180) / 360;
export const toY = (lat: number) => {
  const phi = toRadians(lat);
  return (1 - Math.log(Math.tan(Math.PI / 4 + phi / 2)) / Math.PI) / 2;
};
export const toLng = (x: number) => x * 360 - 180;
export const toLat = (y: number) =>
  (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;

/** Ground metres covered by one screen pixel at this latitude and zoom. */
export const metersPerPixel = (lat: number, zoom: number) =>
  (EARTH_CIRCUMFERENCE_M * Math.cos(toRadians(lat))) / (TILE_SIZE * 2 ** zoom);

/** Zoom at which `meters` of ground at this latitude spans `pixels` on screen. */
export const zoomForSpan = (meters: number, lat: number, pixels: number) =>
  Math.log2(
    (EARTH_CIRCUMFERENCE_M * Math.cos(toRadians(lat)) * pixels) /
      (TILE_SIZE * meters),
  );

/** Screen-pixel offset of `to` from `from` at this zoom (x east, y south). */
export const pixelOffset = (
  from: readonly [lng: number, lat: number],
  to: readonly [lng: number, lat: number],
  zoom: number,
) => {
  const worldPx = TILE_SIZE * 2 ** zoom;
  return {
    x: (toX(to[0]) - toX(from[0])) * worldPx,
    y: (toY(to[1]) - toY(from[1])) * worldPx,
  };
};

/** Local flat-earth offset in km (x east, y north); fine at biome scale. */
export const kmOffset = (
  from: readonly [lng: number, lat: number],
  to: readonly [lng: number, lat: number],
) => ({
  x: (to[0] - from[0]) * KM_PER_DEGREE_LAT * Math.cos(toRadians(from[1])),
  y: (to[1] - from[1]) * KM_PER_DEGREE_LAT,
});

/** Moves `origin` by a local offset in km (x east, y north). */
export const offsetByKm = (
  origin: readonly [lng: number, lat: number],
  xKm: number,
  yKm: number,
): [lng: number, lat: number] => [
  origin[0] + xKm / (KM_PER_DEGREE_LAT * Math.cos(toRadians(origin[1]))),
  origin[1] + yKm / KM_PER_DEGREE_LAT,
];
