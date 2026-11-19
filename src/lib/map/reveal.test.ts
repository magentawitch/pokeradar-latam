import { describe, expect, it } from "vitest";
import { BIOMES } from "@/lib/biomes/biomes";
import type { BiomeConfig } from "@/lib/biomes/types";
import { metersPerPixel, pixelOffset } from "./mercator";
import {
  biomeCamera,
  findRevealedBiome,
  isInClearArea,
  NO_PADDING,
  paddedCenter,
  REVEAL_ZOOM_TOLERANCE,
  revealZoomFor,
} from "./reveal";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 375, height: 812 };

const biomeById = (id: string) => {
  const biome = BIOMES.find((candidate) => candidate.id === id);
  if (!biome) throw new Error(`missing biome config: ${id}`);
  return biome;
};

describe("revealZoomFor", () => {
  it("uses the configured zoom when the scatter already fits", () => {
    const cdmx = biomeById("cdmx");
    expect(revealZoomFor(cdmx, DESKTOP)).toBe(cdmx.revealZoom);
  });

  it("zooms out on a phone so a wide location fits the screen", () => {
    const amazonia = biomeById("amazonia");
    expect(revealZoomFor(amazonia, PHONE)).toBeLessThan(amazonia.revealZoom);
    // At that zoom the scatter's diameter fits the phone's width.
    const zoom = revealZoomFor(amazonia, PHONE);
    const diameterPx =
      (amazonia.spreadKm * 2000) / metersPerPixel(amazonia.center[1], zoom);
    expect(diameterPx).toBeLessThan(PHONE.width);
  });
});

describe("findRevealedBiome", () => {
  it("reveals nothing at continental zoom", () => {
    expect(
      findRevealedBiome(
        { center: [-60, -20], zoom: 3, viewport: DESKTOP },
        BIOMES,
      ),
    ).toBeNull();
  });

  it("reveals the location a flight lands on, on desktop and phone", () => {
    for (const biome of BIOMES) {
      for (const viewport of [DESKTOP, PHONE]) {
        const { center, zoom } = biomeCamera(biome, viewport);
        expect(
          findRevealedBiome({ center, zoom, viewport }, BIOMES)?.id,
          `${biome.id} at ${viewport.width}px`,
        ).toBe(biome.id);
      }
    }
  });

  it("reveals within the zoom tolerance, and hides just below it", () => {
    const iguazu = biomeById("iguazu");
    const threshold = revealZoomFor(iguazu, DESKTOP) - REVEAL_ZOOM_TOLERANCE;
    const view = { center: iguazu.center, viewport: DESKTOP };
    expect(findRevealedBiome({ ...view, zoom: threshold }, BIOMES)?.id).toBe(
      "iguazu",
    );
    expect(
      findRevealedBiome({ ...view, zoom: threshold - 0.01 }, BIOMES),
    ).toBeNull();
  });

  it("picks the location nearest the screen centre when two qualify", () => {
    const pampas = biomeById("pampas");
    const west: BiomeConfig = { ...pampas, id: "pampas", center: [-63, -36.5] };
    const east: BiomeConfig = { ...pampas, id: "llanos", center: [-62, -36.5] };
    const view = { zoom: pampas.revealZoom, viewport: DESKTOP };
    expect(
      findRevealedBiome({ ...view, center: [-62.6, -36.5] }, [west, east])?.id,
    ).toBe("pampas");
    expect(
      findRevealedBiome({ ...view, center: [-62.4, -36.5] }, [west, east])?.id,
    ).toBe("llanos");
  });

  it("reveals nothing while the location nearest the centre needs a closer zoom", () => {
    const pampas = biomeById("pampas");
    const buenosAires = biomeById("buenos-aires");
    // Aimed nearer Buenos Aires, at the zoom where the Pampa just qualifies.
    const center: [number, number] = [-59.9, -35.3];
    const zoom = revealZoomFor(pampas, DESKTOP) - REVEAL_ZOOM_TOLERANCE;
    expect(
      findRevealedBiome(
        { center: pampas.center, zoom, viewport: DESKTOP },
        BIOMES,
      )?.id,
    ).toBe("pampas");
    const offsetTo = (target: BiomeConfig) =>
      pixelOffset(center, target.center, zoom);
    const pampasOffset = offsetTo(pampas);
    const cityOffset = offsetTo(buenosAires);
    // Both centres are on screen, the city's nearer the middle.
    expect(Math.abs(pampasOffset.x)).toBeLessThan(DESKTOP.width / 2);
    expect(Math.abs(pampasOffset.y)).toBeLessThan(DESKTOP.height / 2);
    expect(Math.hypot(cityOffset.x, cityOffset.y)).toBeLessThan(
      Math.hypot(pampasOffset.x, pampasOffset.y),
    );
    expect(
      findRevealedBiome({ center, zoom, viewport: DESKTOP }, BIOMES),
    ).toBeNull();
    // Zooming in on the city reveals it.
    expect(
      findRevealedBiome(
        {
          center: buenosAires.center,
          zoom: buenosAires.revealZoom,
          viewport: DESKTOP,
        },
        BIOMES,
      )?.id,
    ).toBe("buenos-aires");
  });

  it("ignores a location whose centre is off screen", () => {
    const iguazu = biomeById("iguazu");
    // Two screen-widths east of Iguazú at its reveal zoom.
    const center: [number, number] = [iguazu.center[0] + 6, iguazu.center[1]];
    expect(
      findRevealedBiome(
        { center, zoom: iguazu.revealZoom, viewport: DESKTOP },
        BIOMES,
      ),
    ).toBeNull();
  });
});

