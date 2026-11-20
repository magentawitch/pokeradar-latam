"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { BIOMES, getBiome } from "@/lib/biomes/biomes";
import type { BiomeConfig, BiomeId, RosterEntry } from "@/lib/biomes/types";
import { clusterCamera } from "@/lib/map/clusters";
import {
  biomeCamera,
  findRevealedBiome,
  FLY_DURATION_MS,
  isInClearArea,
  NO_PADDING,
  paddedCenter,
  type CameraPadding,
  type Viewport,
} from "@/lib/map/reveal";

/** Short pan that slides a marker out from under the detail panel. */
const PAN_DURATION_MS = 600;
/** How far inside the uncovered area a selected marker must sit (about its size). */
const CLEAR_MARGIN_PX = 32;

const viewportOf = (container: HTMLElement): Viewport => ({
  width: container.clientWidth,
  height: container.clientHeight,
});

/**
 * Owns the map camera: flying to locations and clusters, and bringing a
 * selected Pokémon into view clear of the detail panel.
 *
 * Also tracks the active location, whose Pokémon are on the map. It is decided when the camera
 * comes to rest (never mid-flight, so a flight doesn't flash the locations it
 * passes over): the location nearest the screen centre, once zoomed in past
 * its threshold, or none at continental zoom.
 */
export function useMapNavigation() {
  const mapRef = useRef<MapRef>(null);
  const [activeBiomeId, setActiveBiomeIdState] = useState<BiomeId | null>(null);
  // Mirrors the state for revealPokemon, so it stays stable across reveals
  // and doesn't re-run effects (flying back) whenever the user pans away.
  const activeBiomeIdRef = useRef<BiomeId | null>(null);
  const reduceMotion = useReducedMotion();

  const setActiveBiomeId = useCallback((biomeId: BiomeId | null) => {
    activeBiomeIdRef.current = biomeId;
    setActiveBiomeIdState(biomeId);
  }, []);

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const map = event.target;
      const { lng, lat } = map.getCenter();
      const revealed = findRevealedBiome(
        {
          center: [lng, lat],
          zoom: map.getZoom(),
          viewport: viewportOf(map.getContainer()),
        },
        BIOMES,
      );
      setActiveBiomeId(revealed?.id ?? null);
    },
    [setActiveBiomeId],
  );

  const flyToBiome = useCallback(
    (biome: BiomeConfig, padding: CameraPadding = NO_PADDING) => {
      const map = mapRef.current;
      if (!map) return;

      // Leaving another location: clear its Pokémon now, so the new sweep
      // starts on arrival (moveend) instead of the old markers riding along.
      if (activeBiomeIdRef.current !== biome.id) setActiveBiomeId(null);

      const camera = biomeCamera(
        biome,
        viewportOf(map.getContainer()),
        padding,
      );
      if (reduceMotion) {
        map.jumpTo(camera);
      } else {
        map.flyTo({ ...camera, duration: FLY_DURATION_MS });
      }
    },
    [reduceMotion, setActiveBiomeId],
  );

  /** Zooms in on a group of overlapping stamps until they separate. */
  const flyToCluster = useCallback(
    (members: readonly BiomeConfig[], padding: CameraPadding = NO_PADDING) => {
      const map = mapRef.current;
      if (!map) return;
      const camera = clusterCamera(
        members,
        viewportOf(map.getContainer()),
        padding,
      );
      if (reduceMotion) {
        map.jumpTo(camera);
      } else {
        map.flyTo({ ...camera, duration: FLY_DURATION_MS });
      }
    },
    [reduceMotion],
  );

  /**
   * Brings a selected Pokémon into the part of the screen the panel leaves
   * clear: flies to its location if that isn't revealed, pans if its marker
   * is under the panel, and leaves the camera alone if it's already visible.
   */
  const revealPokemon = useCallback(
    (entry: RosterEntry, padding: CameraPadding) => {
      const map = mapRef.current;
      if (!map) return;

      if (activeBiomeIdRef.current !== entry.biomeId) {
        const biome = getBiome(entry.biomeId);
        if (biome) flyToBiome(biome, padding);
        return;
      }

      const viewport = viewportOf(map.getContainer());
      const [lng, lat] = entry.position;
      const point = map.project([lng, lat]);
      if (isInClearArea(point, viewport, padding, CLEAR_MARGIN_PX)) return;

      const center = paddedCenter(entry.position, map.getZoom(), padding);
      if (reduceMotion) {
        map.jumpTo({ center });
      } else {
        map.easeTo({ center, duration: PAN_DURATION_MS });
      }
    },
    [flyToBiome, reduceMotion],
  );

  return {
    mapRef,
    activeBiomeId,
    flyToBiome,
    flyToCluster,
    revealPokemon,
    handleMoveEnd,
  };
}
