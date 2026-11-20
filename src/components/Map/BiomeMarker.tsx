"use client";

import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BiomeConfig } from "@/lib/biomes/types";
import { StampProgressRing } from "./StampProgressRing";

interface BiomeMarkerProps {
  biome: BiomeConfig;
  pokemonCount: number;
  /** How many of those Pokémon are discovered. */
  discoveredCount: number;
  onSelect: (biome: BiomeConfig) => void;
}

/**
 * A round stamp with the biome's Pokémon count, ringed by one progress pip
 * per Pokémon. Once every one is discovered, a hand-drawn check replaces
 * the count. The place name shows in a tooltip on hover or focus, and in the
 * destination index.
 */
export function BiomeMarker({
  biome,
  pokemonCount,
  discoveredCount,
  onSelect,
}: BiomeMarkerProps) {
  const [longitude, latitude] = biome.center;
  const isComplete = pokemonCount > 0 && discoveredCount === pokemonCount;
  const progress = isComplete
    ? "todos descubiertos"
    : `${discoveredCount} de ${pokemonCount} descubiertos`;

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="stamp"
            size="stamp"
            data-habitat={biome.habitat}
            className="relative"
            aria-label={`${biome.place}, ${pokemonCount} Pokémon, ${progress}`}
            onClick={() => onSelect(biome)}
          >
            <StampProgressRing
              collected={discoveredCount}
              total={pokemonCount}
            />
            {isComplete ? (
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-4 text-habitat-label"
              >
                <path
                  d="M3.2 8.6 C4.4 9.4 5.4 10.6 6.3 12.2 C7.9 8.4 10.2 5.6 13 3.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span aria-hidden="true" className="text-habitat-label">
                {pokemonCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <span className="font-semibold">{biome.place}</span>
          <span className="text-ink-muted">· {biome.country}</span>
          <span className="font-mono text-ink-muted">
            · {discoveredCount}/{pokemonCount}
          </span>
        </TooltipContent>
      </Tooltip>
    </Marker>
  );
}
