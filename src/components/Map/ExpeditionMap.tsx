"use client";

import { useCallback } from "react";
import { setWorkerUrl, type TransformStyleFunction } from "maplibre-gl";
import Map, { type MapEvent } from "react-map-gl/maplibre";
import { BIOMES } from "@/lib/biomes/biomes";
import type { BiomeRoster } from "@/lib/biomes/types";
import {
  createLatAmConstrain,
  INITIAL_BOUNDS,
  MIN_ZOOM,
} from "@/lib/map/camera";
import {
  POSITRON_STYLE_URL,
  toExpeditionStyle,
} from "@/lib/map/expeditionStyle";
import { BiomeMarker } from "./BiomeMarker";

// MapLibre looks for its worker beside its own bundle chunk, which isn't where
// the bundler puts it. This `new URL` makes the bundler emit the worker as an
// asset and hand back its served URL.
setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href,
);

// Restyles positron after MapLibre fetches it and before the first paint.
const transformStyle: TransformStyleFunction = (_previous, next) =>
  toExpeditionStyle(next);

interface ExpeditionMapProps {
  roster: BiomeRoster;
}

export function ExpeditionMap({ roster }: ExpeditionMapProps) {
  const handleLoad = useCallback((event: MapEvent) => {
    const map = event.target;
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.setTransformConstrain(
      createLatAmConstrain(() => {
        const container = map.getContainer();
        return { width: container.clientWidth, height: container.clientHeight };
      }),
    );
  }, []);

  return (
    <Map
      initialViewState={{
        bounds: INITIAL_BOUNDS,
        fitBoundsOptions: { padding: 24 },
      }}
      mapStyle={POSITRON_STYLE_URL}
      transformStyle={transformStyle}
      minZoom={MIN_ZOOM}
      maxPitch={0}
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      onLoad={handleLoad}
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
