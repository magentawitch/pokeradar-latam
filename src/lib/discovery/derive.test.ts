import { describe, expect, it } from "vitest";
import { assignToBiomes } from "@/lib/biomes/assignment";
import { BIOMES } from "@/lib/biomes/biomes";
import { SPECIES_BY_HABITAT } from "@/lib/biomes/gen1Fixture";
import { placeRoster } from "@/lib/biomes/positions";
import {
  discoveredCount,
  formatStampDate,
  freshCountsByHabitat,
  freshStampIds,
  planStamping,
  stampHabitat,
  stampRotation,
  stampSections,
} from "./derive";

const roster = placeRoster(assignToBiomes(SPECIES_BY_HABITAT, BIOMES), BIOMES);

describe("stampRotation", () => {
  const ids = Array.from({ length: 151 }, (_, index) => index + 1);

  it("keeps every tilt within ±4°", () => {
    for (const id of ids) {
      expect(Math.abs(stampRotation(id))).toBeLessThanOrEqual(4);
    }
  });

  it("is stable for the same id", () => {
    expect(stampRotation(25)).toBe(stampRotation(25));
  });

  it("varies between Pokémon and uses both directions", () => {
    const tilts = ids.map(stampRotation);
    expect(new Set(tilts).size).toBeGreaterThan(100);
    expect(tilts.some((tilt) => tilt < -2)).toBe(true);
    expect(tilts.some((tilt) => tilt > 2)).toBe(true);
  });
});

describe("formatStampDate", () => {
  it("formats a local date as YYYY.MM.DD", () => {
    expect(formatStampDate(new Date(2026, 0, 5, 12).toISOString())).toBe(
      "2026.01.05",
    );
  });
});

describe("stampSections", () => {
  const discoveries = new Map([
    [25, "2026-11-19T10:00:00.000Z"],
    [10, "2026-11-18T10:00:00.000Z"],
  ]);
  const sections = stampSections(roster, discoveries);

  it("has one slot per Pokémon, in nine habitat sections", () => {
    expect(sections).toHaveLength(9);
    const ids = sections.flatMap((section) =>
      section.stamps.map((stamp) => stamp.id),
    );
    expect(ids).toHaveLength(151);
    expect(new Set(ids).size).toBe(151);
  });

  it("counts each habitat's progress", () => {
    const forest = sections.find((section) => section.habitat === "forest");
    expect(forest).toMatchObject({ label: "Bosques", collected: 2, total: 21 });
    const sea = sections.find((section) => section.habitat === "sea");
    expect(sea).toMatchObject({ collected: 0, total: 15 });
  });

  it("shortens the long habitat names on the tabs only", () => {
    const rare = sections.find((section) => section.habitat === "rare");
    expect(rare).toMatchObject({
      label: "Avistamientos raros",
      tabLabel: "Raros",
    });
    const rough = sections.find(
      (section) => section.habitat === "rough-terrain",
    );
    expect(rough).toMatchObject({
      label: "Terreno agreste",
      tabLabel: "Agreste",
    });
  });

  it("names the stamp after its location and carries the date", () => {
    const pikachu = sections
      .flatMap((section) => section.stamps)
      .find((stamp) => stamp.id === 25);
    const expectedPlace = BIOMES.find((biome) =>
      roster[biome.id].some((entry) => entry.id === 25),
    )?.place;
    expect(pikachu).toMatchObject({
      place: expectedPlace,
      discoveredAt: "2026-11-19T10:00:00.000Z",
    });
  });

  it("sorts each section by dex number", () => {
    for (const section of sections) {
      const ids = section.stamps.map((stamp) => stamp.id);
      expect(ids).toEqual(ids.toSorted((first, second) => first - second));
    }
  });
});

describe("freshStampIds", () => {
  const discoveries = new Map([
    [1, "2026-11-18T10:00:00.000Z"],
    [4, "2026-11-19T10:00:00.000Z"],
  ]);

  it("returns only stamps earned after the last opening", () => {
    expect([...freshStampIds(discoveries, "2026-11-18T12:00:00.000Z")]).toEqual(
      [4],
    );
  });

  it("treats every stamp as new when the book was never opened", () => {
    expect([...freshStampIds(discoveries, null)]).toEqual([1, 4]);
  });
});

