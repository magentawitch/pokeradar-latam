import { describe, expect, it } from "vitest";
import { parseDiscoveries, serializeDiscoveries } from "./store";

describe("parseDiscoveries", () => {
  it("round-trips serialized discoveries", () => {
    const discoveries = new Map([[25, "2026-11-19T10:00:00.000Z"]]);
    expect(parseDiscoveries(serializeDiscoveries(discoveries))).toEqual(
      discoveries,
    );
  });

  it.each([
    ["missing", null],
    ["corrupt JSON", "{not json"],
    ["an array", "[25]"],
    ["a non-numeric id", '{"pikachu":"2026-11-19T10:00:00.000Z"}'],
    ["a bad date", '{"25":"yesterday"}'],
  ])("reads %s storage as no discoveries", (_, raw) => {
    expect(parseDiscoveries(raw).size).toBe(0);
  });
});
