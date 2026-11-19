"use client";

import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BiomeConfig } from "@/lib/biomes/types";

interface BiomeMarkerProps {
  biome: BiomeConfig;
  pokemonCount: number;
  onSelect: (biome: BiomeConfig) => void;
}

/**
 * A round stamp with the biome's Pokémon count. The place name shows in a
 * tooltip on hover or focus, and in the destination index.
 */
export function BiomeMarker({
  biome,
  pokemonCount,
  onSelect,
}: BiomeMarkerProps) {
  const [longitude, latitude] = biome.center;

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="stamp"
            size="stamp"
            data-habitat={biome.habitat}
            aria-label={`${biome.place}, ${pokemonCount} Pokémon`}
            onClick={() => onSelect(biome)}
          >
            <span aria-hidden="true" className="text-habitat-label">
              {pokemonCount}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          <span className="font-semibold">{biome.place}</span>
          <span className="text-ink-muted">· {biome.country}</span>
        </TooltipContent>
      </Tooltip>
    </Marker>
  );
}
