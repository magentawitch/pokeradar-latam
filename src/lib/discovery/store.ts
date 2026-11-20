// The discoveries store: which Pokémon the user has discovered, and when,
// persisted in localStorage. Shaped for useSyncExternalStore (subscribe,
// getSnapshot, getServerSnapshot), so nothing reads storage during the server
// render and hydration starts from the same empty snapshot on both sides.
import { z } from "zod";
import { createStorageStore } from "@/lib/storage/createStorageStore";

/** Dex id → ISO timestamp of the discovery. */
export type Discoveries = ReadonlyMap<number, string>;

const DISCOVERIES_KEY = "pokeradar:discoveries:v1";
const BOOK_OPENED_KEY = "pokeradar:stamp-book-opened-at:v1";

const EMPTY: Discoveries = new Map();

const StoredDiscoveriesSchema = z.record(
  z.string().regex(/^\d+$/),
  z.iso.datetime(),
);

/** Parses the stored JSON; anything missing or malformed reads as no discoveries. */
export function parseDiscoveries(raw: string | null): Discoveries {
  if (raw === null) return EMPTY;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  const result = StoredDiscoveriesSchema.safeParse(json);
  if (!result.success) return EMPTY;
  return new Map(
    Object.entries(result.data).map(([id, date]) => [Number(id), date]),
  );
}

export function serializeDiscoveries(discoveries: Discoveries) {
  return JSON.stringify(Object.fromEntries(discoveries));
}

const discoveriesStore = createStorageStore(DISCOVERIES_KEY, parseDiscoveries);

export const getSnapshot = discoveriesStore.getSnapshot;

export const getServerSnapshot = (): Discoveries => EMPTY;

/** Notifies on local discoveries and on discoveries made in other tabs. */
export const subscribe = discoveriesStore.subscribe;

const recordedListeners = new Set<(id: number) => void>();

/**
 * Fires only when a new discovery is recorded in this tab, never for the
 * stored ones arriving after hydration or for other tabs: the moment for
 * feedback like the stamp-book pill's press.
 */
export function subscribeToRecorded(listener: (id: number) => void) {
  recordedListeners.add(listener);
  return () => {
    recordedListeners.delete(listener);
  };
}

/** Reads the store without subscribing: for event handlers. */
export function isDiscovered(id: number) {
  return getSnapshot().has(id);
}

/** Records a discovery once; rediscovering keeps the first date. */
export function recordDiscovery(id: number, at: Date = new Date()) {
  const current = getSnapshot();
  if (current.has(id)) return;
  discoveriesStore.write(
    serializeDiscoveries(new Map(current).set(id, at.toISOString())),
  );
  recordedListeners.forEach((listener) => listener(id));
}

// When the stamp book was last opened (ISO), or null: what counts as a new
// stamp. Also a useSyncExternalStore store, so the pill's badge clears the
// moment the book opens. A string, so the snapshot is stable by value.
const bookOpenedStore = createStorageStore(BOOK_OPENED_KEY, (raw) => raw);

export const readBookOpenedAt = bookOpenedStore.getSnapshot;

export const getBookOpenedAtServerSnapshot = (): string | null => null;

export const subscribeToBookOpenedAt = bookOpenedStore.subscribe;

export function writeBookOpenedAt(at: Date = new Date()) {
  bookOpenedStore.write(at.toISOString());
}
