"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ExpeditionJournal } from "@/components/Expedition/ExpeditionJournal";
import { HintBar } from "@/components/Hud/HintBar";
import { ExpeditionIntro } from "@/components/Intro/ExpeditionIntro";
import { MapFallback } from "@/components/Map/MapFallback";
import { DetailPanel } from "@/components/Panel/DetailPanel";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useCameraPadding } from "@/hooks/useCameraPadding";
import { useRecordDiscovery } from "@/hooks/useDiscoveries";
import { usePokemonCry } from "@/hooks/usePokemonCry";
import { useSelectedPokemon } from "@/hooks/useSelectedPokemon";
import type { ViewStateChangeEvent } from "react-map-gl/maplibre";
import type { BiomeConfig, BiomeRoster, RosterEntry } from "@/lib/biomes/types";
import { isDiscovered } from "@/lib/discovery/store";
import { NO_PADDING } from "@/lib/map/reveal";
import { cryUrl } from "@/utils/pokemonHelpers";
import { POKEMON_PARAM } from "@/utils/selectionHelpers";

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
  // Opening a card by any route discovers that Pokémon (its stamp).
  useRecordDiscovery(selectedId);
  const playCry = usePokemonCry();
  // Tapping a silhouette is the discovery moment, so it plays the cry. Only
  // here: a shared link or Back/Forward discovers without a click, and the
  // browser would block the sound anyway.
  const handlePokemonSelect = useCallback(
    (id: number) => {
      if (!isDiscovered(id)) playCry(cryUrl(id));
      selectPokemon(id);
    },
    [playCry, selectPokemon],
  );
  const getCameraPadding = useCameraPadding();
  const [isMapReady, setIsMapReady] = useState(false);
  const handleMapReady = useCallback(() => setIsMapReady(true), []);
  // The field-journal intro covers the map on load. A shared ?pokemon= link
  // skips it, decided once: closing that card later doesn't bring it back.
  const searchParams = useSearchParams();
  const [isIntroShown, setIsIntroShown] = useState(
    () => !searchParams.has(POKEMON_PARAM),
  );
  // MapLibre's WebGL setup blocks the main thread for a moment, and the
  // intro hides the map anyway, so the map mounts only once the explorer gets
  // past the closed cover. Until then the cover paints and responds unhindered.
  const [canStartMap, setCanStartMap] = useState(() => !isIntroShown);
  const startMap = useCallback(() => setCanStartMap(true), []);
  const finishIntro = useCallback(() => {
    setCanStartMap(true);
    setIsIntroShown(false);
  }, []);
  // The hint bar shows after the intro, until the user first moves the map or
  // picks a place, and stays out of the way while a card is open.
  const [hasExplored, setHasExplored] = useState(false);
  const showHint = !isIntroShown && !hasExplored && selectedId === null;

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
      {canStartMap && (
        <ExpeditionMap
          roster={roster}
          mapRef={mapRef}
          activeBiomeId={activeBiomeId}
          onBiomeSelect={handleBiomeSelect}
          onClusterSelect={handleClusterSelect}
          onMoveEnd={handleMoveEnd}
          selectedPokemonId={selectedId}
          onPokemonSelect={handlePokemonSelect}
          onPokemonDeselect={closePokemon}
          onReady={handleMapReady}
        />
      )}
      <ExpeditionJournal
        roster={roster}
        activeBiomeId={activeBiomeId}
        onBiomeSelect={handleBiomeSelect}
      />
      {/* Once the intro is gone, the map's loading state shows until the
          map is ready. It never blocks input. */}
      <AnimatePresence>
        {!isIntroShown && !isMapReady && (
          <motion.div
            key="map-loading"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 z-10"
          >
            <MapFallback />
          </motion.div>
        )}
      </AnimatePresence>
      {isIntroShown && (
        <ExpeditionIntro onEngage={startMap} onFinish={finishIntro} />
      )}
      <HintBar isVisible={showHint} />
      <DetailPanel entry={selectedEntry} onClose={closePokemon} />
    </>
  );
}
