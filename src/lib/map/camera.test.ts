import { LngLat } from "maplibre-gl";
import { describe, expect, it } from "vitest";
import { BIOMES } from "@/lib/biomes/biomes";
import {
  createLatAmConstrain,
  INITIAL_BOUNDS,
  INITIAL_PADDING,
  MIN_ZOOM,
  VIEW_LNG_LIMIT,
} from "./camera";
import { TILE_SIZE, toX, toY } from "./mercator";

const desktop = createLatAmConstrain(() => ({ width: 1440, height: 900 }));

describe("createLatAmConstrain", () => {
  it("leaves a center inside Latin America alone", () => {
    const { center } = desktop(new LngLat(-60, -15), 5);
    expect(center.lng).toBeCloseTo(-60);
    expect(center.lat).toBeCloseTo(-15);
  });

  it("keeps the screen's edges between the mid-Pacific and West Africa", () => {
    const zoom = 4;
    const halfLng = (1440 / (512 * 2 ** zoom)) * 180;
    const east = desktop(new LngLat(10, -15), zoom).center.lng + halfLng;
    const west = desktop(new LngLat(-170, -15), zoom).center.lng - halfLng;
    expect(east).toBeCloseTo(20);
    expect(west).toBeCloseTo(-170);
  });

  it("won't zoom out past the point where the screen is wider than the limit", () => {
    const { zoom } = desktop(new LngLat(-75, -15), MIN_ZOOM);
    const shownLng = (1440 / (512 * 2 ** zoom)) * 360;
    expect(shownLng).toBeCloseTo(190);
  });

  it("stops the camera from leaving the region", () => {
    const { center } = desktop(new LngLat(100, 70), 5);
    expect(center.lng + (1440 / (512 * 2 ** 5)) * 180).toBeLessThanOrEqual(
      20.01,
    );
    expect(center.lat).toBeLessThan(50);
  });

  it("clamps zoom to the minimum on a phone", () => {
    const phone = createLatAmConstrain(() => ({ width: 375, height: 812 }));
    expect(phone(new LngLat(-76, -11), 0).zoom).toBe(MIN_ZOOM);
  });
});

describe("INITIAL_BOUNDS", () => {
  // The desktop opening view, as MapLibre fits INITIAL_BOUNDS with
  // INITIAL_PADDING: it's height-limited, so it shows more longitude than the
  // box itself (Easter Island included).
  const DESKTOP = { width: 1440, height: 900 };
  const STAMP_RADIUS_PX = 18;
  // The hint bar's top edge, up from the bottom (bottom-9 + its height).
  const HINT_BAR_PX = 62;
  const [[west, south], [east, north]] = INITIAL_BOUNDS;
  const { top, bottom, left, right } = INITIAL_PADDING;
  const zoom = Math.log2(
    Math.min(
      (DESKTOP.width - left - right) / (TILE_SIZE * (toX(east) - toX(west))),
      (DESKTOP.height - top - bottom) / (TILE_SIZE * (toY(south) - toY(north))),
    ),
  );
  const worldPx = TILE_SIZE * 2 ** zoom;
  const centerX = (toX(west) + toX(east)) / 2 + (right - left) / 2 / worldPx;
  const centerY = (toY(north) + toY(south)) / 2 + (bottom - top) / 2 / worldPx;
  const screenPoint = ([lng, lat]: readonly [number, number]) => ({
    x: DESKTOP.width / 2 + (toX(lng) - centerX) * worldPx,
    y: DESKTOP.height / 2 + (toY(lat) - centerY) * worldPx,
  });

  it("shows every destination's whole stamp on desktop, clear of the HUD", () => {
    // Header pills (top corners) and the hint bar (bottom centre), in px.
    const hud = [
      { left: 24, top: 24, right: 124, bottom: 64 },
      { left: 1256, top: 24, right: 1416, bottom: 64 },
      { left: 470, top: 836, right: 970, bottom: 864 },
    ];
    for (const { id, center } of BIOMES) {
      const { x, y } = screenPoint(center);
      const stamp = {
        left: x - STAMP_RADIUS_PX,
        top: y - STAMP_RADIUS_PX,
        right: x + STAMP_RADIUS_PX,
        bottom: y + STAMP_RADIUS_PX,
      };
      expect(stamp.left, id).toBeGreaterThan(0);
      expect(stamp.top, id).toBeGreaterThan(0);
      expect(stamp.right, id).toBeLessThan(DESKTOP.width);
      expect(stamp.bottom, id).toBeLessThan(DESKTOP.height - HINT_BAR_PX);
      for (const box of hud) {
        const overlaps =
          stamp.left < box.right &&
          stamp.right > box.left &&
          stamp.top < box.bottom &&
          stamp.bottom > box.top;
        expect(overlaps, `${id} under the HUD`).toBe(false);
      }
    }
  });

  it("opens closer than the full pan width, so desktop can pan both ways", () => {
    const halfWidth = DESKTOP.width / 2 / worldPx;
    const roomWestPx = (centerX - halfWidth - toX(VIEW_LNG_LIMIT[0])) * worldPx;
    const roomEastPx =
      (toX(VIEW_LNG_LIMIT[1]) - (centerX + halfWidth)) * worldPx;
    expect(roomWestPx).toBeGreaterThan(100);
    expect(roomEastPx).toBeGreaterThan(100);
  });

  it("centres the opening view on South America", () => {
    // South America spans roughly 82°W to 34°W.
    expect((west + east) / 2).toBeGreaterThan(-70);
    expect((west + east) / 2).toBeLessThan(-58);
  });
});
