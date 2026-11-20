// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createStorageStore } from "./createStorageStore";

const KEY = "test:store:v1";

const parseList = (raw: string | null): string[] =>
  raw === null ? [] : raw.split(",");

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("createStorageStore", () => {
  it("reads what was written and notifies subscribers", () => {
    const store = createStorageStore(KEY, parseList);
    const listener = vi.fn();
    store.subscribe(listener);

    store.write("a,b");

    expect(store.getSnapshot()).toEqual(["a", "b"]);
    expect(window.localStorage.getItem(KEY)).toBe("a,b");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("returns the same snapshot until the stored string changes", () => {
    const store = createStorageStore(KEY, parseList);
    store.write("a");
    const first = store.getSnapshot();

    expect(store.getSnapshot()).toBe(first);
    store.write("a,b");
    expect(store.getSnapshot()).not.toBe(first);
  });

  it("keeps writes in memory when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const store = createStorageStore(KEY, parseList);

    store.write("a");

    expect(store.getSnapshot()).toEqual(["a"]);
  });

  it("notifies on writes from other tabs for its key only", () => {
    const store = createStorageStore(KEY, parseList);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    window.dispatchEvent(new StorageEvent("storage", { key: "other:key" }));
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
