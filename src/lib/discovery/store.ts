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

/** Records a discovery once; rediscovering keeps the first date. */
export function recordDiscovery(id: number, at: Date = new Date()) {
  const current = getSnapshot();
  if (current.has(id)) return;
  writeRaw(serializeDiscoveries(new Map(current).set(id, at.toISOString())));
  listeners.forEach((listener) => listener());
}

/**
 * When the stamp book was last opened (ISO), or null. Read only from event
 * handlers, never during render.
 */
export function readBookOpenedAt(): string | null {
  try {
    return window.localStorage.getItem(BOOK_OPENED_KEY);
  } catch {
    return null;
  }
}

export function writeBookOpenedAt(at: Date = new Date()) {
  try {
    window.localStorage.setItem(BOOK_OPENED_KEY, at.toISOString());
  } catch {
    // Without storage, every opening animates the session's stamps again.
  }
}
