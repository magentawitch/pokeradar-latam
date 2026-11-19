import type { HabitatName } from "@/lib/pokeapi/schemas";
import type { BIOMES, REGIONS } from "./biomes";

/** Geographic section of the destination index. */
export type RegionId = (typeof REGIONS)[number]["id"];

export type LngLat = readonly [lng: number, lat: number];

/** The shape BIOMES is checked against; its ids are plain strings. */
export type BiomeDefinition = {
  /** Unique key; a habitat can map to several locations. */
  id: string;
  habitat: HabitatName;
  place: string;
  country: string;
  region: RegionId;
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

/** Every configured location id, derived from BIOMES. */
export type BiomeId = (typeof BIOMES)[number]["id"];

export type BiomeConfig = BiomeDefinition & { id: BiomeId };

/**  Minimal Gen 1 Pokémon (#1–151) reference: just the id and name from a PokéAPI
 * habitat listing, not full species data. */
export type SpeciesRef = { id: number; name: string };

/** A Pokémon dealt to a location, before it gets a map position. */
export type AssignedEntry = SpeciesRef & {
  habitat: HabitatName;
  biomeId: BiomeId;
};

export type RosterEntry = AssignedEntry & {
  /** Deterministic scatter position around the location's centre. */
  position: LngLat;
};

export type AssignedRoster = Record<BiomeId, AssignedEntry[]>;

/** Serializable server → client prop. */
export type BiomeRoster = Record<BiomeId, RosterEntry[]>;
