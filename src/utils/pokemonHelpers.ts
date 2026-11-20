import type { StatName } from "@/lib/pokeapi/schemas";

/** PokéAPI slugs whose display name isn't just the slug capitalized. */
const SPECIAL_NAMES: Readonly<Record<string, string>> = {
  "nidoran-f": "Nidoran♀",
  "nidoran-m": "Nidoran♂",
  "mr-mime": "Mr. Mime",
  farfetchd: "Farfetch'd",
};

const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

/** PokéAPI slug → display name ("nidoran-f" → "Nidoran♀", "pikachu" → "Pikachu"). */
export function formatPokemonName(slug: string) {
  return SPECIAL_NAMES[slug] ?? slug.split("-").map(capitalize).join(" ");
}

const SPRITES_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/** Static 96×96 front sprite; the URL follows the dex id, so no request is needed. */
export function staticSpriteUrl(id: number) {
  return `${SPRITES_BASE_URL}/${id}.png`;
}

const CRIES_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest";

/**
 * The cry (Ogg Vorbis) PokéAPI lists as `cries.latest`. Built from the dex id,
 * so a silhouette tap can play it before the detail request returns.
 */
export function cryUrl(id: number) {
  return `${CRIES_BASE_URL}/${id}.ogg`;
}

// Stamp book artwork. These URLs are built from the dex id instead of read from
// PokéAPI's `sprites.other` because, for Gen 1, they follow a fixed pattern in
// the sprites repo: building them costs no requests, no Zod schema and no
// cache layer for 151 Pokémon. If a file is ever missing, the stamp falls back
// from the dream world SVG to the official artwork, then to its dex number.

/** Dream world vector artwork (an SVG); the stamp's silhouette mask. */
export function dreamWorldSpriteUrl(id: number) {
  return `${SPRITES_BASE_URL}/other/dream-world/${id}.svg`;
}

/** Official artwork (a PNG); the stamp's fallback mask. */
export function officialArtworkUrl(id: number) {
  return `${SPRITES_BASE_URL}/other/official-artwork/${id}.png`;
}

/**
 * A generic trainer-class sprite from Pokémon Showdown (80×80 pixel art), for
 * the explorer's ID-card photo. PokéAPI's sprite repo has no people. The three
 * the intro uses are served from `public/trainers/`, so the intro never
 * depends on hotlinking a third-party host.
 */
export function trainerSpriteUrl(trainerClass: string) {
  return `/trainers/${trainerClass}.png`;
}

/** "#025": dex number padded to Gen 1's three digits. */
export function formatDexNumber(id: number) {
  return `#${String(id).padStart(3, "0")}`;
}

/** DOM id of a Pokémon's map marker, so the detail panel can return focus to it. */
export function pokemonMarkerDomId(id: number) {
  return `pokemon-marker-${id}`;
}

/**
 * Flavour text comes with the games' hard line breaks, form feeds and soft
 * hyphens; this joins it into one clean line.
 */
export function normalizeFlavorText(text: string) {
  return text
    .replace(/­\n/g, "")
    .replace(/[\f\n\r\t\v ]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Spanish labels for the six base stats, in PokéAPI order. */
export const STAT_LABELS = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. esp.",
  "special-defense": "Def. esp.",
  speed: "Velocidad",
} as const satisfies Record<StatName, string>;

/** Margin note for a Pokémon's strongest stat, in the journal's voice. */
export const STRENGTH_NOTES = {
  hp: "Aguanta muchísimo",
  attack: "Pega muy fuerte",
  defense: "Duro como una roca",
  "special-attack": "Poderes especiales temibles",
  "special-defense": "Resiste ataques especiales",
  speed: "Rápido como el viento",
} as const satisfies Record<StatName, string>;

interface BaseStat {
  name: StatName;
  value: number;
}

/** Sum of the six base stats. */
export function statTotal(stats: readonly BaseStat[]) {
  return stats.reduce((sum, stat) => sum + stat.value, 0);
}

/** The highest base stat; ties go to the first in PokéAPI order. */
export function strongestStat(stats: readonly BaseStat[]) {
  return stats.reduce<BaseStat | undefined>(
    (best, stat) =>
      best === undefined || stat.value > best.value ? stat : best,
    undefined,
  );
}

/** Highest base stat in the games (Blissey's HP), so bars share one scale. */
export const MAX_BASE_STAT = 255;

const decimalFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

/** PokéAPI height in decimetres → "0,4 m". */
export function formatHeight(heightDm: number) {
  return `${decimalFormatter.format(heightDm / 10)} m`;
}

/** PokéAPI weight in hectograms → "6 kg". */
export function formatWeight(weightHg: number) {
  return `${decimalFormatter.format(weightHg / 10)} kg`;
}
