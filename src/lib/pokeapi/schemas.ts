// Zod schemas for the PokéAPI responses: only the fields the app reads.
// `z.object` strips unknown keys, so parsed data holds only these fields.
import { z } from "zod";

export const HABITAT_NAMES = [
  "cave",
  "forest",
  "grassland",
  "mountain",
  "rare",
  "rough-terrain",
  "sea",
  "urban",
  "waters-edge",
] as const;

export const HabitatNameSchema = z.enum(HABITAT_NAMES);
export type HabitatName = z.infer<typeof HabitatNameSchema>;

export const NamedResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});
export type NamedResource = z.infer<typeof NamedResourceSchema>;

export const HabitatResponseSchema = z.object({
  id: z.number(),
  name: HabitatNameSchema,
  pokemon_species: z.array(NamedResourceSchema),
});
export type HabitatResponse = z.infer<typeof HabitatResponseSchema>;

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export const PokemonTypeSchema = z.enum(POKEMON_TYPES);
export type PokemonType = z.infer<typeof PokemonTypeSchema>;

export const STAT_NAMES = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export const StatNameSchema = z.enum(STAT_NAMES);
export type StatName = z.infer<typeof StatNameSchema>;

const FrontDefaultSchema = z.object({ front_default: z.string().nullable() });

export const PokemonResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  types: z.array(
    z.object({
      slot: z.number(),
      type: NamedResourceSchema.extend({ name: PokemonTypeSchema }),
    }),
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      stat: NamedResourceSchema.extend({ name: StatNameSchema }),
    }),
  ),
  sprites: z.object({
    front_default: z.string().nullable(),
    other: z.object({
      showdown: FrontDefaultSchema,
      "official-artwork": FrontDefaultSchema,
    }),
  }),
  cries: z.object({
    latest: z.string().nullable(),
    legacy: z.string().nullable(),
  }),
});
export type PokemonResponse = z.infer<typeof PokemonResponseSchema>;

export const SpeciesResponseSchema = z.object({
  id: z.number(),
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: NamedResourceSchema,
      version: NamedResourceSchema,
    }),
  ),
});
export type SpeciesResponse = z.infer<typeof SpeciesResponseSchema>;
