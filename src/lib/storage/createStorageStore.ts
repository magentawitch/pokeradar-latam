// A value persisted under one localStorage key, shaped for
// useSyncExternalStore (getSnapshot, subscribe). The discoveries, explorer
// and sound stores are each built on one of these.
//
// - When storage is unavailable (blocked, private mode, quota), writes still
//   last for the session in memory.
// - Snapshots are re-parsed only when the raw stored string changes, so
//   useSyncExternalStore gets the same object back until the data changes.
// - Subscribers hear writes from this tab and from other tabs (`storage`).

export interface StorageStore<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  /** Stores the raw string and notifies subscribers. */
  write: (raw: string) => void;
}

/** `parse` turns the raw stored string (null when missing) into the value. */
export function createStorageStore<T>(
  key: string,
  parse: (raw: string | null) => T,
): StorageStore<T> {
  let memoryFallback: string | null = null;
  let hasCache = false;
  let cachedRaw: string | null = null;
  let cachedValue: T;
  const listeners = new Set<() => void>();

  const readRaw = () => {
    try {
      return window.localStorage.getItem(key) ?? memoryFallback;
    } catch {
      return memoryFallback;
    }
  };

  const getSnapshot = () => {
    const raw = readRaw();
    if (!hasCache || raw !== cachedRaw) {
      hasCache = true;
      cachedRaw = raw;
      cachedValue = parse(raw);
    }
    return cachedValue;
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const handleStorage = (event: StorageEvent) => {
      // A null key means another tab cleared all of storage.
      if (event.key === key || event.key === null) listener();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  };

  const write = (raw: string) => {
    memoryFallback = raw;
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      // Kept in memory only, for the session.
    }
    listeners.forEach((listener) => listener());
  };

  return { getSnapshot, subscribe, write };
}
