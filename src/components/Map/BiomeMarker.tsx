"use client";

import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import type { BiomeConfig } from "@/lib/biomes/types";
import { MarkerLabel } from "./MarkerLabel";

interface BiomeMarkerProps {
  biome: BiomeConfig;
  pokemonCount: number;
}

export function BiomeMarker({ biome, pokemonCount }: BiomeMarkerProps) {
  const [longitude, latitude] = biome.center;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="top"
      offset={[0, -8]}
    >
      <Button
        type="button"
        variant="stamp"
        size="stamp"
        style={{ color: `var(${biome.accent})` }}
      >
        <MarkerLabel title={biome.place} detail={`${pokemonCount} Pokémon`} />
      </Button>
    </Marker>
  );
}
