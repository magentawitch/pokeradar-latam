"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import { ExpeditionJournal } from "@/components/Expedition/ExpeditionJournal";
import { ExpeditionIntro } from "@/components/Hud/ExpeditionIntro";
import { HintBar } from "@/components/Hud/HintBar";
import { MapFallback } from "@/components/Map/MapFallback";
import { DetailPanel } from "@/components/Panel/DetailPanel";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useCameraPadding } from "@/hooks/useCameraPadding";
import { useSelectedPokemon } from "@/hooks/useSelectedPokemon";
import type { ViewStateChangeEvent } from "react-map-gl/maplibre";
import type { BiomeConfig, BiomeRoster, RosterEntry } from "@/lib/biomes/types";
import { NO_PADDING } from "@/lib/map/reveal";

const ExpeditionMap = dynamic(
  () =>
    import("@/components/Map/ExpeditionMap").then(
      (mapModule) => mapModule.ExpeditionMap,
    ),
  { ssr: false, loading: () => <MapFallback /> },
);

interface ExpeditionAppProps {
  roster: BiomeRoster;
}

export function ExpeditionApp({ roster }: ExpeditionAppProps) {
  const entriesById = useMemo(
    () =>
      new Map<number, RosterEntry>(
        Object.values(roster)
          .flat()
          .map((entry) => [entry.id, entry]),
      ),
    [roster],
  );
  const rosterIds = useMemo(() => new Set(entriesById.keys()), [entriesById]);

  const {
    mapRef,
    activeBiomeId,
    flyToBiome,
    flyToCluster,
    revealPokemon,
    handleMoveEnd: updateActiveBiome,
  } = useMapNavigation();
  const { selectedId, selectPokemon, closePokemon } =
    useSelectedPokemon(rosterIds);
  const getCameraPadding = useCameraPadding();
  const [isMapReady, setIsMapReady] = useState(false);
  const handleMapReady = useCallback(() => setIsMapReady(true), []);
  // The intro note and hint bar show until the user first moves the map or
  // picks a place, and stay out of the way while a Pokémon's card is open.
  const [hasExplored, setHasExplored] = useState(false);
  const showIntro = !hasExplored && selectedId === null;

  const selectedEntry =
    selectedId === null ? null : (entriesById.get(selectedId) ?? null);

  // Whenever the selection changes (a marker, a shared link on load, Back or
  // Forward), make sure its marker is on screen and clear of the panel.
  useEffect(() => {
    if (isMapReady && selectedEntry) {
      revealPokemon(selectedEntry, getCameraPadding());
    }
  }, [isMapReady, selectedEntry, revealPokemon, getCameraPadding]);

  // With the panel open, frame the new location beside it, not under it.
  const handleBiomeSelect = useCallback(
    (biome: BiomeConfig) => {
      setHasExplored(true);
      flyToBiome(biome, selectedId === null ? NO_PADDING : getCameraPadding());
    },
    [flyToBiome, getCameraPadding, selectedId],
  );

  const handleClusterSelect = useCallback(
    (members: readonly BiomeConfig[]) => {
      setHasExplored(true);
      flyToCluster(
        members,
        selectedId === null ? NO_PADDING : getCameraPadding(),
      );
    },
    [flyToCluster, getCameraPadding, selectedId],
  );

  // Only drags and zooms carry an originalEvent; camera flights don't.
  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      if (event.originalEvent) setHasExplored(true);
      updateActiveBiome(event);
    },
    [updateActiveBiome],
  );

  return (
    <>
      <ExpeditionMap
        roster={roster}
        mapRef={mapRef}
        activeBiomeId={activeBiomeId}
        onBiomeSelect={handleBiomeSelect}
        onClusterSelect={handleClusterSelect}
        onMoveEnd={handleMoveEnd}
        selectedPokemonId={selectedId}
        onPokemonSelect={selectPokemon}
        onPokemonDeselect={closePokemon}
        onReady={handleMapReady}
      />
      <ExpeditionJournal
        roster={roster}
        activeBiomeId={activeBiomeId}
        onBiomeSelect={handleBiomeSelect}
      />
      <AnimatePresence>
        {showIntro && <ExpeditionIntro key="intro" />}
      </AnimatePresence>
      <HintBar isVisible={showIntro} />
      <DetailPanel entry={selectedEntry} onClose={closePokemon} />
    </>
  );
}
