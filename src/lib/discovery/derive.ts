// Pure selectors over the discoveries map. No React, no storage.
import { BIOMES, HABITAT_LABELS } from "@/lib/biomes/biomes";
import type { BiomeConfig, BiomeId, BiomeRoster } from "@/lib/biomes/types";
import type { HabitatName } from "@/lib/pokeapi/schemas";
import type { Discoveries } from "./store";

const MAX_STAMP_TILT_DEG = 4;

/**
 * A stamp's tilt in degrees, within ±4°. Hashed from the dex id (Knuth's
 * multiplicative hash) so it looks random but never changes between renders.
 */
export function stampRotation(id: number) {
  const hash = Math.imul(id, 2654435761) >>> 0;
  const unit = (hash % 1001) / 1000; // 0…1
  return Math.round((unit * 2 - 1) * MAX_STAMP_TILT_DEG * 100) / 100;
}

/** "2026.11.19", the date format of a station stamp, in local time. */
export function formatStampDate(iso: string) {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export type StampSlot = {
  id: number;
  name: string;
  habitat: HabitatName;
  place: string;
  /** ISO date; null while the stamp is still to collect. */
  discoveredAt: string | null;
};

export type StampSection = {
  habitat: HabitatName;
  /** Full habitat name: the page title. */
  label: string;
  /** Short name for the narrow divider tab. */
  tabLabel: string;
  collected: number;
  total: number;
  stamps: StampSlot[];
};

/** Tab names: the habitat label, shortened where it's too long for a tab. */
const TAB_LABELS: Record<HabitatName, string> = {
  ...HABITAT_LABELS,
  "rough-terrain": "Agreste",
  rare: "Raros",
};

/** Habitats in the order their locations are configured. */
const HABITAT_ORDER = [...new Set(BIOMES.map((biome) => biome.habitat))];

const BIOMES_BY_ID = new Map<BiomeId, BiomeConfig>(
  BIOMES.map((biome) => [biome.id, biome]),
);

/** Every roster Pokémon as a stamp slot, grouped by habitat with progress. */
export function stampSections(
  roster: BiomeRoster,
  discoveries: Discoveries,
): StampSection[] {
  const entries = Object.values(roster).flat();
  return HABITAT_ORDER.map((habitat) => {
    const stamps = entries
      .filter((entry) => entry.habitat === habitat)
      .toSorted((first, second) => first.id - second.id)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        habitat,
        place:
          BIOMES_BY_ID.get(entry.biomeId)?.place ?? HABITAT_LABELS[habitat],
        discoveredAt: discoveries.get(entry.id) ?? null,
      }));
    return {
      habitat,
      label: HABITAT_LABELS[habitat],
      tabLabel: TAB_LABELS[habitat],
      collected: stamps.filter((stamp) => stamp.discoveredAt !== null).length,
      total: stamps.length,
      stamps,
    };
  });
}

/**
 * Stamps earned since the book was last opened; they get the stamping
 * animation. Never opened: every stamp so far is new.
 */
export function freshStampIds(
  discoveries: Discoveries,
  lastOpenedAt: string | null,
): ReadonlySet<number> {
  const since = lastOpenedAt === null ? -Infinity : Date.parse(lastOpenedAt);
  return new Set(
    [...discoveries]
      .filter(([, date]) => Date.parse(date) > since)
      .map(([id]) => id),
  );
}

/**
 * Habitat → how many fresh stamps its page holds, only for pages with any:
 * the pages to mark as new, in page order.
 */
export function freshCountsByHabitat(
  sections: readonly StampSection[],
  freshIds: ReadonlySet<number>,
): Map<HabitatName, number> {
  const counts = new Map<HabitatName, number>();
  for (const section of sections) {
    const count = section.stamps.filter((stamp) =>
      freshIds.has(stamp.id),
    ).length;
    if (count > 0) counts.set(section.habitat, count);
  }
  return counts;
}

/** The habitat whose page holds this Pokémon's stamp; null if none does. */
export function stampHabitat(
  sections: readonly StampSection[],
  id: number,
): HabitatName | null {
  return (
    sections.find((section) => section.stamps.some((stamp) => stamp.id === id))
      ?.habitat ?? null
  );
}

/** Lets the book open (or the page turn) before the first stamp lands. */
const FIRST_STAMP_DELAY_S = 0.2;
const STAMP_STAGGER_S = 0.12;
const MAX_STAMP_DELAY_S = 1.4;

export type StampingPlan = {
  /** Fresh stamp id → seconds before it's pressed in, staggered per page. */
  delays: ReadonlyMap<number, number>;
  /** The first page with a fresh stamp, where the book opens; null if none. */
  firstPageIndex: number | null;
};

/** Orders the stamping animation of the fresh stamps, page by page. */
export function planStamping(
  sections: readonly StampSection[],
  freshIds: ReadonlySet<number>,
): StampingPlan {
  const delays = new Map<number, number>();
  let firstPageIndex: number | null = null;
  sections.forEach((section, pageIndex) => {
    const fresh = section.stamps.filter((stamp) => freshIds.has(stamp.id));
    if (fresh.length > 0 && firstPageIndex === null) firstPageIndex = pageIndex;
    fresh.forEach((stamp, order) => {
      delays.set(
        stamp.id,
        Math.min(
          FIRST_STAMP_DELAY_S + order * STAMP_STAGGER_S,
          MAX_STAMP_DELAY_S,
        ),
      );
    });
  });
  return { delays, firstPageIndex };
}
