import { describe, expect, it } from "vitest";
import {
  HabitatResponseSchema,
  PokemonResponseSchema,
  SpeciesResponseSchema,
} from "./schemas";

const resource = (name: string) => ({
  name,
  url: `https://pokeapi.co/api/v2/x/${name}/`,
});

const withoutKey = (source: object, key: string) =>
  Object.fromEntries(
    Object.entries(source).filter(([entryKey]) => entryKey !== key),
  );

const validHabitat = () => ({
  id: 2,
  name: "forest",
  pokemon_species: [resource("pikachu")],
});

const validPokemon = () => ({
  id: 25,
  name: "pikachu",
  height: 4,
  weight: 60,
  types: [{ slot: 1, type: resource("electric") }],
  stats: [{ base_stat: 35, stat: resource("hp") }],
  sprites: {
    front_default: "https://example.test/25.png",
    other: {
      showdown: { front_default: null },
      "official-artwork": { front_default: "https://example.test/25-art.png" },
    },
  },
  cries: { latest: "https://example.test/25.ogg", legacy: null },
});

const validSpecies = () => ({
  id: 25,
  flavor_text_entries: [
    {
      flavor_text: "Cuando se enfada,\nlibera energía.",
      language: resource("es"),
      version: resource("x"),
    },
  ],
});

describe("HabitatResponseSchema", () => {
  const accepts = (value: unknown) =>
    HabitatResponseSchema.safeParse(value).success;

  it("accepts a minimal valid response", () => {
    expect(accepts(validHabitat())).toBe(true);
  });

  it("strips fields the app does not use", () => {
    const parsed = HabitatResponseSchema.parse({
      ...validHabitat(),
      names: [{ name: "Bosque" }],
    });
    expect(parsed).toEqual(validHabitat());
  });

  it("rejects a missing field", () => {
    expect(accepts(withoutKey(validHabitat(), "pokemon_species"))).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(accepts({ ...validHabitat(), id: "2" })).toBe(false);
    expect(accepts({ ...validHabitat(), name: "desert" })).toBe(false);
    expect(accepts({ ...validHabitat(), pokemon_species: [{ name: 1 }] })).toBe(
      false,
    );
  });

  it("rejects null", () => {
    expect(accepts(null)).toBe(false);
  });

  it("reports the path of the invalid field", () => {
    const result = HabitatResponseSchema.safeParse({
      ...validHabitat(),
      pokemon_species: [resource("pikachu"), { name: "eevee", url: null }],
    });
    expect(result.error?.issues[0]?.path).toEqual([
      "pokemon_species",
      1,
      "url",
    ]);
  });
});

describe("PokemonResponseSchema", () => {
  const accepts = (value: unknown) =>
    PokemonResponseSchema.safeParse(value).success;

  it("accepts a minimal valid response", () => {
    expect(accepts(validPokemon())).toBe(true);
  });

  it("rejects a missing field", () => {
    expect(accepts(withoutKey(validPokemon(), "cries"))).toBe(false);

    const pokemon = validPokemon();
    expect(
      accepts({
        ...pokemon,
        sprites: {
          ...pokemon.sprites,
          other: withoutKey(pokemon.sprites.other, "showdown"),
        },
      }),
    ).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(accepts({ ...validPokemon(), id: "25" })).toBe(false);
    expect(
      accepts({
        ...validPokemon(),
        stats: [{ base_stat: "35", stat: resource("hp") }],
      }),
    ).toBe(false);
  });

  it("rejects null", () => {
    expect(accepts(null)).toBe(false);
  });
});

describe("SpeciesResponseSchema", () => {
  const accepts = (value: unknown) =>
    SpeciesResponseSchema.safeParse(value).success;

  it("accepts a minimal valid response", () => {
    expect(accepts(validSpecies())).toBe(true);
  });

  it("rejects a missing field", () => {
    expect(accepts({ id: 25 })).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(accepts({ ...validSpecies(), id: "25" })).toBe(false);
    expect(
      accepts({
        ...validSpecies(),
        flavor_text_entries: [{ flavor_text: 7, language: resource("es") }],
      }),
    ).toBe(false);
  });

  it("rejects null", () => {
    expect(accepts(null)).toBe(false);
  });
});
