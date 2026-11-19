// Camera targets for revealing a location. No MapLibre runtime import, so
// this can run in server-rendered client components and in plain unit tests.
import type { BiomeConfig, LngLat } from "@/lib/biomes/types";
import {
  pixelOffset,
  TILE_SIZE,
  toLat,
  toLng,
  toX,
  toY,
  zoomForSpan,
} from "./mercator";

/** Camera flight to a location. Reduced motion jumps instead. */
export const FLY_DURATION_MS = 1600;

/** Screen space kept clear around a location's scatter when fitting it (per side). */
const REVEAL_FIT_MARGIN_PX = 40;

/**
 * How far below a location's reveal zoom a manual zoom still reveals it.
 * Flights land exactly on the reveal zoom, so this only affects manual zooming.
 */
export const REVEAL_ZOOM_TOLERANCE = 1;

export type Viewport = { width: number; height: number };

/** Screen space covered by UI on each side (the detail panel), in px. */
export type CameraPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const NO_PADDING: CameraPadding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/** The part of the viewport the padding leaves uncovered. */
export const clearViewport = (viewport: Viewport, padding: CameraPadding) => ({
  width: Math.max(viewport.width - padding.left - padding.right, 1),
  height: Math.max(viewport.height - padding.top - padding.bottom, 1),
});

/**
 * The map centre that puts `target` in the middle of the uncovered area.
 * Computed here instead of MapLibre's `padding` option, which persists on the
 * map after the move (shifting every later getCenter) and which `jumpTo`
 * drops under reduced motion.
 */
export function paddedCenter(
  target: LngLat,
  zoom: number,
  padding: CameraPadding,
): [lng: number, lat: number] {
  const worldPx = TILE_SIZE * 2 ** zoom;
  const x = toX(target[0]) + (padding.right - padding.left) / 2 / worldPx;
  const y = toY(target[1]) + (padding.bottom - padding.top) / 2 / worldPx;
  return [toLng(x), toLat(y)];
}

/** Whether a screen point sits in the uncovered area, at least `marginPx` inside it. */
export function isInClearArea(
  point: { x: number; y: number },
  viewport: Viewport,
  padding: CameraPadding,
  marginPx: number,
) {
  return (
    point.x >= padding.left + marginPx &&
    point.x <= viewport.width - padding.right - marginPx &&
    point.y >= padding.top + marginPx &&
    point.y <= viewport.height - padding.bottom - marginPx
  );
}

type RevealTarget = Pick<BiomeConfig, "center" | "spreadKm" | "revealZoom">;

/**
 * The configured reveal zoom, lowered when needed so the whole scatter fits
 * the viewport's short side (a phone can't show Amazonía at zoom 5.5).
 */
export function revealZoomFor(biome: RevealTarget, viewport: Viewport) {
  const usablePx = Math.max(
    Math.min(viewport.width, viewport.height) - 2 * REVEAL_FIT_MARGIN_PX,
    1,
  );
  const fitZoom = zoomForSpan(
    biome.spreadKm * 2 * 1000,
    biome.center[1],
    usablePx,
  );
  return Math.min(biome.revealZoom, fitZoom);
}

/**
 * Where the camera lands to reveal a location: the whole scatter fits, and is
 * centred in, the part of the screen the padding (an open panel) leaves clear.
 */
export function biomeCamera(
  biome: RevealTarget,
  viewport: Viewport,
  padding: CameraPadding = NO_PADDING,
) {
  const zoom = revealZoomFor(biome, clearViewport(viewport, padding));
  return { center: paddedCenter(biome.center, zoom, padding), zoom };
}

interface CameraView {
  center: LngLat;
  zoom: number;
  viewport: Viewport;
}

/**
 * The location a camera view reveals: the one whose centre is nearest the
 * screen centre (of those on screen), once its reveal zoom (minus the
 * tolerance) is reached. Aim wins: while that nearest location still needs a
 * closer zoom, nothing is revealed, even if a wider location farther from the
 * centre already qualifies (no Pampa Pokémon while zooming into Buenos Aires).
 * Null at continental zoom.
 */
export function findRevealedBiome<Biome extends BiomeConfig>(
  view: CameraView,
  biomes: readonly Biome[],
): Biome | null {
  let nearest: Biome | null = null;
  let nearestDistance = Infinity;

  for (const biome of biomes) {
    const offset = pixelOffset(view.center, biome.center, view.zoom);
    const onScreen =
      Math.abs(offset.x) <= view.viewport.width / 2 &&
      Math.abs(offset.y) <= view.viewport.height / 2;
    if (!onScreen) continue;

    const distance = Math.hypot(offset.x, offset.y);
    if (distance < nearestDistance) {
      nearest = biome;
      nearestDistance = distance;
    }
  }

  if (!nearest) return null;
  const threshold =
    revealZoomFor(nearest, view.viewport) - REVEAL_ZOOM_TOLERANCE;
  return view.zoom >= threshold ? nearest : null;
}
