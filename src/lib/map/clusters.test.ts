import { describe, expect, it } from "vitest";
import { BIOMES } from "@/lib/biomes/biomes";
import type { BiomeId } from "@/lib/biomes/types";
import { INITIAL_BOUNDS, INITIAL_PADDING, MIN_ZOOM } from "./camera";
import { clusterCamera, clusterStamps, STAMP_CLUSTER_PX } from "./clusters";
import { pixelOffset, TILE_SIZE, toX, toY } from "./mercator";
import { NO_PADDING, type Viewport } from "./reveal";

const DESKTOP = { width: 1440, height: 900 };
// The e2e phone project's viewport.
const PHONE = { width: 375, height: 667 };

/** The zoom MapLibre opens at: INITIAL_BOUNDS fitted with INITIAL_PADDING. */
const openingZoom = ({ width, height }: Viewport) => {
  const [[west, south], [east, north]] = INITIAL_BOUNDS;
  const { top, bottom, left, right } = INITIAL_PADDING;
  const fit = Math.log2(
    Math.min(
      (width - left - right) / (TILE_SIZE * (toX(east) - toX(west))),
      (height - top - bottom) / (TILE_SIZE * (toY(south) - toY(north))),
    ),
  );
  return Math.max(fit, MIN_ZOOM);
};

const groupOf = (
  clusters: ReturnType<typeof clusterStamps<(typeof BIOMES)[number]>>,
  id: BiomeId,
) =>
  clusters.find((cluster) => cluster.members.some((biome) => biome.id === id));

describe("clusterStamps", () => {
  for (const [label, viewport] of [
    ["desktop", DESKTOP],
    ["phone", PHONE],
  ] as const) {
    describe(`at the opening zoom on ${label}`, () => {
      const zoom = openingZoom(viewport);
      const clusters = clusterStamps(BIOMES, zoom);

      it("puts every location in exactly one stamp", () => {
        const ids = clusters.flatMap((cluster) =>
          cluster.members.map((biome) => biome.id),
        );
        expect([...ids].sort()).toEqual(BIOMES.map((biome) => biome.id).sort());
      });

      it("leaves no two stamps overlapping", () => {
        clusters.forEach((first, index) => {
          for (const second of clusters.slice(index + 1)) {
            const offset = pixelOffset(first.center, second.center, zoom);
            expect(
              Math.hypot(offset.x, offset.y),
              `${first.key} / ${second.key}`,
            ).toBeGreaterThanOrEqual(STAMP_CLUSTER_PX);
          }
        });
      });

      it("groups the crowded Central American volcanoes and lakes", () => {
        expect(groupOf(clusters, "atitlan")).toBe(groupOf(clusters, "izalco"));
        expect(groupOf(clusters, "atitlan")?.members.length).toBeGreaterThan(1);
      });

      it("keeps Iguazú on its own stamp (the e2e flow clicks it)", () => {
        expect(groupOf(clusters, "iguazu")?.members).toHaveLength(1);
      });
    });
  }

  it("separates every location once zoomed in a little", () => {
    expect(clusterStamps(BIOMES, 6)).toHaveLength(BIOMES.length);
  });

  it("is deterministic and keys groups by their members", () => {
    const zoom = openingZoom(DESKTOP);
    const clusters = clusterStamps(BIOMES, zoom);
    expect(clusterStamps(BIOMES, zoom)).toEqual(clusters);
    for (const cluster of clusters) {
      expect(cluster.key).toBe(
        cluster.members.map((biome) => biome.id).join("+"),
      );
    }
  });
});

describe("clusterCamera", () => {
  it("lands where a group's stamps no longer overlap", () => {
    for (const viewport of [DESKTOP, PHONE]) {
      const zoom = openingZoom(viewport);
      for (const cluster of clusterStamps(BIOMES, zoom)) {
        if (cluster.members.length < 2) continue;
        const camera = clusterCamera(cluster.members, viewport);
        expect(camera.zoom, cluster.key).toBeGreaterThan(zoom);
        const after = clusterStamps(cluster.members, camera.zoom);
        expect(
          after.length,
          `${cluster.key} at ${viewport.width}px`,
        ).toBeGreaterThan(1);
      }
    }
  });

  it("frames every member inside the screen", () => {
    const zoom = openingZoom(DESKTOP);
    for (const cluster of clusterStamps(BIOMES, zoom)) {
      const camera = clusterCamera(cluster.members, DESKTOP, NO_PADDING);
      for (const biome of cluster.members) {
        const offset = pixelOffset(camera.center, biome.center, camera.zoom);
        expect(Math.abs(offset.x)).toBeLessThan(DESKTOP.width / 2);
        expect(Math.abs(offset.y)).toBeLessThan(DESKTOP.height / 2);
      }
    }
  });
});
