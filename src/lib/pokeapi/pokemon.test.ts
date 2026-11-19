import { describe, expect, it } from "vitest";
import { toPokemonDetail, toSpeciesNote } from "./pokemon";
import type { PokemonResponse, SpeciesResponse } from "./schemas";

const resource = (name: string) => ({
  name,
  url: `https://pokeapi.co/api/v2/x/${name}/`,
});

const bulbasaur = (): PokemonResponse => ({
  id: 1,
  name: "bulbasaur",
  height: 7,
  weight: 69,
  // Out of slot order on purpose.
  types: [
    { slot: 2, type: { ...resource("poison"), name: "poison" } },
    { slot: 1, type: { ...resource("grass"), name: "grass" } },
  ],
  stats: [
    { base_stat: 45, stat: { ...resource("hp"), name: "hp" } },
    { base_stat: 49, stat: { ...resource("attack"), name: "attack" } },
  ],
  sprites: {
    front_default: "https://example.test/1.png",
    other: {
      showdown: { front_default: "https://example.test/1.gif" },
      "official-artwork": { front_default: null },
    },
  },
  cries: { latest: null, legacy: "https://example.test/1-legacy.ogg" },
});

const flavor = (text: string, language: string) => ({
  flavor_text: text,
  language: resource(language),
  version: resource("x"),
});

describe("toPokemonDetail", () => {
  it("maps the response to the domain shape, types in slot order", () => {
    expect(toPokemonDetail(bulbasaur())).toEqual({
      id: 1,
      name: "bulbasaur",
      types: ["grass", "poison"],
      stats: [
        { name: "hp", value: 45 },
        { name: "attack", value: 49 },
      ],
      heightDm: 7,
      weightHg: 69,
      spriteAnimated: "https://example.test/1.gif",
      spriteStatic: "https://example.test/1.png",
      cry: "https://example.test/1-legacy.ogg",
    });
  });
});

describe("toSpeciesNote", () => {
  const species = (
    entries: SpeciesResponse["flavor_text_entries"],
  ): SpeciesResponse => ({ id: 1, flavor_text_entries: entries });

  it("prefers Spanish over an earlier English entry", () => {
    expect(
      toSpeciesNote(
        species([
          flavor("A strange seed.", "en"),
          flavor("Una rara\fsemilla.", "es"),
          flavor("Otra semilla.", "es"),
        ]),
      ),
    ).toEqual({ text: "Una rara semilla.", language: "es" });
  });

  it("falls back to English", () => {
    expect(
      toSpeciesNote(
        species([flavor("Eine Saat.", "de"), flavor("A\nseed.", "en")]),
      ),
    ).toEqual({ text: "A seed.", language: "en" });
  });

  it("is null when neither language exists", () => {
    expect(toSpeciesNote(species([flavor("Une graine.", "fr")]))).toBeNull();
  });
});
