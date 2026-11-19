import { describe, expect, it } from "vitest";
import {
  historyActionFor,
  parsePokemonParam,
  urlWithPokemon,
} from "./selectionHelpers";

const ROSTER_IDS = new Set([1, 25, 151]);

describe("parsePokemonParam", () => {
  it("accepts a dex id that is on the map", () => {
    expect(parsePokemonParam("25", ROSTER_IDS)).toBe(25);
    expect(parsePokemonParam("151", ROSTER_IDS)).toBe(151);
  });

  it.each([null, "", "abc", "2.5", "-1", "25x", " 25", "1e2", "152", "0"])(
    "rejects %j",
    (raw) => {
      expect(parsePokemonParam(raw, ROSTER_IDS)).toBeNull();
    },
  );
});

describe("urlWithPokemon", () => {
  it("sets, replaces and removes the param, keeping the rest of the URL", () => {
    expect(urlWithPokemon("https://x.dev/?lang=es#mapa", 25)).toBe(
      "/?lang=es&pokemon=25#mapa",
    );
    expect(urlWithPokemon("https://x.dev/?pokemon=25&lang=es", 7)).toBe(
      "/?pokemon=7&lang=es",
    );
    expect(urlWithPokemon("https://x.dev/?pokemon=25&lang=es", null)).toBe(
      "/?lang=es",
    );
    expect(urlWithPokemon("https://x.dev/?pokemon=25", null)).toBe("/");
  });
});

describe("historyActionFor", () => {
  it("pushes when opening the panel", () => {
    expect(historyActionFor(null, false, { kind: "select", id: 25 })).toEqual({
      kind: "push",
      id: 25,
    });
  });

  it("replaces when switching Pokémon with the panel open", () => {
    expect(historyActionFor(25, true, { kind: "select", id: 7 })).toEqual({
      kind: "replace",
      id: 7,
    });
    expect(historyActionFor(25, false, { kind: "select", id: 7 })).toEqual({
      kind: "replace",
      id: 7,
    });
  });

  it("does nothing when selecting the Pokémon already open", () => {
    expect(historyActionFor(25, true, { kind: "select", id: 25 })).toEqual({
      kind: "none",
    });
  });

  it("goes back over its own entry when closing", () => {
    expect(historyActionFor(25, true, { kind: "close" })).toEqual({
      kind: "back",
    });
  });

  it("replaces without the param when closing a shared link", () => {
    expect(historyActionFor(25, false, { kind: "close" })).toEqual({
      kind: "replace",
      id: null,
    });
  });

  it("does nothing when closing with nothing open", () => {
    expect(historyActionFor(null, false, { kind: "close" })).toEqual({
      kind: "none",
    });
  });
});