describe("planStamping", () => {
  const sections = stampSections(
    roster,
    new Map([
      [25, "2026-11-19T10:00:00.000Z"],
      [10, "2026-11-19T10:00:00.000Z"],
      [129, "2026-11-19T10:00:00.000Z"],
    ]),
  );

  it("opens on the first page with a fresh stamp and staggers each page from the start", () => {
    const plan = planStamping(sections, new Set([25, 10]));
    // Orillas is page 1 (index 0); Caterpie and Pikachu are in Bosques.
    expect(plan.firstPageIndex).toBe(1);
    expect(plan.delays.get(10)).toBeCloseTo(0.2);
    expect(plan.delays.get(25)).toBeCloseTo(0.32);
    expect(plan.delays.has(129)).toBe(false);
  });

  it("restarts the stagger on every page", () => {
    const plan = planStamping(sections, new Set([25, 129]));
    expect(plan.firstPageIndex).toBe(0);
    expect(plan.delays.get(129)).toBeCloseTo(0.2);
    expect(plan.delays.get(25)).toBeCloseTo(0.2);
  });

  it("has no page to open on without fresh stamps", () => {
    expect(planStamping(sections, new Set()).firstPageIndex).toBeNull();
  });
});

const RARE_IDS = [144, 145, 146, 150, 151];
const rareSection = (discoveries: Map<number, string>) =>
  stampSections(roster, discoveries).find(
    (section) => section.habitat === "rare",
  );

describe("completed pages", () => {
  const fullRare = new Map(
    RARE_IDS.map((id, day) => [id, `2026-11-1${day}T10:00:00.000Z`]),
  );

  it("dates a full page by its last stamp, however they're ordered", () => {
    expect(rareSection(fullRare)?.completedAt).toBe("2026-11-14T10:00:00.000Z");
  });

  it("leaves a page one stamp short incomplete", () => {
    const missingMew = new Map(fullRare);
    missingMew.delete(151);
    expect(rareSection(missingMew)?.completedAt).toBeNull();
  });

  it("presses the seal of a page the fresh stamps completed, after its last stamp", () => {
    const sections = stampSections(roster, fullRare);
    const plan = planStamping(sections, new Set([150, 151]));
    expect(plan.delays.get(151)).toBeCloseTo(0.32);
    expect(plan.sealDelays.get("rare")).toBeCloseTo(0.82);
    expect(plan.sealDelays.size).toBe(1);
  });

  it("doesn't press it again once the page's stamps are no longer fresh", () => {
    const sections = stampSections(roster, fullRare);
    expect(planStamping(sections, new Set([25])).sealDelays.has("rare")).toBe(
      false,
    );
  });
});

describe("discoveredCount", () => {
  it("counts only the given Pokémon that are discovered", () => {
    const discoveries = new Map([
      [144, "2026-11-19T10:00:00.000Z"],
      [25, "2026-11-19T10:00:00.000Z"],
    ]);
    expect(
      discoveredCount(
        RARE_IDS.map((id) => ({ id })),
        discoveries,
      ),
    ).toBe(1);
  });
});

describe("freshCountsByHabitat", () => {
  const sections = stampSections(roster, new Map());

  it("counts the fresh stamps of each page that has any, in page order", () => {
    // Magikarp is in Orillas; Caterpie and Pikachu in Bosques.
    expect([...freshCountsByHabitat(sections, new Set([25, 10, 129]))]).toEqual(
      [
        ["waters-edge", 1],
        ["forest", 2],
      ],
    );
  });

  it("is empty without fresh stamps", () => {
    expect(freshCountsByHabitat(sections, new Set()).size).toBe(0);
  });
});

describe("stampHabitat", () => {
  const sections = stampSections(roster, new Map());

  it("finds the page holding a Pokémon's stamp", () => {
    expect(stampHabitat(sections, 25)).toBe("forest");
    expect(stampHabitat(sections, 129)).toBe("waters-edge");
  });

  it("is null for a Pokémon outside the roster", () => {
    expect(stampHabitat(sections, 999)).toBeNull();
  });
});
