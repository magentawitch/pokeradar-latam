import type { HabitatName } from "@/lib/pokeapi/schemas";

export type BiomeId =
  | "iguazu"
  | "amazonia"
  | "pampas"
  | "llanos"
  | "aconcagua"
  | "atacama"
  | "cueva-de-las-manos"
  | "caribe"
  | "cdmx"
  | "buenos-aires"
  | "sao-paulo"
  | "galapagos";

export type LngLat = readonly [lng: number, lat: number];

export type BiomeConfig = {
  /** Unique key; a habitat can map to several locations. */
  id: BiomeId;
  habitat: HabitatName;
  place: string;
  country: string;
  center: LngLat;
  /** Scatter radius for this location's Pokémon  */
  spreadKm: number;
  /** Camera zoom when the location is focused. */
  revealZoom: number;
  /** CSS custom property holding the location's accent colour. */
  accent: `--color-biome-${HabitatName}`;
  /** One-line journal annotation (Spanish). */
  fieldNote: string;
};

/**  Minimal Gen 1 Pokémon (#1–151) reference: just the id and name from a PokéAPI
 * habitat listing, not full species data. */
export type SpeciesRef = { id: number; name: string };

export type RosterEntry = SpeciesRef & {
  habitat: HabitatName;
  biomeId: BiomeId;
};

/** Serializable server → client prop. */
export type BiomeRoster = Record<BiomeId, RosterEntry[]>;
