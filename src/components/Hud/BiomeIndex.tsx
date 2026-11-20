import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BIOMES, getBiome, HABITAT_LABELS } from "@/lib/biomes/biomes";
import { groupBiomesByRegion } from "@/lib/biomes/regions";
import type { BiomeConfig, BiomeId, BiomeRoster } from "@/lib/biomes/types";

interface BiomeIndexProps {
  roster: BiomeRoster;
  activeBiomeId: BiomeId | null;
  onSelect: (biome: BiomeConfig) => void;
}

const REGION_GROUPS = groupBiomesByRegion(BIOMES);

/**
 * Every destination as a keyboard-friendly list, one collapsible section per
 * region; picking one flies there. Sections start collapsed, except the one
 * holding the destination on screen. Each row names its habitat in text, with
 * the habitat's colour as a dot beside the place.
 */
export function BiomeIndex({
  roster,
  activeBiomeId,
  onSelect,
}: BiomeIndexProps) {
  const activeRegion = getBiome(activeBiomeId)?.region;

  return (
    <Accordion
      type="multiple"
      defaultValue={activeRegion ? [activeRegion] : []}
      className="gap-1"
    >
      {REGION_GROUPS.map((group) => (
        <AccordionItem
          key={group.id}
          value={group.id}
          className="border-border not-last:border-b"
        >
          <AccordionTrigger className="items-center gap-3 rounded-md px-2.5 py-3 font-display text-base font-semibold text-ink hover:bg-muted hover:no-underline">
            <span className="flex-1">{group.label}</span>
            <span className="font-mono text-xs font-normal text-ink-muted">
              {group.biomes.length}
              <span className="sr-only"> destinos</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <ul aria-label={group.label} className="flex flex-col gap-0.5">
              {group.biomes.map((biome) => (
                <li key={biome.id}>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-3 py-2 text-left aria-[current]:bg-muted"
                    aria-current={
                      biome.id === activeBiomeId ? "location" : undefined
                    }
                    onClick={() => onSelect(biome)}
                  >
                    <span
                      aria-hidden="true"
                      className="border-(color:--habitat-ink) bg-(--habitat-fill) size-3.5 shrink-0 rounded-full border-[3px]"
                      data-habitat={biome.habitat}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-ink">{biome.place}</span>
                      <span className="truncate text-xs font-normal text-ink-muted">
                        {biome.country} · {HABITAT_LABELS[biome.habitat]}
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
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
