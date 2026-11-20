"use client";

import { useSyncExternalStore } from "react";
import {
  canPlayCries,
  canPlayCriesServerSnapshot,
  getMutedServerSnapshot,
  getMutedSnapshot,
  playCry,
  subscribeToCrySupport,
  subscribeToMuted,
  writeMuted,
} from "@/lib/sound/store";

/**
 * Whether this browser can play the cries (Ogg Vorbis). False during the server
 * render and hydration, so sound controls appear only once support is known.
 */
export function useCanPlayCries() {
  return useSyncExternalStore(
    subscribeToCrySupport,
    canPlayCries,
    canPlayCriesServerSnapshot,
  );
}

/** The persisted mute choice and its setter; false (sound on) on the server. */
export function useSoundMuted() {
  const isMuted = useSyncExternalStore(
    subscribeToMuted,
    getMutedSnapshot,
    getMutedServerSnapshot,
  );
  return [isMuted, writeMuted] as const;
}

/**
 * Plays a Pokémon's cry; call the returned function from a click handler only.
 * It checks mute and support when called, so the caller doesn't re-render when
 * either changes.
 */
export function usePokemonCry() {
  return playCry;
}
