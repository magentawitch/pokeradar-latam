import { kmOffset } from "@/lib/map/mercator";
import type { LngLat } from "./types";

/** Time for the sweep arm to go once around; every marker appears within it. */
export const SWEEP_DURATION_MS = 1600;

/**
 * Clockwise bearing from north of `position` seen from `center`, in [0, 2π).
 * Uses a local km offset, so longitude is scaled by cos(latitude).
 */
export function bearingFrom(center: LngLat, position: LngLat) {
  const offset = kmOffset(center, position);
  const bearing = Math.atan2(offset.x, offset.y);
  return bearing < 0 ? bearing + 2 * Math.PI : bearing;
}

/**
 * Orders a location's entries for the sweep: clockwise from north around the
 * centre, matching the drafting-compass arm. Rank `r` of `n` appears at
 * `r / n × duration`, so the whole reveal fits the budget whatever `n` is.
 * Positions are reused as they are; nothing is moved.
 */
export function revealOrder<Entry extends { position: LngLat }>(
  entries: readonly Entry[],
  center: LngLat,
  durationMs: number = SWEEP_DURATION_MS,
): { entry: Entry; delayMs: number }[] {
  const count = entries.length;
  return entries
    .map((entry) => ({ entry, bearing: bearingFrom(center, entry.position) }))
    .sort((first, second) => first.bearing - second.bearing)
    .map(({ entry }, rank) => ({
      entry,
      delayMs: (rank / count) * durationMs,
    }));
}
