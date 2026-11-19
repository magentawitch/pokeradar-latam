import type { PokemonType } from "@/lib/pokeapi/schemas";

/** Spanish type names, as the games print them. */
export const TYPE_LABELS = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
} as const satisfies Record<PokemonType, string>;

/**
 * Full static class strings per type (Tailwind can't see built-up names).
 * Ink and ring share the type colour; the tokens live in globals.css.
 */
export const TYPE_STAMP_CLASSES = {
  normal: "border-type-normal text-type-normal",
  fire: "border-type-fire text-type-fire",
  water: "border-type-water text-type-water",
  electric: "border-type-electric text-type-electric",
  grass: "border-type-grass text-type-grass",
  ice: "border-type-ice text-type-ice",
  fighting: "border-type-fighting text-type-fighting",
  poison: "border-type-poison text-type-poison",
  ground: "border-type-ground text-type-ground",
  flying: "border-type-flying text-type-flying",
  psychic: "border-type-psychic text-type-psychic",
  bug: "border-type-bug text-type-bug",
  rock: "border-type-rock text-type-rock",
  ghost: "border-type-ghost text-type-ghost",
  dragon: "border-type-dragon text-type-dragon",
  dark: "border-type-dark text-type-dark",
  steel: "border-type-steel text-type-steel",
  fairy: "border-type-fairy text-type-fairy",
} as const satisfies Record<PokemonType, string>;
