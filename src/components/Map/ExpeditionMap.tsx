"use client";

import { useCallback, useMemo, useState, type RefObject } from "react";
import { useReducedMotion } from "motion/react";
import { setWorkerUrl, type TransformStyleFunction } from "maplibre-gl";
import Map, {
  type MapEvent,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { BIOMES, getBiome } from "@/lib/biomes/biomes";
import { revealOrder } from "@/lib/biomes/revealOrder";
import type { BiomeConfig, BiomeId, BiomeRoster } from "@/lib/biomes/types";
import { discoveredCount } from "@/lib/discovery/derive";
import {
  createLatAmConstrain,
  INITIAL_BOUNDS,
  INITIAL_PADDING,
  MIN_ZOOM,
} from "@/lib/map/camera";
import { clusterStamps } from "@/lib/map/clusters";
import { DOODLE_MAX_ZOOM, DOODLES } from "@/lib/map/doodles";
import {
  POSITRON_STYLE_URL,
  toExpeditionStyle,
} from "@/lib/map/expeditionStyle";
import { BiomeClusterMarker } from "./BiomeClusterMarker";
import { BiomeMarker } from "./BiomeMarker";
import { MapDoodle } from "./MapDoodle";
import { PokemonMarker } from "./PokemonMarker";
import { RevealSweep } from "./RevealSweep";

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
  mapRef: RefObject<MapRef | null>;
  activeBiomeId: BiomeId | null;
  onBiomeSelect: (biome: BiomeConfig) => void;
  /** A group of overlapping stamps was picked. */
  onClusterSelect: (members: readonly BiomeConfig[]) => void;
  onMoveEnd: (event: ViewStateChangeEvent) => void;
  selectedPokemonId: number | null;
  onPokemonSelect: (id: number) => void;
  onPokemonDeselect: () => void;
  /** Fires once the style has loaded and the camera can move. */
  onReady: () => void;
}

export function ExpeditionMap({
  roster,
  mapRef,
  activeBiomeId,
  onBiomeSelect,
  onClusterSelect,
  onMoveEnd,
  selectedPokemonId,
  onPokemonSelect,
  onPokemonDeselect,
  onReady,
}: ExpeditionMapProps) {
  const reduceMotion = useReducedMotion();
  const discoveries = useDiscoveries();
  const activeBiome = getBiome(activeBiomeId);

  // Angular order around the centre. DOM order follows it too, so Tab walks
  // the markers clockwise, the same way the sweep revealed them.
  const revealedPokemon = useMemo(
    () =>
      activeBiome
        ? revealOrder(roster[activeBiome.id], activeBiome.center)
        : [],
    [activeBiome, roster],
  );

  // Regrouped when the camera comes to rest, so stamps don't reshuffle mid-zoom.
  const [zoom, setZoom] = useState<number | null>(null);
  const stamps = useMemo(
    () =>
      zoom === null
        ? []
        : clusterStamps(
            BIOMES.filter((biome) => biome.id !== activeBiomeId),
            zoom,
          ),
    [zoom, activeBiomeId],
  );

  // Doodles decorate the continental view; they'd float oddly over a location.
  const showDoodles =
    zoom !== null && zoom <= DOODLE_MAX_ZOOM && activeBiomeId === null;

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      setZoom(event.viewState.zoom);
      onMoveEnd(event);
    },
    [onMoveEnd],
  );

  const handleLoad = useCallback(
    (event: MapEvent) => {
      const map = event.target;
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      map.setTransformConstrain(
        createLatAmConstrain(() => {
          const container = map.getContainer();
          return {
            width: container.clientWidth,
            height: container.clientHeight,
          };
        }),
      );
      setZoom(map.getZoom());
      onReady();
    },
    [onReady],
  );

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        bounds: INITIAL_BOUNDS,
        fitBoundsOptions: { padding: INITIAL_PADDING },
      }}
      mapStyle={POSITRON_STYLE_URL}
      transformStyle={transformStyle}
      minZoom={MIN_ZOOM}
      maxPitch={0}
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      onLoad={handleLoad}
      onMoveEnd={handleMoveEnd}
      style={{ position: "absolute", inset: 0 }}
    >
      {showDoodles &&
        DOODLES.map((doodle) => <MapDoodle key={doodle.id} doodle={doodle} />)}
      {stamps.map((stamp) => {
        const [onlyBiome] = stamp.members;
        if (stamp.members.length === 1 && onlyBiome) {
          return (
            <BiomeMarker
              key={stamp.key}
              biome={onlyBiome}
              pokemonCount={roster[onlyBiome.id].length}
              discoveredCount={discoveredCount(
                roster[onlyBiome.id],
                discoveries,
              )}
              onSelect={onBiomeSelect}
            />
          );
        }
        return (
          <BiomeClusterMarker
            key={stamp.key}
            cluster={stamp}
            pokemonCount={stamp.members.reduce(
              (sum, biome) => sum + roster[biome.id].length,
              0,
            )}
            discoveredCount={stamp.members.reduce(
              (sum, biome) =>
                sum + discoveredCount(roster[biome.id], discoveries),
              0,
            )}
            onSelect={onClusterSelect}
          />
        );
      })}
      {activeBiome && !reduceMotion && (
        <RevealSweep key={activeBiome.id} biome={activeBiome} />
      )}
      {activeBiome &&
        revealedPokemon.map(({ entry, delayMs }, index) => (
          <PokemonMarker
            key={entry.id}
            entry={entry}
            revealDelayMs={delayMs}
            isSelected={entry.id === selectedPokemonId}
            isDiscovered={discoveries.has(entry.id)}
            place={activeBiome.place}
            order={index + 1}
            total={revealedPokemon.length}
            onSelect={onPokemonSelect}
            onDeselect={onPokemonDeselect}
          />
        ))}
    </Map>
  );
}
