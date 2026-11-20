"use client";

import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BiomeConfig } from "@/lib/biomes/types";
import type { StampCluster } from "@/lib/map/clusters";

interface BiomeClusterMarkerProps {
  cluster: StampCluster<BiomeConfig>;
  pokemonCount: number;
  /** How many of those Pokémon are discovered, across the group. */
  discoveredCount: number;
  onSelect: (members: readonly BiomeConfig[]) => void;
}

/**
 * Several nearby destinations as one stamp: a warm ink-brown double ring on cream
 * (no habitat pastel, so it reads as a group) with their combined Pokémon
 * count. Picking it zooms in until they separate.
 */
export function BiomeClusterMarker({
  cluster,
  pokemonCount,
  discoveredCount,
  onSelect,
}: BiomeClusterMarkerProps) {
  const [longitude, latitude] = cluster.center;
  const places = cluster.members.map((biome) => biome.place).join(", ");

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="stamp"
            size="stamp"
            className="border-[3px] border-double border-ink-brown bg-card text-ink-brown"
            aria-label={`${cluster.members.length} destinos (${places}), ${pokemonCount} Pokémon, ${discoveredCount} ${discoveredCount === 1 ? "descubierto" : "descubiertos"}. Acercar`}
            onClick={() => onSelect(cluster.members)}
          >
            <span aria-hidden="true">{pokemonCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {places}
        </TooltipContent>
      </Tooltip>
    </Marker>
  );
}