// Paddings shaped like useCameraPadding's: covering the right of the screen on
// desktop, the bottom on a phone.
const DESKTOP_PANEL = { ...NO_PADDING, right: 416 };
const PHONE_SHEET = { ...NO_PADDING, bottom: PHONE.height / 2 };

describe("paddedCenter", () => {
  it("puts the target in the middle of the uncovered area", () => {
    const iguazu = biomeById("iguazu");
    const zoom = 9;
    for (const [viewport, padding] of [
      [DESKTOP, DESKTOP_PANEL],
      [PHONE, PHONE_SHEET],
    ] as const) {
      const center = paddedCenter(iguazu.center, zoom, padding);
      // Screen position of the target, measured from the top-left corner.
      const offset = pixelOffset(center, iguazu.center, zoom);
      const x = viewport.width / 2 + offset.x;
      const y = viewport.height / 2 + offset.y;
      expect(x).toBeCloseTo((viewport.width - padding.right) / 2, 6);
      expect(y).toBeCloseTo((viewport.height - padding.bottom) / 2, 6);
    }
  });

  it("is the target itself without padding", () => {
    const [lng, lat] = paddedCenter([-54.44, -25.69], 9, NO_PADDING);
    expect(lng).toBeCloseTo(-54.44, 9);
    expect(lat).toBeCloseTo(-25.69, 9);
  });
});

describe("isInClearArea", () => {
  it("rejects points under a right panel and accepts points beside it", () => {
    const panelEdge = DESKTOP.width - DESKTOP_PANEL.right;
    const y = DESKTOP.height / 2;
    expect(
      isInClearArea({ x: panelEdge - 40, y }, DESKTOP, DESKTOP_PANEL, 32),
    ).toBe(true);
    expect(
      isInClearArea({ x: panelEdge - 20, y }, DESKTOP, DESKTOP_PANEL, 32),
    ).toBe(false);
    expect(
      isInClearArea({ x: panelEdge + 10, y }, DESKTOP, DESKTOP_PANEL, 32),
    ).toBe(false);
  });

  it("rejects points under a bottom sheet", () => {
    const x = PHONE.width / 2;
    expect(
      isInClearArea({ x, y: PHONE.height * 0.4 }, PHONE, PHONE_SHEET, 32),
    ).toBe(true);
    expect(
      isInClearArea({ x, y: PHONE.height * 0.6 }, PHONE, PHONE_SHEET, 32),
    ).toBe(false);
  });
});

describe("biomeCamera with an open panel", () => {
  it("keeps every Pokémon of the location clear of the panel", () => {
    for (const biome of BIOMES) {
      for (const [viewport, padding] of [
        [DESKTOP, DESKTOP_PANEL],
        [PHONE, PHONE_SHEET],
      ] as const) {
        const { center, zoom } = biomeCamera(biome, viewport, padding);
        const radiusPx =
          (biome.spreadKm * 1000) / metersPerPixel(biome.center[1], zoom);
        const offset = pixelOffset(center, biome.center, zoom);
        const middle = {
          x: viewport.width / 2 + offset.x,
          y: viewport.height / 2 + offset.y,
        };
        // The scatter's bounding box lies entirely in the uncovered area.
        for (const [dx, dy] of [
          [-radiusPx, -radiusPx],
          [radiusPx, radiusPx],
        ] as const) {
          expect(
            isInClearArea(
              { x: middle.x + dx, y: middle.y + dy },
              viewport,
              padding,
              0,
            ),
            `${biome.id} at ${viewport.width}px`,
          ).toBe(true);
        }
      }
    }
  });

  it("still reveals the location it lands on", () => {
    for (const biome of BIOMES) {
      for (const [viewport, padding] of [
        [DESKTOP, DESKTOP_PANEL],
        [PHONE, PHONE_SHEET],
      ] as const) {
        const { center, zoom } = biomeCamera(biome, viewport, padding);
        expect(
          findRevealedBiome({ center, zoom, viewport }, BIOMES)?.id,
          `${biome.id} at ${viewport.width}px`,
        ).toBe(biome.id);
      }
    }
  });
});
