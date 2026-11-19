// Groups location stamps that would overlap on screen at continental zoom.
// No MapLibre runtime import, so it runs in plain unit tests.
import type { BiomeConfig, LngLat } from "@/lib/biomes/types";
import { TILE_SIZE, toLat, toLng, toX, toY } from "./mercator";
import {
  clearViewport,
  NO_PADDING,
  paddedCenter,
  type CameraPadding,
  type Viewport,
} from "./reveal";

/** Stamps closer than this, centre to centre, merge: a desktop stamp (36 px) plus a gap. */
export const STAMP_CLUSTER_PX = 40;

/** Screen space kept around a group's stamps when zooming in on it (per side). */
const CLUSTER_FIT_MARGIN_PX = 80;

/** Zooming in on a group never goes past this; it's for spreading stamps apart. */
const CLUSTER_MAX_ZOOM = 8;

type Stamp = Pick<BiomeConfig, "id" | "center">;

export type StampCluster<Biome extends Stamp> = {
  /** Stable React key: the member ids. */
  key: string;
  /** In input order. */
  members: Biome[];
  /** Mean of the members' positions (in Mercator space). */
  center: LngLat;
};

type Group<Biome> = { members: Biome[]; x: number; y: number };

const centroid = <Biome extends Stamp>(members: readonly Biome[]) => ({
  x:
    members.reduce((sum, biome) => sum + toX(biome.center[0]), 0) /
    members.length,
  y:
    members.reduce((sum, biome) => sum + toY(biome.center[1]), 0) /
    members.length,
});

/**
 * Merges stamps that would sit closer than `minPx` at this zoom: repeatedly
 * joins the closest pair of groups (measured between their centroids) until
 * every pair is at least `minPx` apart. Deterministic, and a single location
 * comes back as a one-member group.
 */
export function clusterStamps<Biome extends Stamp>(
  biomes: readonly Biome[],
  zoom: number,
  minPx: number = STAMP_CLUSTER_PX,
): StampCluster<Biome>[] {
  const worldPx = TILE_SIZE * 2 ** zoom;
  const groups: Group<Biome>[] = biomes.map((biome) => ({
    members: [biome],
    ...centroid([biome]),
  }));

  for (;;) {
    let closest: [number, number] | null = null;
    let closestPx = minPx;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const first = groups[i];
        const second = groups[j];
        if (!first || !second) continue;
        const px = Math.hypot(first.x - second.x, first.y - second.y) * worldPx;
        if (px < closestPx) {
          closestPx = px;
          closest = [i, j];
        }
      }
    }
    if (!closest) break;

    const [keep, drop] = closest;
    const merged = [
      ...(groups[keep]?.members ?? []),
      ...(groups[drop]?.members ?? []),
    ];
    // Input order, so keys and labels don't depend on merge order.
    merged.sort((a, b) => biomes.indexOf(a) - biomes.indexOf(b));
    groups[keep] = { members: merged, ...centroid(merged) };
    groups.splice(drop, 1);
  }

  return groups.map(({ members, x, y }) => ({
    key: members.map((biome) => biome.id).join("+"),
    members,
    center: [toLng(x), toLat(y)],
  }));
}

/**
 * Where the camera goes when a group is picked: all its locations fit, with a
 * margin, in the part of the screen the padding leaves clear. At that zoom the
 * two farthest members are a screen apart, so the group always splits (a
 * tight sub-group may remain, and splits on its own click).
 */
export function clusterCamera(
  members: readonly Stamp[],
  viewport: Viewport,
  padding: CameraPadding = NO_PADDING,
) {
  const xs = members.map((biome) => toX(biome.center[0]));
  const ys = members.map((biome) => toY(biome.center[1]));
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];

  const clear = clearViewport(viewport, padding);
  const usableWidth = Math.max(clear.width - 2 * CLUSTER_FIT_MARGIN_PX, 1);
  const usableHeight = Math.max(clear.height - 2 * CLUSTER_FIT_MARGIN_PX, 1);
  const fitZoom = Math.log2(
    Math.min(
      usableWidth / (TILE_SIZE * (maxX - minX)),
      usableHeight / (TILE_SIZE * (maxY - minY)),
    ),
  );
  const zoom = Math.min(fitZoom, CLUSTER_MAX_ZOOM);
  const target: LngLat = [toLng((minX + maxX) / 2), toLat((minY + maxY) / 2)];
  return { center: paddedCenter(target, zoom, padding), zoom };
}
