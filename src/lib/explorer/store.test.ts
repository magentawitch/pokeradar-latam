import { describe, expect, it } from "vitest";
import {
  DEFAULT_EXPLORER_NAME,
  normalizeExplorerName,
  parseExplorer,
} from "./store";

const VALID = {
  name: "Ash",
  avatarId: "hiker",
  startedAt: "2026-11-19T12:00:00.000Z",
};

describe("parseExplorer", () => {
  it("reads back a stored explorer", () => {
    expect(parseExplorer(JSON.stringify(VALID))).toEqual(VALID);
  });

  it.each([
    ["missing", null],
    ["not JSON", "{oops"],
    ["an unknown avatar", JSON.stringify({ ...VALID, avatarId: "ash" })],
    ["a blank name", JSON.stringify({ ...VALID, name: "   " })],
    [
      "a name over 20 chars",
      JSON.stringify({ ...VALID, name: "x".repeat(21) }),
    ],
    ["a bad date", JSON.stringify({ ...VALID, startedAt: "ayer" })],
  ])("reads %s as no explorer", (_, raw) => {
    expect(parseExplorer(raw)).toBeNull();
  });
});

describe("normalizeExplorerName", () => {
  it("falls back to the default for a blank name", () => {
    expect(normalizeExplorerName("   ")).toBe(DEFAULT_EXPLORER_NAME);
  });

  it("trims and caps the name at 20 characters", () => {
    expect(normalizeExplorerName("  Misty  ")).toBe("Misty");
    expect(normalizeExplorerName("a".repeat(30))).toHaveLength(20);
  });
});
