import { Button } from "@/components/ui/button";
import { BIOMES, HABITAT_LABELS } from "@/lib/biomes/biomes";
import type { BiomeConfig, BiomeId, BiomeRoster } from "@/lib/biomes/types";
import type { HabitatName } from "@/lib/pokeapi/schemas";

interface BiomeIndexProps {
  roster: BiomeRoster;
  activeBiomeId: BiomeId | null;
  onSelect: (biome: BiomeConfig) => void;
}

/** Locations grouped by habitat, habitats in the order they first appear in BIOMES. */
const BIOMES_BY_HABITAT = BIOMES.reduce((groups, biome) => {
  groups.set(biome.habitat, [...(groups.get(biome.habitat) ?? []), biome]);
  return groups;
}, new Map<HabitatName, BiomeConfig[]>());

/** Every destination as a keyboard-friendly list, one section per habitat; picking one flies there. */
export function BiomeIndex({
  roster,
  activeBiomeId,
  onSelect,
}: BiomeIndexProps) {
  return (
    <ul aria-label="Destinos" className="flex flex-col gap-4">
      {[...BIOMES_BY_HABITAT].map(([habitat, biomes]) => (
        <li key={habitat} className="flex flex-col gap-0.5">
          <h3
            id={`destinations-${habitat}`}
            className="flex items-center gap-2 px-2.5 text-xs font-semibold text-ink-muted"
          >
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full border-2 border-current"
              style={{ color: `var(--color-biome-${habitat})` }}
            />
            {HABITAT_LABELS[habitat]}
          </h3>
          <ul
            aria-labelledby={`destinations-${habitat}`}
            className="flex flex-col gap-0.5"
          >
            {biomes.map((biome) => (
              <li key={biome.id}>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 py-2 text-left aria-[current]:bg-muted"
                  aria-current={
                    biome.id === activeBiomeId ? "location" : undefined
                  }
                  onClick={() => onSelect(biome)}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-ink">{biome.place}</span>
                    <span className="truncate text-xs font-normal text-ink-muted">
                      {biome.country}
                    </span>
                  </span>
                  <span className="ml-auto font-mono text-xs text-ink-muted">
                    {roster[biome.id].length}
                    <span className="sr-only"> Pokémon</span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
