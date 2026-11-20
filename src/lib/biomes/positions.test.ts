import { describe, expect, it } from "vitest";
import { kmOffset, pixelOffset } from "@/lib/map/mercator";
import { revealZoomFor } from "@/lib/map/reveal";
import { assignToBiomes, createEmptyRoster } from "./assignment";
import { BIOMES } from "./biomes";
import { SPECIES_BY_HABITAT } from "@/test/gen1Fixture";
import { mulberry32, placeRoster, scatterPositions } from "./positions";
import type { AssignedEntry, BiomeId, LngLat } from "./types";

// Pokémon marker ring diameters (PokemonMarker: size-10, md:size-11).
const PHONE = { width: 375, height: 812, markerPx: 40 };
const DESKTOP = { width: 1440, height: 900, markerPx: 44 };

// The real Gen 1 roster, so the jitter seeds are the ones the app uses.
const roster = placeRoster(assignToBiomes(SPECIES_BY_HABITAT, BIOMES), BIOMES);

const biomeById = (id: BiomeId) => {
  const biome = BIOMES.find((candidate) => candidate.id === id);
  if (!biome) throw new Error(`missing biome config: ${id}`);
  return biome;
};

const positionsOf = (id: BiomeId) => roster[id].map((entry) => entry.position);

const distanceKm = (from: LngLat, to: LngLat) => {
  const offset = kmOffset(from, to);
  return Math.hypot(offset.x, offset.y);
};

const closestPairPx = (positions: readonly LngLat[], zoom: number) => {
  let closest = Infinity;
  positions.forEach((first, index) => {
    for (const second of positions.slice(index + 1)) {
      const offset = pixelOffset(first, second, zoom);
      closest = Math.min(closest, Math.hypot(offset.x, offset.y));
    }
  });
  return closest;
};

describe("mulberry32", () => {
  it("repeats the same sequence for the same seed, and differs across seeds", () => {
    const first = mulberry32(25);
    const second = mulberry32(25);
    const sequence = [first(), first(), first()];
    expect([second(), second(), second()]).toEqual(sequence);
    expect(mulberry32(26)()).not.toBe(sequence[0]);
    for (const value of sequence) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("scatterPositions", () => {
  it("gives identical output on two calls", () => {
    expect(
      placeRoster(assignToBiomes(SPECIES_BY_HABITAT, BIOMES), BIOMES),
    ).toEqual(roster);
  });

  it("depends on the ids, not their input order", () => {
    const iguazu = biomeById("iguazu");
    const ids = roster.iguazu.map((entry) => entry.id);
    const reversed = scatterPositions(
      iguazu.center,
      iguazu.spreadKm,
      [...ids].reverse(),
    );
    expect([...reversed].reverse()).toEqual(positionsOf("iguazu"));
  });

  it("keeps every position within spreadKm of its centre", () => {
    for (const biome of BIOMES) {
      for (const position of positionsOf(biome.id)) {
        expect(distanceKm(biome.center, position)).toBeLessThanOrEqual(
          biome.spreadKm,
        );
      }
    }
  });

  it("never overlaps two markers of a location at reveal zoom, on desktop or phone", () => {
    for (const biome of BIOMES) {
      for (const viewport of [DESKTOP, PHONE]) {
        expect(
          closestPairPx(positionsOf(biome.id), revealZoomFor(biome, viewport)),
          `${biome.id} at ${viewport.width}px`,
        ).toBeGreaterThanOrEqual(viewport.markerPx);
      }
    }
  });
});

describe("placeRoster", () => {
  it("keeps Pampa and Buenos Aires apart: no marker inside the other's spread", () => {
    const pampas = biomeById("pampas");
    const buenosAires = biomeById("buenos-aires");

    for (const position of positionsOf("pampas")) {
      expect(distanceKm(buenosAires.center, position)).toBeGreaterThan(
        buenosAires.spreadKm,
      );
    }
    for (const position of positionsOf("buenos-aires")) {
      expect(distanceKm(pampas.center, position)).toBeGreaterThan(
        pampas.spreadKm,
      );
    }
  });

  it("no two locations' spreads overlap", () => {
    BIOMES.forEach((first, index) => {
      for (const second of BIOMES.slice(index + 1)) {
        expect(
          distanceKm(first.center, second.center),
          `${first.id} / ${second.id}`,
        ).toBeGreaterThan(first.spreadKm + second.spreadKm);
      }
    });
  });

  it("positions every entry and leaves the rest of the entry untouched", () => {
    const assigned = createEmptyRoster<AssignedEntry>();
    const ids = [144, 145, 146, 150, 151];
    assigned.galapagos = ids.map((id) => ({
      id,
      name: `species-${id}`,
      habitat: "rare",
      biomeId: "galapagos",
    }));

    const placed = placeRoster(assigned, BIOMES);
    const galapagos = biomeById("galapagos");

    expect(placed.galapagos).toEqual(
      assigned.galapagos.map((entry) => ({
        ...entry,
        position: expect.any(Array),
      })),
    );
    expect(placed.galapagos.map((entry) => entry.position)).toEqual(
      scatterPositions(galapagos.center, galapagos.spreadKm, ids),
    );
    expect(placed.iguazu).toEqual([]);
  });
});
