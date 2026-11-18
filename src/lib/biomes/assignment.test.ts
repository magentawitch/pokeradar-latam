import { describe, expect, it } from "vitest";
import { assignToBiomes, type SpeciesByHabitat } from "./assignment";
import { BIOMES } from "./biomes";
import type { BiomeId } from "./types";

// Gen 1 ids per PokéAPI habitat (pokemon-habitat/{name}, ids ≤ 151), checked live.
const GEN1_IDS_BY_HABITAT = {
  cave: [41, 42, 50, 51, 92, 93, 94, 95],
  forest: [
    10, 11, 12, 13, 14, 15, 16, 17, 18, 25, 26, 46, 47, 48, 49, 69, 70, 71, 102,
    103, 127,
  ],
  grassland: [
    1, 2, 3, 19, 20, 23, 24, 29, 30, 31, 32, 33, 34, 37, 38, 39, 40, 43, 44, 45,
    58, 59, 77, 78, 83, 84, 85, 96, 97, 108, 114, 115, 123, 125, 128,
  ],
  mountain: [
    4, 5, 6, 35, 36, 56, 57, 66, 67, 68, 74, 75, 76, 104, 105, 126, 142, 143,
  ],
  rare: [144, 145, 146, 150, 151],
  "rough-terrain": [21, 22, 27, 28, 81, 82, 111, 112],
  sea: [72, 73, 86, 87, 90, 91, 116, 117, 120, 121, 131, 138, 139, 140, 141],
  urban: [
    52, 53, 63, 64, 65, 88, 89, 100, 101, 106, 107, 109, 110, 113, 122, 124,
    132, 133, 134, 135, 136, 137,
  ],
  "waters-edge": [
    7, 8, 9, 54, 55, 60, 61, 62, 79, 80, 98, 99, 118, 119, 129, 130, 147, 148,
    149,
  ],
} satisfies Record<keyof SpeciesByHabitat, number[]>;

const toSpecies = (ids: number[]) =>
  // Reversed so the test also proves assignment sorts by id itself.
  [...ids].reverse().map((id) => ({ id, name: `species-${id}` }));

const SPECIES_BY_HABITAT: SpeciesByHabitat = {
  cave: toSpecies(GEN1_IDS_BY_HABITAT.cave),
  forest: toSpecies(GEN1_IDS_BY_HABITAT.forest),
  grassland: toSpecies(GEN1_IDS_BY_HABITAT.grassland),
  mountain: toSpecies(GEN1_IDS_BY_HABITAT.mountain),
  rare: toSpecies(GEN1_IDS_BY_HABITAT.rare),
  "rough-terrain": toSpecies(GEN1_IDS_BY_HABITAT["rough-terrain"]),
  sea: toSpecies(GEN1_IDS_BY_HABITAT.sea),
  urban: toSpecies(GEN1_IDS_BY_HABITAT.urban),
  "waters-edge": toSpecies(GEN1_IDS_BY_HABITAT["waters-edge"]),
};

const EXPECTED_COUNTS: Record<BiomeId, number> = {
  iguazu: 19,
  amazonia: 21,
  pampas: 18,
  llanos: 17,
  aconcagua: 18,
  atacama: 8,
  "cueva-de-las-manos": 8,
  caribe: 15,
  cdmx: 8,
  "buenos-aires": 7,
  "sao-paulo": 7,
  galapagos: 5,
};

describe("assignToBiomes", () => {
  const roster = assignToBiomes(SPECIES_BY_HABITAT, BIOMES);
  const allEntries = Object.values(roster).flat();

  it("assigns every Gen 1 id exactly once", () => {
    const ids = allEntries
      .map((entry) => entry.id)
      .sort((first, second) => first - second);
    expect(ids).toEqual(
      Array.from({ length: 151 }, (_unused, index) => index + 1),
    );
  });

  it("matches the per-location counts from the plan", () => {
    const counts = Object.fromEntries(
      Object.entries(roster).map(([biomeId, entries]) => [
        biomeId,
        entries.length,
      ]),
    );
    expect(counts).toEqual(EXPECTED_COUNTS);
  });

  it("splits grassland 18/17 between Pampa and Llanos, round-robin by id", () => {
    expect(roster.pampas.map((entry) => entry.id).slice(0, 3)).toEqual([
      1, 3, 20,
    ]);
    expect(roster.llanos.map((entry) => entry.id).slice(0, 3)).toEqual([
      2, 19, 23,
    ]);
    expect([roster.pampas.length, roster.llanos.length]).toEqual([18, 17]);
  });

  it("splits urban 8/7/7 across CDMX, Buenos Aires and São Paulo", () => {
    expect([
      roster.cdmx.length,
      roster["buenos-aires"].length,
      roster["sao-paulo"].length,
    ]).toEqual([8, 7, 7]);
    expect(roster.cdmx[0]?.id).toBe(52);
    expect(roster["buenos-aires"][0]?.id).toBe(53);
    expect(roster["sao-paulo"][0]?.id).toBe(63);
  });

  it("only places a Pokémon in a location of its own habitat", () => {
    for (const biome of BIOMES) {
      for (const entry of roster[biome.id]) {
        expect(entry.biomeId).toBe(biome.id);
        expect(entry.habitat).toBe(biome.habitat);
        expect(GEN1_IDS_BY_HABITAT[biome.habitat]).toContain(entry.id);
      }
    }
  });

  it("is deterministic", () => {
    expect(assignToBiomes(SPECIES_BY_HABITAT, BIOMES)).toEqual(roster);
  });
});
