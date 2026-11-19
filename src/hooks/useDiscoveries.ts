"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  recordDiscovery,
  subscribe,
} from "@/lib/discovery/store";

/**
 * The discovered Pokémon (dex id → ISO date), the single source of truth for
 * the stamp book and every later gamified extra. Empty during the server
 * render and hydration; the stored discoveries arrive right after.
 */
export function useDiscoveries() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
