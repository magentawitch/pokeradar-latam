// The explorer store: who is keeping this expedition journal (name, ID-card
// photo, start date), persisted in localStorage. Shaped for useSyncExternalStore like
// the discoveries and sound stores: the server snapshot is "unknown", so
// nothing that depends on storage renders until the client has mounted.
import { z } from "zod";
import { createStorageStore } from "@/lib/storage/createStorageStore";

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

export type AvatarId = (typeof AVATARS)[number]["id"];

const isAvatarId = (value: unknown): value is AvatarId =>
  AVATARS.some((avatar) => avatar.id === value);

export const EXPLORER_NAME_MAX_LENGTH = 20;

/** Used when the explorer leaves the name blank. */
export const DEFAULT_EXPLORER_NAME = "Explorador/a";

export const ExplorerSchema = z.object({
  name: z.string().trim().min(1).max(EXPLORER_NAME_MAX_LENGTH),
  avatarId: z.custom<AvatarId>(isAvatarId),
  startedAt: z.iso.datetime(),
});

export type Explorer = z.infer<typeof ExplorerSchema>;

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

// Re-parsed only when the stored string changes, so the snapshot stays
// referentially stable.
const explorerStore = createStorageStore(EXPLORER_KEY, (raw): ExplorerState => {
  const explorer = parseExplorer(raw);
  return explorer ? { status: "saved", explorer } : NONE;
});

export const getExplorerSnapshot = explorerStore.getSnapshot;

export const getExplorerServerSnapshot = () => UNKNOWN;

/** Notifies on local changes and on changes made in other tabs. */
export const subscribeToExplorer = explorerStore.subscribe;

export function writeExplorer(explorer: Explorer) {
  explorerStore.write(JSON.stringify(explorer));
}
