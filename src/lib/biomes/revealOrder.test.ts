import { describe, expect, it } from "vitest";
import { BIOMES } from "./biomes";
import { scatterPositions } from "./positions";
import { bearingFrom, revealOrder, SWEEP_DURATION_MS } from "./revealOrder";
import type { LngLat } from "./types";

const amazonia = BIOMES.find((biome) => biome.id === "amazonia");
if (!amazonia) throw new Error("missing biome config");

// Amazonía's five forest Pokémon (locations hold at most five).
const ids = [10, 15, 26, 69, 127];
const entries = scatterPositions(amazonia.center, amazonia.spreadKm, ids).map(
  (position, index) => ({ id: ids[index] ?? 0, position }),
);

describe("bearingFrom", () => {
  const center: LngLat = [-60, -10];
  it("measures clockwise from north", () => {
    expect(bearingFrom(center, [-60, -9])).toBeCloseTo(0);
    expect(bearingFrom(center, [-59, -10])).toBeCloseTo(Math.PI / 2);
    expect(bearingFrom(center, [-60, -11])).toBeCloseTo(Math.PI);
    expect(bearingFrom(center, [-61, -10])).toBeCloseTo((3 * Math.PI) / 2);
  });
});

describe("revealOrder", () => {
  const order = revealOrder(entries, amazonia.center);

  it("is monotonic in bearing from the centre", () => {
    const bearings = order.map(({ entry }) =>
      bearingFrom(amazonia.center, entry.position),
    );
    expect(bearings).toEqual(
      [...bearings].sort((first, second) => first - second),
    );
  });

  it("contains every entry exactly once", () => {
    expect(order).toHaveLength(entries.length);
    expect(order.map(({ entry }) => entry.id).sort((a, b) => a - b)).toEqual(
      [...ids].sort((a, b) => a - b),
    );
  });

  it("spaces delays evenly and finishes inside the 2 s budget", () => {
    const delays = order.map(({ delayMs }) => delayMs);
    expect(delays[0]).toBe(0);
    delays.slice(1).forEach((delay, index) => {
      expect(delay - (delays[index] ?? 0)).toBeCloseTo(
        SWEEP_DURATION_MS / entries.length,
      );
    });
    expect(delays.at(-1)).toBeLessThan(2000);
    expect(SWEEP_DURATION_MS).toBeLessThanOrEqual(2000);
  });

  it("leaves positions unchanged", () => {
    const before = structuredClone(entries);
    const byId = new Map(order.map(({ entry }) => [entry.id, entry.position]));
    for (const entry of before) {
      expect(byId.get(entry.id)).toEqual(entry.position);
    }
    expect(entries).toEqual(before);
  });
});
