import { REGIONS } from "./biomes";
import type { BiomeConfig, RegionId } from "./types";

export type RegionGroup = {
  id: RegionId;
  label: string;
  biomes: BiomeConfig[];
};

/**
 * Destinations grouped for the index: regions in REGIONS order, places
 * alphabetical (Spanish collation) within each. Empty regions are dropped.
 */
export function groupBiomesByRegion(
  biomes: readonly BiomeConfig[],
): RegionGroup[] {
  return REGIONS.map((region) => ({
    ...region,
    biomes: biomes
      .filter((biome) => biome.region === region.id)
      .sort((first, second) => first.place.localeCompare(second.place, "es")),
  })).filter((group) => group.biomes.length > 0);
}
