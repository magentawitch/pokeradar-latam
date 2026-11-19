"use client";

import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import type { BiomeConfig } from "@/lib/biomes/types";
import type { StampCluster } from "@/lib/map/clusters";

interface BiomeClusterMarkerProps {
  cluster: StampCluster<BiomeConfig>;
  pokemonCount: number;
  onSelect: (members: readonly BiomeConfig[]) => void;
}

/**
 * Several nearby destinations as one stamp: a double ink ring with their
 * combined Pokémon count. Picking it zooms in until they separate.
 */
export function BiomeClusterMarker({
  cluster,
  pokemonCount,
  onSelect,
}: BiomeClusterMarkerProps) {
  const [longitude, latitude] = cluster.center;
  const places = cluster.members.map((biome) => biome.place).join(", ");

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <Button
        type="button"
        variant="stamp"
        size="stamp"
        className="border-[4px] border-double text-ink"
        aria-label={`${cluster.members.length} destinos (${places}), ${pokemonCount} Pokémon. Acercar`}
        onClick={() => onSelect(cluster.members)}
      >
        <span aria-hidden="true">{pokemonCount}</span>
      </Button>
    </Marker>
  );
}
