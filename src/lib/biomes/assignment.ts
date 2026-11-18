import type { HabitatName } from "@/lib/pokeapi/schemas";
import type {
  BiomeConfig,
  BiomeRoster,
  RosterEntry,
  SpeciesRef,
} from "./types";

export type SpeciesByHabitat = Record<HabitatName, readonly SpeciesRef[]>;

const createEmptyRoster = (): BiomeRoster => ({
  iguazu: [],
  amazonia: [],
  pampas: [],
  llanos: [],
  aconcagua: [],
  atacama: [],
  "cueva-de-las-manos": [],
  caribe: [],
  cdmx: [],
  "buenos-aires": [],
  "sao-paulo": [],
  galapagos: [],
});

/**
 * Deals each habitat's Pokémon across that habitat's locations.
 * Species are sorted by id; the one at index `i` goes to `locations[i % n]`
 * (locations in `biomes` order), so the split is deterministic and balanced.
 * Habitats with no configured location are skipped.
 */
export function assignToBiomes(
  speciesByHabitat: SpeciesByHabitat,
  biomes: readonly BiomeConfig[],
): BiomeRoster {
  const roster = createEmptyRoster();

  for (const [habitat, speciesList] of Object.entries(speciesByHabitat)) {
    const locations = biomes.filter((biome) => biome.habitat === habitat);
    const sortedSpecies = [...speciesList].sort(
      (first, second) => first.id - second.id,
    );

    sortedSpecies.forEach((species, index) => {
      const location = locations[index % locations.length];
      if (!location) return;
      const entry: RosterEntry = {
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
