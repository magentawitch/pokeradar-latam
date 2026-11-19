import { LngLat, type TransformConstrainFunction } from "maplibre-gl";
import { TILE_SIZE, toLat, toLng, toX, toY } from "./mercator";

/**
 * The initial fit, centred on South America and a little closer than the
 * full pan width, so desktop can pan sideways. The box itself stops short of
 * Easter Island and the Bermuda Triangle, but desktop's height-limited fit
 * still shows every destination; phones open at MIN_ZOOM either way. The
 * south edge sits well below Cueva de las Manos so its stamp clears the hint
 * bar.
 */
export const INITIAL_BOUNDS: [[number, number], [number, number]] = [
  [-100, -50],
  [-32, 22],
];

/** Keeps the opening stamps clear of the HUD: title on top, hint bar and compass below. */
export const INITIAL_PADDING = { top: 72, bottom: 56, left: 32, right: 32 };

/** Mexico to Tierra del Fuego: the pan limits (only the latitudes are used). */
export const LATIN_AMERICA_BOUNDS: [[number, number], [number, number]] = [
  [-118, -56],
  [-34, 33],
];

export const MIN_ZOOM = 2;
const MAX_ZOOM = 22;

export const VIEW_LNG_LIMIT: [number, number] = [-170, 20];
export const PAN_SLACK_Y = 0.35;

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
    const y = clampAxis(
      toY(lngLat.lat),
      minY,
      maxY,
      viewH / 2,
      viewH * PAN_SLACK_Y,
    );

    return { center: new LngLat(toLng(x), toLat(y)), zoom };
  };
}
