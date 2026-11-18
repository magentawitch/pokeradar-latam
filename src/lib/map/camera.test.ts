import { LngLat } from "maplibre-gl";
import { describe, expect, it } from "vitest";
import { createLatAmConstrain, MIN_ZOOM } from "./camera";

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
    expect(center.lng + (1440 / (512 * 2 ** 5)) * 180).toBeLessThanOrEqual(20.01);
    expect(center.lat).toBeLessThan(50);
  });

  it("clamps zoom to the minimum on a phone", () => {
    const phone = createLatAmConstrain(() => ({ width: 375, height: 812 }));
    expect(phone(new LngLat(-76, -11), 0).zoom).toBe(MIN_ZOOM);
  });
});
