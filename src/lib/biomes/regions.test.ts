import { describe, expect, it } from "vitest";
import { BIOMES, REGIONS } from "./biomes";
import { groupBiomesByRegion } from "./regions";

describe("groupBiomesByRegion", () => {
  const groups = groupBiomesByRegion(BIOMES);

  it("lists every destination exactly once", () => {
    const ids = groups.flatMap((group) =>
      group.biomes.map((biome) => biome.id),
    );
    expect(ids).toHaveLength(BIOMES.length);
    expect(new Set(ids)).toEqual(new Set(BIOMES.map((biome) => biome.id)));
  });

  it("keeps the regions in REGIONS order with the expected sizes", () => {
    expect(groups.map((group) => [group.id, group.biomes.length])).toEqual([
      ["mesoamerica", 10],
      ["caribe", 5],
      ["norte-sudamerica", 6],
      ["andes", 6],
      ["brasil", 5],
      ["cono-sur", 10],
    ]);
    expect(groups.map((group) => group.id)).toEqual(
      REGIONS.map((region) => region.id),
    );
  });

  it("sorts places alphabetically within a region, accents included", () => {
    const andes = groups.find((group) => group.id === "andes");
    expect(andes?.biomes.map((biome) => biome.place)).toEqual([
      "Desierto de Atacama",
      "Isla de Pascua",
      "Lago Titicaca",
      "Líneas de Nazca",
      "Machu Picchu",
      "Salar de Uyuni",
    ]);
  });

  it("drops regions with no destinations", () => {
    const onlyCaribbean = BIOMES.filter((biome) => biome.region === "caribe");
    expect(groupBiomesByRegion(onlyCaribbean).map((group) => group.id)).toEqual(
      ["caribe"],
    );
  });
});
