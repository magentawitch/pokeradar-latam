// The explorer store: who is keeping this expedition journal (name, ID-card
// photo, start date), persisted in localStorage. Shaped for useSyncExternalStore like
// the discoveries and sound stores: the server snapshot is "unknown", so
// nothing that depends on storage renders until the client has mounted.
import { z } from "zod";

const EXPLORER_KEY = "pokeradar:explorer:v1";

/**
 * ID-card photos: generic trainer classes from Pokémon Showdown's trainer
 * sprites (PokéAPI has no people), chosen for an explorer's look. The id is
 * the sprite's file name; the label is the class's Spanish name.
 */
export const AVATARS = [
  { id: "backpackerf", label: "Mochilera" },
  { id: "backpacker", label: "Mochilero" },
  { id: "hiker", label: "Montañero" },
] as const;

export const AVATAR_IDS = ["backpackerf", "backpacker", "hiker"] as const;

export const EXPLORER_NAME_MAX_LENGTH = 20;

/** Used when the explorer leaves the name blank. */
export const DEFAULT_EXPLORER_NAME = "Explorador/a";

export const ExplorerSchema = z.object({
  name: z.string().trim().min(1).max(EXPLORER_NAME_MAX_LENGTH),
  avatarId: z.enum(AVATAR_IDS),
  startedAt: z.iso.datetime(),
});

export type Explorer = z.infer<typeof ExplorerSchema>;
export type AvatarId = Explorer["avatarId"];

export type ExplorerState =
  | { status: "unknown" }
  | { status: "none" }
  | { status: "saved"; explorer: Explorer };

const UNKNOWN: ExplorerState = { status: "unknown" };
const NONE: ExplorerState = { status: "none" };

/** Parses the stored JSON; anything missing or malformed reads as no explorer. */
export function parseExplorer(raw: string | null): Explorer | null {
  if (raw === null) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = ExplorerSchema.safeParse(json);
  return result.success ? result.data : null;
}

/** A blank name falls back to the default; longer names are cut to fit. */
export function normalizeExplorerName(name: string) {
  const trimmed = name.trim().slice(0, EXPLORER_NAME_MAX_LENGTH).trim();
  return trimmed === "" ? DEFAULT_EXPLORER_NAME : trimmed;
}

// When storage is unavailable, the explorer still lasts for the session.
let memoryFallback: string | null = null;

function readRaw() {
  try {
    return window.localStorage.getItem(EXPLORER_KEY) ?? memoryFallback;
  } catch {
    return memoryFallback;
  }
}

// Snapshots must be referentially stable, so re-parse only when the raw
// stored string changes.
let cachedRaw: string | null | undefined;
let cachedState: ExplorerState = NONE;

export function getExplorerSnapshot(): ExplorerState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    const explorer = parseExplorer(raw);
    cachedState = explorer ? { status: "saved", explorer } : NONE;
  }
  return cachedState;
}

export const getExplorerServerSnapshot = () => UNKNOWN;

const listeners = new Set<() => void>();

/** Notifies on local changes and on changes made in other tabs. */
export function subscribeToExplorer(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === EXPLORER_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function writeExplorer(explorer: Explorer) {
  memoryFallback = JSON.stringify(explorer);
  try {
    window.localStorage.setItem(EXPLORER_KEY, memoryFallback);
  } catch {
    // Kept in memory only.
  }
  listeners.forEach((listener) => listener());
}
