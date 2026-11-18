import { describe, expect, it } from "vitest";
import type {
  LayerSpecification,
  StyleSpecification,
} from "react-map-gl/maplibre";
import { MAP_COLORS, toExpeditionStyle } from "./expeditionStyle";

const positronLike = (): StyleSpecification => ({
  version: 8,
  sources: {
    openmaptiles: { type: "vector", url: "https://tiles.example/planet" },
    ne2_shaded: {
      type: "raster",
      tiles: ["https://tiles.example/{z}/{x}/{y}.png"],
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#f2f3f0" },
    },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      paint: { "fill-color": "rgb(194, 200, 202)" },
    },
    {
      id: "highway_major_inner",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
    },
    {
      id: "building",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
    },
    {
      id: "label_city",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      layout: { "text-font": ["Noto Sans Regular"], "text-size": 12 },
      paint: { "text-color": "#000" },
    },
  ],
});

const findLayer = (style: StyleSpecification, layerId: string) =>
  style.layers.find((layer) => layer.id === layerId);

describe("toExpeditionStyle", () => {
  it("paints water paper-coloured with an ink-brown coastline", () => {
    const water = findLayer(toExpeditionStyle(positronLike()), "water");

    expect(water?.type).toBe("fill");
    expect(water?.paint).toMatchObject({
      "fill-color": MAP_COLORS.paper,
      "fill-outline-color": MAP_COLORS.inkBrown,
    });
  });

  it("paints the land wash on the background", () => {
    const background = findLayer(
      toExpeditionStyle(positronLike()),
      "background",
    );

    expect(background?.paint).toEqual({ "background-color": MAP_COLORS.land });
  });

  it("removes roads and buildings but keeps the other layers in order", () => {
    const ids = toExpeditionStyle(positronLike()).layers.map(
      (layer) => layer.id,
    );

    expect(ids).toEqual([
      "background",
      "expedition_relief",
      "water",
      "label_city",
    ]);
  });

  it("is idempotent, so re-transforming doesn't duplicate the relief layer", () => {
    const once = toExpeditionStyle(positronLike());
    const twice = toExpeditionStyle(once);

    expect(twice.layers.map((layer) => layer.id)).toEqual(
      once.layers.map((layer) => layer.id),
    );
  });

  it("merges label overrides without dropping the layer's own layout", () => {
    const label = findLayer(toExpeditionStyle(positronLike()), "label_city");

    expect(label?.layout).toMatchObject({
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
      "text-field": [
        "coalesce",
        ["get", "name:es"],
        ["get", "name:latin"],
        ["get", "name"],
      ],
    });
    expect(label?.paint).toMatchObject({
      "text-color": MAP_COLORS.ink,
      "text-halo-color": MAP_COLORS.land,
    });
  });

  it("loads a background-only style (the E2E fixture) without throwing", () => {
    const minimal: StyleSpecification = {
      version: 8,
      sources: {},
      layers: [{ id: "background", type: "background" }],
    };

    const result = toExpeditionStyle(minimal);

    expect(result.layers).toEqual([
      {
        id: "background",
        type: "background",
        paint: { "background-color": MAP_COLORS.land },
      },
    ]);
  });

  it("skips an override whose layer type differs from the loaded style", () => {
    const renamed: LayerSpecification = {
      id: "water",
      type: "line",
      source: "openmaptiles",
      "source-layer": "water",
      paint: { "line-color": "#00f" },
    };
    const style: StyleSpecification = { ...positronLike(), layers: [renamed] };

    expect(findLayer(toExpeditionStyle(style), "water")).toEqual(renamed);
  });

  it("does not mutate the input style", () => {
    const input = positronLike();
    const snapshot = structuredClone(input);

    toExpeditionStyle(input);

    expect(input).toEqual(snapshot);
  });
});
