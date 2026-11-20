"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getExplorerServerSnapshot,
  getExplorerSnapshot,
  normalizeExplorerName,
  subscribeToExplorer,
  writeExplorer,
  type AvatarId,
} from "@/lib/explorer/store";

/**
 * The explorer keeping this journal: `status` is "unknown" during the server
 * render and hydration, then "none" or "saved" (with `explorer`). Meant for
 * later map touches too, e.g. the explorer's name or ID-card photo.
 */
export function useExplorer() {
  const state = useSyncExternalStore(
    subscribeToExplorer,
    getExplorerSnapshot,
    getExplorerServerSnapshot,
  );

  const saveExplorer = useCallback((name: string, avatarId: AvatarId) => {
    writeExplorer({
      name: normalizeExplorerName(name),
      avatarId,
      startedAt: new Date().toISOString(),
    });
  }, []);

  return {
    status: state.status,
    explorer: state.status === "saved" ? state.explorer : null,
    saveExplorer,
  };
}
