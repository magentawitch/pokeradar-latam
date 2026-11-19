import { offsetByKm } from "@/lib/map/mercator";
import { createEmptyRoster } from "./assignment";
import type {
  AssignedRoster,
  BiomeConfig,
  BiomeRoster,
  LngLat,
  RosterEntry,
} from "./types";

/** 137.5°: consecutive points never line up, so a spiral fills a disc evenly. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** The outermost marker sits at this fraction of spreadKm, leaving room for jitter. */
const SPIRAL_FILL = 0.88;

/** Max jitter as a fraction of the average spacing between markers. */
const JITTER_FRACTION = 0.08;

/** Small seeded PRNG (mulberry32): the same seed always gives the same sequence. */
export function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scatters Pokémon around a centre on a golden-angle (sunflower) spiral,
 * ordered by dex id, with a small jitter seeded by each id. Returns positions
 * in the order of `ids`; the result is identical on every call.
 */
export function scatterPositions(
  center: LngLat,
  spreadKm: number,
  ids: readonly number[],
): LngLat[] {
  const count = ids.length;
  const spiralIndex = new Map(
    [...ids]
      .sort((first, second) => first - second)
      .map((id, index) => [id, index]),
  );
  // Area of the disc divided evenly between markers, as a side length.
  const averageSpacingKm = SPIRAL_FILL * spreadKm * Math.sqrt(Math.PI / count);

  return ids.map((id) => {
    const index = spiralIndex.get(id) ?? 0;
    const radiusKm = SPIRAL_FILL * spreadKm * Math.sqrt((index + 0.5) / count);
    const angle = index * GOLDEN_ANGLE;

    const random = mulberry32(id);
    const jitterKm = random() * JITTER_FRACTION * averageSpacingKm;
    const jitterAngle = random() * 2 * Math.PI;

    return offsetByKm(
      center,
      radiusKm * Math.sin(angle) + jitterKm * Math.sin(jitterAngle),
      radiusKm * Math.cos(angle) + jitterKm * Math.cos(jitterAngle),
    );
  });
}

/** Gives every assigned Pokémon its map position around its location. */
export function placeRoster(
  roster: AssignedRoster,
  biomes: readonly BiomeConfig[],
): BiomeRoster {
  const placed = createEmptyRoster<RosterEntry>();

  for (const biome of biomes) {
    const entries = roster[biome.id];
    const positions = scatterPositions(
      biome.center,
      biome.spreadKm,
      entries.map((entry) => entry.id),
    );
    placed[biome.id] = entries.flatMap((entry, index) => {
      const position = positions[index];
      return position ? [{ ...entry, position }] : [];
    });
  }

  return placed;
}
