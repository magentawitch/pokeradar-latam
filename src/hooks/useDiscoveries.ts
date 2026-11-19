"use client";

import { useEffect, useEffectEvent, useSyncExternalStore } from "react";
import {
  getBookOpenedAtServerSnapshot,
  getServerSnapshot,
  getSnapshot,
  readBookOpenedAt,
  recordDiscovery,
  subscribe,
  subscribeToBookOpenedAt,
  subscribeToRecorded,
} from "@/lib/discovery/store";

/**
 * The discovered Pokémon (dex id → ISO date), the single source of truth for
 * the stamp book and every later gamified extra. Empty during the server
 * render and hydration; the stored discoveries arrive right after.
 */
export function useDiscoveries() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** When the stamp book was last opened (ISO), or null; null on the server. */
export function useBookOpenedAt() {
  return useSyncExternalStore(
    subscribeToBookOpenedAt,
    readBookOpenedAt,
    getBookOpenedAtServerSnapshot,
  );
}

/**
 * Opening a Pokémon's card by any route (marker, index, shared link) counts as
 * discovering it. Only writes, so the caller doesn't re-render on discoveries.
 */
export function useRecordDiscovery(id: number | null) {
  useEffect(() => {
    if (id !== null) recordDiscovery(id);
  }, [id]);
}

/** Calls back with the dex id each time a new discovery is recorded here. */
export function useOnDiscoveryRecorded(callback: (id: number) => void) {
  const onRecorded = useEffectEvent(callback);
  useEffect(() => subscribeToRecorded((id) => onRecorded(id)), []);
}
