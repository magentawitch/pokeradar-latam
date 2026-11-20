import { describe, expect, it } from "vitest";
import { parseMuted } from "./store";

describe("parseMuted", () => {
  it("mutes only for the stored value written by the toggle", () => {
    expect(parseMuted(String(true))).toBe(true);
    expect(parseMuted(String(false))).toBe(false);
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["corrupt", "yes"],
    ["JSON-ish", '"true"'],
  ])("reads %s storage as sound on", (_, raw) => {
    expect(parseMuted(raw)).toBe(false);
  });
});
