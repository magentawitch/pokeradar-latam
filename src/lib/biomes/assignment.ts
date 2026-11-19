import type { HabitatName } from "@/lib/pokeapi/schemas";
import { BIOMES } from "./biomes";
import type {
  AssignedEntry,
  AssignedRoster,
  BiomeConfig,
  BiomeId,
  SpeciesRef,
} from "./types";

export type SpeciesByHabitat = Record<HabitatName, readonly SpeciesRef[]>;

/** One empty list per location in BIOMES. */
export function createEmptyRoster<Entry>(): Record<BiomeId, Entry[]> {
  // Filled right below, one key per BIOMES id.
  const roster = {} as Record<BiomeId, Entry[]>;
  for (const biome of BIOMES) roster[biome.id] = [];
  return roster;
}

/**
 * Deals each habitat's Pokémon across that habitat's locations.
 * Species are sorted by id; the one at index `i` goes to `locations[i % n]`
 * (locations in `biomes` order), so the split is deterministic and balanced.
 * Habitats with no configured location are skipped.
 */
export function assignToBiomes(
  speciesByHabitat: SpeciesByHabitat,
  biomes: readonly BiomeConfig[],
): AssignedRoster {
  const roster = createEmptyRoster<AssignedEntry>();

  for (const [habitat, speciesList] of Object.entries(speciesByHabitat)) {
    const locations = biomes.filter((biome) => biome.habitat === habitat);
    const sortedSpecies = [...speciesList].sort(
      (first, second) => first.id - second.id,
    );

    sortedSpecies.forEach((species, index) => {
      const location = locations[index % locations.length];
      if (!location) return;
      const entry: AssignedEntry = {
        id: species.id,
        name: species.name,
        habitat: location.habitat,
        biomeId: location.id,
      };
      roster[location.id].push(entry);
    });
  }

  return roster;
}
