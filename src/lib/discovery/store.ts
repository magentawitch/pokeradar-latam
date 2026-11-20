// The discoveries store: which Pokémon the user has discovered, and when,
// persisted in localStorage. Shaped for useSyncExternalStore (subscribe,
// getSnapshot, getServerSnapshot), so nothing reads storage during the server
// render and hydration starts from the same empty snapshot on both sides.
import { z } from "zod";

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

// When storage is unavailable (blocked, private mode, quota), discoveries
// still last for the session in memory.
let memoryFallback: string | null = null;

function readRaw() {
  try {
    return window.localStorage.getItem(DISCOVERIES_KEY) ?? memoryFallback;
  } catch {
    return memoryFallback;
  }
}

function writeRaw(raw: string) {
  memoryFallback = raw;
  try {
    window.localStorage.setItem(DISCOVERIES_KEY, raw);
  } catch {
    // Kept in memory only.
  }
}

// useSyncExternalStore needs the same object back until the data changes.
let cachedRaw: string | null = null;
let cachedSnapshot: Discoveries = EMPTY;

export function getSnapshot(): Discoveries {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parseDiscoveries(raw);
  }
  return cachedSnapshot;
}

export const getServerSnapshot = (): Discoveries => EMPTY;

const listeners = new Set<() => void>();

/** Notifies on local discoveries and on discoveries made in other tabs. */
export function subscribe(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === DISCOVERIES_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

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
  writeRaw(serializeDiscoveries(new Map(current).set(id, at.toISOString())));
  listeners.forEach((listener) => listener());
  recordedListeners.forEach((listener) => listener(id));
}

// When the stamp book was last opened (ISO), or null: what counts as a new
// stamp. Also a useSyncExternalStore store, so the pill's badge clears the
// moment the book opens. A string, so the snapshot is stable by value.
let bookOpenedFallback: string | null = null;

export function readBookOpenedAt(): string | null {
  try {
    return window.localStorage.getItem(BOOK_OPENED_KEY) ?? bookOpenedFallback;
  } catch {
    return bookOpenedFallback;
  }
}

export const getBookOpenedAtServerSnapshot = (): string | null => null;

const bookOpenedListeners = new Set<() => void>();

export function subscribeToBookOpenedAt(listener: () => void) {
  bookOpenedListeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BOOK_OPENED_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    bookOpenedListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function writeBookOpenedAt(at: Date = new Date()) {
  bookOpenedFallback = at.toISOString();
  try {
    window.localStorage.setItem(BOOK_OPENED_KEY, bookOpenedFallback);
  } catch {
    // Kept in memory only, for the session.
  }
  bookOpenedListeners.forEach((listener) => listener());
}
