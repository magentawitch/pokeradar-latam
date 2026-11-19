import { describe, expect, it } from "vitest";
import { assignToBiomes } from "./assignment";
import { BIOMES } from "./biomes";
import { GEN1_IDS_BY_HABITAT, SPECIES_BY_HABITAT } from "./gen1Fixture";
import type { BiomeId } from "./types";

const EXPECTED_COUNTS: Record<BiomeId, number> = {
  // waters-edge 19
  iguazu: 5,
  titicaca: 5,
  pantanal: 5,
  atitlan: 4,
  // forest 21
  amazonia: 5,
  lacandona: 4,
  monteverde: 4,
  darien: 4,
  "el-yunque": 4,
  // grassland 35
  pampas: 5,
  llanos: 5,
  patagonia: 5,
  "gran-sabana": 5,
  cerrado: 5,
  "campos-uruguay": 5,
  chaco: 5,
  // mountain 18
  aconcagua: 4,
  "machu-picchu": 4,
  chimborazo: 4,
  masaya: 3,
  izalco: 3,
  // rough-terrain 8
  atacama: 3,
  uyuni: 3,
  "valle-de-la-luna": 2,
  // cave 8
  "cueva-de-las-manos": 3,
  cenotes: 3,
  "actun-tunichil-muknal": 2,
  // sea 15
  "peninsula-valdes": 3,
  "cayo-coco": 3,
  roatan: 3,
  "fernando-de-noronha": 3,
  samana: 3,
  // urban 22
  cdmx: 5,
  "buenos-aires": 5,
  "sao-paulo": 4,
  bogota: 4,
  havana: 4,
  // rare 5
  "easter-island": 1,
  catatumbo: 1,
  nazca: 1,
  "bermuda-triangle": 1,
  galapagos: 1,
};

const MAX_PER_LOCATION = 5;

const idsOf = (entries: readonly { id: number }[]) =>
  entries.map((entry) => entry.id);

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

  it("never puts more than five Pokémon in one location", () => {
    for (const entries of Object.values(roster)) {
      expect(entries.length).toBeLessThanOrEqual(MAX_PER_LOCATION);
    }
  });

  it("deals grassland 5 to each of its 7 locations, round-robin by id", () => {
    expect(idsOf(roster.pampas)).toEqual([1, 29, 38, 59, 97]);
    expect(idsOf(roster.llanos)).toEqual([2, 30, 39, 77, 108]);
    expect(idsOf(roster.chaco)).toEqual([24, 37, 58, 96, 128]);
  });

  it("splits urban 5/5/4/4/4, earlier locations taking the extra ones", () => {
    expect(
      [
        roster.cdmx,
        roster["buenos-aires"],
        roster["sao-paulo"],
        roster.bogota,
        roster.havana,
      ].map((entries) => entries[0]?.id),
    ).toEqual([52, 53, 63, 64, 65]);
  });

  it("gives each rare location exactly one legendary, in location order", () => {
    expect(
      BIOMES.filter((biome) => biome.habitat === "rare").map((biome) =>
        idsOf(roster[biome.id]),
      ),
    ).toEqual([[144], [145], [146], [150], [151]]);
    expect(idsOf(roster.catatumbo)).toEqual([145]);
    expect(idsOf(roster.galapagos)).toEqual([151]);
  });

  it("keeps Squirtle at Iguazú (the e2e flow relies on it)", () => {
    expect(roster.iguazu[0]?.id).toBe(7);
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
