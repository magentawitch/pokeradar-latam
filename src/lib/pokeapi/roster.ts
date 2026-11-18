import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import { assignToBiomes, type SpeciesByHabitat } from "@/lib/biomes/assignment";
import { BIOMES } from "@/lib/biomes/biomes";
import type { BiomeRoster, SpeciesRef } from "@/lib/biomes/types";
import { fetchJson, idFromResourceUrl, POKEAPI_BASE_URL } from "./client";
import {
  HABITAT_NAMES,
  HabitatResponseSchema,
  type HabitatName,
} from "./schemas";

const GEN1_MAX_ID = 151;

async function fetchGen1Species(habitat: HabitatName): Promise<SpeciesRef[]> {
  const result = HabitatResponseSchema.safeParse(
    await fetchJson(`${POKEAPI_BASE_URL}/pokemon-habitat/${habitat}/`),
  );
  if (!result.success) {
    throw new Error(
      `Unexpected PokéAPI habitat response for "${habitat}":\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data.pokemon_species.flatMap((species) => {
    const id = idFromResourceUrl(species.url);
    return id !== null && id <= GEN1_MAX_ID ? [{ id, name: species.name }] : [];
  });
}

/** All Gen 1 Pokémon, grouped by expedition location. Cached for days. */
export async function getBiomeRoster(): Promise<BiomeRoster> {
  "use cache";
  cacheLife("days");

  const speciesLists = await Promise.all(HABITAT_NAMES.map(fetchGen1Species));

  // Every key is listed so TypeScript errors if a habitat in HABITAT_NAMES is missing here.
  const speciesByHabitat: SpeciesByHabitat = {
    cave: [],
    forest: [],
    grassland: [],
    mountain: [],
    rare: [],
    "rough-terrain": [],
    sea: [],
    urban: [],
    "waters-edge": [],
  };
  HABITAT_NAMES.forEach((habitat, index) => {
    speciesByHabitat[habitat] = speciesLists[index] ?? [];
  });

  return assignToBiomes(speciesByHabitat, BIOMES);
}
