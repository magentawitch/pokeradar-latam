import { LngLat, type TransformConstrainFunction } from "maplibre-gl";

/**
 * The initial fit: South America, from the Llanos down to Patagonia (with room
 * below for its label, which hangs under the pin). Opens closer in than the
 * full region; Mexico City and the Caribbean are a short pan north.
 */
export const INITIAL_BOUNDS: [[number, number], [number, number]] = [
  [-82, -50],
  [-35, 8],
];

/** Mexico to Tierra del Fuego, Galápagos to the Brazilian coast: the pan limits. */
export const LATIN_AMERICA_BOUNDS: [[number, number], [number, number]] = [
  [-118, -56],
  [-34, 33],
];


export const MIN_ZOOM = 2;
const MAX_ZOOM = 22;

export const VIEW_LNG_LIMIT: [number, number] = [-170, 20];
export const PAN_SLACK_Y = 0.35;

const TILE_SIZE = 512;

// Web Mercator in world units: x and y both run 0..1, y grows southward.
const toX = (lng: number) => (lng + 180) / 360;
const toY = (lat: number) => {
  const phi = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(Math.PI / 4 + phi / 2)) / Math.PI) / 2;
};
const toLng = (x: number) => x * 360 - 180;
const toLat = (y: number) =>
  (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;

/**
 * Keeps the center where the viewport's edges can reach [min, max], plus
 * slack. When the range is smaller than the viewport (zoomed out on a wide
 * screen) it stays centered with the same slack either way, instead of
 * MapLibre's maxBounds behavior of zooming in until it fills.
 */
function clampAxis(
  center: number,
  min: number,
  max: number,
  halfView: number,
  slack: number,
) {
  const mid = (min + max) / 2;
  const lo = Math.min(min + halfView, mid) - slack;
  const hi = Math.max(max - halfView, mid) + slack;
  return Math.min(Math.max(center, lo), hi);
}

export function createLatAmConstrain(
  getViewport: () => { width: number; height: number },
): TransformConstrainFunction {
  const [[, south], [, north]] = LATIN_AMERICA_BOUNDS;
  const minX = toX(VIEW_LNG_LIMIT[0]);
  const maxX = toX(VIEW_LNG_LIMIT[1]);
  const minY = toY(north);
  const maxY = toY(south);

  return (lngLat, rawZoom) => {
    const { width, height } = getViewport();
    // Never zoom out far enough for the screen to be wider than VIEW_LNG_LIMIT.
    const fitLimitZoom = Math.log2(width / (TILE_SIZE * (maxX - minX)));
    const zoom = Math.min(
      Math.max(rawZoom ?? MIN_ZOOM, MIN_ZOOM, fitLimitZoom),
      MAX_ZOOM,
    );
    const worldPx = TILE_SIZE * 2 ** zoom;
    const viewW = width / worldPx;
    const viewH = height / worldPx;

    const x = clampAxis(toX(lngLat.wrap().lng), minX, maxX, viewW / 2, 0);
    const y = clampAxis(toY(lngLat.lat), minY, maxY, viewH / 2, viewH * PAN_SLACK_Y);

    return { center: new LngLat(toLng(x), toLat(y)), zoom };
  };
}
