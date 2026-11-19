import { z } from "zod";
import { fetchJson, POKEAPI_BASE_URL } from "./client";
import {
  PokemonResponseSchema,
  SpeciesResponseSchema,
  type PokemonResponse,
  type PokemonType,
  type SpeciesResponse,
  type StatName,
} from "./schemas";
import { normalizeFlavorText } from "@/utils/pokemonHelpers";

export type PokemonDetail = {
  id: number;
  name: string;
  /** In slot order (primary type first). */
  types: PokemonType[];
  /** In PokéAPI order: hp, attack, defense, special-attack, special-defense, speed. */
  stats: { name: StatName; value: number }[];
  heightDm: number;
  weightHg: number;
  spriteAnimated: string | null;
  spriteStatic: string | null;
  cry: string | null;
};

export type SpeciesNote = { text: string; language: "es" | "en" } | null;

export function toPokemonDetail(response: PokemonResponse): PokemonDetail {
  return {
    id: response.id,
    name: response.name,
    types: response.types
      .toSorted((first, second) => first.slot - second.slot)
      .map((entry) => entry.type.name),
    stats: response.stats.map((entry) => ({
      name: entry.stat.name,
      value: entry.base_stat,
    })),
    heightDm: response.height,
    weightHg: response.weight,
    spriteAnimated: response.sprites.other.showdown.front_default,
    spriteStatic: response.sprites.front_default,
    cry: response.cries.latest ?? response.cries.legacy,
  };
}

/** The first Spanish flavour text, else the first English one, else null. */
export function toSpeciesNote(response: SpeciesResponse): SpeciesNote {
  for (const language of ["es", "en"] as const) {
    const entry = response.flavor_text_entries.find(
      (candidate) => candidate.language.name === language,
    );
    if (entry)
      return { text: normalizeFlavorText(entry.flavor_text), language };
  }
  return null;
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const result = PokemonResponseSchema.safeParse(
    await fetchJson(`${POKEAPI_BASE_URL}/pokemon/${id}`),
  );
  if (!result.success) {
    throw new Error(
      `Unexpected PokéAPI pokemon response for #${id}:\n${z.prettifyError(result.error)}`,
    );
  }
  return toPokemonDetail(result.data);
}

export async function fetchSpeciesNote(id: number): Promise<SpeciesNote> {
  const result = SpeciesResponseSchema.safeParse(
    await fetchJson(`${POKEAPI_BASE_URL}/pokemon-species/${id}`),
  );
  if (!result.success) {
    throw new Error(
      `Unexpected PokéAPI species response for #${id}:\n${z.prettifyError(result.error)}`,
    );
  }
  return toSpeciesNote(result.data);
}
