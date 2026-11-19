"use client";

import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import type { BiomeConfig } from "@/lib/biomes/types";

interface BiomeMarkerProps {
  biome: BiomeConfig;
  pokemonCount: number;
  onSelect: (biome: BiomeConfig) => void;
}

/** A round stamp with the biome's Pokémon count; the place name lives in the destination index. */
export function BiomeMarker({
  biome,
  pokemonCount,
  onSelect,
}: BiomeMarkerProps) {
  const [longitude, latitude] = biome.center;

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <Button
        type="button"
        variant="stamp"
        size="stamp"
        style={{ color: `var(${biome.accent})` }}
        aria-label={`${biome.place}, ${pokemonCount} Pokémon`}
        onClick={() => onSelect(biome)}
      >
        <span aria-hidden="true" className="text-ink">
          {pokemonCount}
        </span>
      </Button>
    </Marker>
  );
}
