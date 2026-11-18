"use client";

import Map from "react-map-gl/maplibre";
import { BIOMES } from "@/lib/biomes/biomes";
import type { BiomeRoster } from "@/lib/biomes/types";
import { BiomeMarker } from "./BiomeMarker";

const POSITRON_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// Mexico to Tierra del Fuego, Galápagos to the Brazilian coast.
const LATIN_AMERICA_BOUNDS: [[number, number], [number, number]] = [
  [-118, -56],
  [-34, 33],
];

interface ExpeditionMapProps {
  roster: BiomeRoster;
}

export function ExpeditionMap({ roster }: ExpeditionMapProps) {
  return (
    <Map
      initialViewState={{
        bounds: LATIN_AMERICA_BOUNDS,
        fitBoundsOptions: { padding: 24 },
      }}
      mapStyle={POSITRON_STYLE_URL}
      style={{ position: "absolute", inset: 0 }}
    >
      {BIOMES.map((biome) => (
        <BiomeMarker
          key={biome.id}
          biome={biome}
          pokemonCount={roster[biome.id].length}
        />
      ))}
    </Map>
  );
}
