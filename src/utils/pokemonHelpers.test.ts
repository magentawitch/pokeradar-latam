import { describe, expect, it } from "vitest";
import {
  formatDexNumber,
  formatHeight,
  formatPokemonName,
  formatWeight,
  normalizeFlavorText,
  staticSpriteUrl,
  statTotal,
  strongestStat,
} from "./pokemonHelpers";

describe("formatPokemonName", () => {
  it.each([
    ["nidoran-f", "Nidoran♀"],
    ["nidoran-m", "Nidoran♂"],
    ["mr-mime", "Mr. Mime"],
    ["farfetchd", "Farfetch'd"],
    ["pikachu", "Pikachu"],
    ["mewtwo", "Mewtwo"],
  ])("%s → %s", (slug, expected) => {
    expect(formatPokemonName(slug)).toBe(expected);
  });
});

describe("staticSpriteUrl", () => {
  it("builds the sprite URL from the dex id", () => {
    expect(staticSpriteUrl(25)).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    );
  });
});

describe("formatDexNumber", () => {
  it("pads to three digits", () => {
    expect(formatDexNumber(7)).toBe("#007");
    expect(formatDexNumber(151)).toBe("#151");
  });
});

describe("normalizeFlavorText", () => {
  it("joins hard line breaks and form feeds into single spaces", () => {
    expect(
      normalizeFlavorText(
        "When several of\nthese POKéMON\ngather, their\felectricity",
      ),
    ).toBe("When several of these POKéMON gather, their electricity");
  });

  it("rejoins words split by a soft hyphen at a line break", () => {
    expect(normalizeFlavorText("electri\u00ad\ncidad")).toBe("electricidad");
  });

  it("collapses repeated whitespace and trims", () => {
    expect(normalizeFlavorText("  Vive\u00a0\u00a010 000  años.\n")).toBe(
      "Vive 10 000 años.",
    );
  });
});

describe("formatHeight / formatWeight", () => {
  it("converts decimetres and hectograms with a decimal comma", () => {
    expect(formatHeight(4)).toBe("0,4 m");
    expect(formatHeight(17)).toBe("1,7 m");
    expect(formatWeight(60)).toBe("6 kg");
    expect(formatWeight(905)).toBe("90,5 kg");
  });
});

describe("statTotal and strongestStat", () => {
  const pikachu = [
    { name: "hp", value: 35 },
    { name: "attack", value: 55 },
    { name: "defense", value: 40 },
    { name: "special-attack", value: 50 },
    { name: "special-defense", value: 50 },
    { name: "speed", value: 90 },
  ] as const;

  it("sums the base stats", () => {
    expect(statTotal(pikachu)).toBe(320);
  });

  it("picks the highest stat", () => {
    expect(strongestStat(pikachu)?.name).toBe("speed");
  });

  it("breaks ties by PokéAPI order", () => {
    const tied = [
      { name: "special-attack", value: 50 },
      { name: "special-defense", value: 50 },
    ] as const;
    expect(strongestStat(tied)?.name).toBe("special-attack");
  });

  it("has no strongest stat for an empty list", () => {
    expect(strongestStat([])).toBeUndefined();
  });
});
