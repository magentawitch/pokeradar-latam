import type {
  BackgroundLayerSpecification,
  FillLayerSpecification,
  LayerSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
  StyleSpecification,
  SymbolLayerSpecification,
} from "react-map-gl/maplibre";

export const POSITRON_STYLE_URL =
  "https://tiles.openfreemap.org/styles/positron";

/** Mirror of the journal palette for WebGL paint properties */
export const MAP_COLORS = {
  paper: "#f3ebdd",
  land: "#d8c3a0",
  landDeep: "#c9b088",
  landPale: "#e6d6b8",
  ink: "#2b2a26",
  inkBrown: "#5b3e29",
} as const;

type LayerOverride =
  | {
      type: "background";
      paint?: BackgroundLayerSpecification["paint"];
    }
  | {
      type: "fill";
      paint?: FillLayerSpecification["paint"];
    }
  | {
      type: "line";
      paint?: LineLayerSpecification["paint"];
    }
  | {
      type: "symbol";
      paint?: SymbolLayerSpecification["paint"];
      layout?: SymbolLayerSpecification["layout"];
    };

type TextField = NonNullable<SymbolLayerSpecification["layout"]>["text-field"];

const SPANISH_NAME: TextField = [
  "coalesce",
  ["get", "name:es"],
  ["get", "name:latin"],
  ["get", "name"],
];

const placeLabel: LayerOverride = {
  type: "symbol",
  paint: {
    "text-color": MAP_COLORS.ink,
    "text-halo-color": MAP_COLORS.land,
    "text-halo-width": 0.5,
    "text-halo-blur": 0.5,
  },
  layout: { "text-field": SPANISH_NAME },
};

const countryLabel: LayerOverride = {
  type: "symbol",
  paint: {
    "text-color": MAP_COLORS.inkBrown,
    "text-halo-color": MAP_COLORS.land,
    "text-halo-width": 0.5,
    "text-halo-blur": 1,
  },
  layout: {
    "text-field": SPANISH_NAME,
    "text-transform": "uppercase",
    "text-letter-spacing": 0.15,
  },
};

const waterLabel: LayerOverride = {
  type: "symbol",
  paint: {
    "text-color": MAP_COLORS.inkBrown,
    "text-halo-color": MAP_COLORS.paper,
    "text-halo-width": 1.5,
  },
  layout: { "text-field": SPANISH_NAME },
};

export const LAYER_OVERRIDES: Readonly<Record<string, LayerOverride>> = {
  background: {
    type: "background",
    paint: { "background-color": MAP_COLORS.land },
  },
  water: {
    type: "fill",
    paint: {
      "fill-color": MAP_COLORS.paper,
      "fill-antialias": true,
      "fill-outline-color": MAP_COLORS.inkBrown,
    },
  },
  park: {
    type: "fill",
    paint: { "fill-color": MAP_COLORS.landDeep, "fill-opacity": 0.5 },
  },
  landcover_wood: {
    type: "fill",
    paint: { "fill-color": MAP_COLORS.landDeep },
  },
  landcover_ice_shelf: {
    type: "fill",
    paint: { "fill-color": MAP_COLORS.landPale },
  },
  landcover_glacier: {
    type: "fill",
    paint: { "fill-color": MAP_COLORS.landPale },
  },
  landuse_residential: {
    type: "fill",
    paint: { "fill-color": MAP_COLORS.landDeep },
  },
  waterway: {
    type: "line",
    paint: { "line-color": MAP_COLORS.inkBrown, "line-opacity": 0.55 },
  },
  boundary_2: {
    type: "line",
    paint: { "line-color": MAP_COLORS.inkBrown, "line-dasharray": [3, 2] },
  },
  boundary_3: {
    type: "line",
    paint: { "line-color": MAP_COLORS.inkBrown, "line-opacity": 0.5 },
  },
  boundary_disputed: {
    type: "line",
    paint: { "line-color": MAP_COLORS.inkBrown },
  },
  water_name_point_label: waterLabel,
  water_name_line_label: waterLabel,
  waterway_line_label: waterLabel,
  label_other: placeLabel,
  label_village: placeLabel,
  label_town: placeLabel,
  label_state: placeLabel,
  label_city: placeLabel,
  label_city_capital: placeLabel,
  label_country_1: countryLabel,
  label_country_2: countryLabel,
  label_country_3: countryLabel,
};

/** Roads, rail, buildings, airports and shields: removed so the map reads as a drawn chart. */
export const HIDDEN_LAYER_PREFIXES = [
  "building",
  "tunnel_",
  "aeroway-",
  "road_",
  "highway",
  "railway",
  "airport",
] as const;

/** Natural Earth shaded relief, already declared (but unused) in positron. */
const RELIEF_SOURCE_ID = "ne2_shaded";

/** Grey hillshade on the sepia wash so the Andes read as drawn relief; fades out past z6. */
const reliefLayer: RasterLayerSpecification = {
  id: "expedition_relief",
  type: "raster",
  source: RELIEF_SOURCE_ID,
  maxzoom: 7,
  paint: {
    "raster-saturation": -1,
    "raster-contrast": 0.2,
    "raster-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.3, 7, 0],
  },
};

const isHidden = (layerId: string) =>
  HIDDEN_LAYER_PREFIXES.some((prefix) => layerId.startsWith(prefix));

const applyOverride = (
  layer: LayerSpecification,
  override: LayerOverride,
): LayerSpecification => {
  if (override.type === "background" && layer.type === "background") {
    return { ...layer, paint: { ...layer.paint, ...override.paint } };
  }
  if (override.type === "fill" && layer.type === "fill") {
    return { ...layer, paint: { ...layer.paint, ...override.paint } };
  }
  if (override.type === "line" && layer.type === "line") {
    return { ...layer, paint: { ...layer.paint, ...override.paint } };
  }
  if (override.type === "symbol" && layer.type === "symbol") {
    return {
      ...layer,
      paint: { ...layer.paint, ...override.paint },
      layout: { ...layer.layout, ...override.layout },
    };
  }
  return layer;
};

const warnMissingOverrides = (style: StyleSpecification) => {
  if (process.env.NODE_ENV !== "development" || !style.sources.openmaptiles) {
    return;
  }
  const layerIds = new Set(style.layers.map((layer) => layer.id));
  const missing = Object.keys(LAYER_OVERRIDES).filter(
    (layerId) => !layerIds.has(layerId),
  );
  if (missing.length > 0) {
    console.warn(
      `[expeditionStyle] positron layers not found, overrides skipped: ${missing.join(", ")}`,
    );
  }
};

/**
 * Turns OpenFreeMap positron into the paper-and-ink expedition map. Pure: the
 * input style is not mutated. Used as MapLibre's `transformStyle`, so the
 * default colours never paint.
 */
export function toExpeditionStyle(
  style: StyleSpecification,
): StyleSpecification {
  warnMissingOverrides(style);

  const layers = style.layers.flatMap((layer): LayerSpecification[] => {
    // MapLibre can hand an already-transformed style back in (e.g. when
    // react-map-gl reuses a map instance); drop the old relief so it isn't added twice.
    if (isHidden(layer.id) || layer.id === reliefLayer.id) return [];

    const override = LAYER_OVERRIDES[layer.id];
    const styled = override ? applyOverride(layer, override) : layer;

    if (layer.type === "background" && style.sources[RELIEF_SOURCE_ID]) {
      return [styled, reliefLayer];
    }
    return [styled];
  });

  return { ...style, layers };
}
