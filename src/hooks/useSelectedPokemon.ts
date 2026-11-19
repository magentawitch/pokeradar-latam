"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  historyActionFor,
  parsePokemonParam,
  POKEMON_PARAM,
  urlWithPokemon,
  type SelectionChange,
} from "@/utils/selectionHelpers";

/**
 * The selected Pokémon, kept in the URL as `?pokemon=<id>` so a link opens
 * straight to it and the browser's Back button closes the panel. Next.js syncs
 * `history.pushState`/`replaceState` with `useSearchParams`, so the URL is the
 * only state. Must render under a <Suspense> boundary (Cache Components).
 */
export function useSelectedPokemon(rosterIds: ReadonlySet<number>) {
  const searchParams = useSearchParams();
  const rawParam = searchParams.get(POKEMON_PARAM);
  const selectedId = parsePokemonParam(rawParam, rosterIds);
  // Whether the current history entry is one we pushed when opening the panel.
  const didPushEntryRef = useRef(false);

  // A param that isn't a Pokémon on the map is dropped from the URL.
  useEffect(() => {
    if (rawParam !== null && selectedId === null) {
      window.history.replaceState(
        null,
        "",
        urlWithPokemon(window.location.href, null),
      );
    }
  }, [rawParam, selectedId]);

  // Once nothing is selected (closed, or Back pressed) our entry is gone.
  useEffect(() => {
    if (selectedId === null) didPushEntryRef.current = false;
  }, [selectedId]);

  const applyChange = useCallback(
    (change: SelectionChange) => {
      const action = historyActionFor(
        selectedId,
        didPushEntryRef.current,
        change,
      );
      switch (action.kind) {
        case "push":
          window.history.pushState(
            null,
            "",
            urlWithPokemon(window.location.href, action.id),
          );
          didPushEntryRef.current = true;
          break;
        case "replace":
          window.history.replaceState(
            null,
            "",
            urlWithPokemon(window.location.href, action.id),
          );
          break;
        case "back":
          window.history.back();
          break;
        case "none":
          break;
      }
    },
    [selectedId],
  );

  const selectPokemon = useCallback(
    (id: number) => applyChange({ kind: "select", id }),
    [applyChange],
  );
  const closePokemon = useCallback(
    () => applyChange({ kind: "close" }),
    [applyChange],
  );

  return { selectedId, selectPokemon, closePokemon };
}
