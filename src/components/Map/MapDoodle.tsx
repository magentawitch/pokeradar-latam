"use client";

import { Marker } from "react-map-gl/maplibre";
import type { Doodle, DoodleKind } from "@/lib/map/doodles";

/** Original line art, each drawn in a 48 × 32 box. */
const DOODLE_PATHS: Record<DoodleKind, readonly string[]> = {
  waves: ["M4 12 q5 -6 10 0 t10 0 t10 0", "M14 22 q5 -6 10 0 t10 0 t10 0"],
  boat: [
    "M10 22 H38 L34 28 H14 Z",
    "M24 22 V3",
    "M24 4 L36 19 H24",
    "M24 7 L15 19 H24",
    "M4 30 q4 -3 8 0 t8 0 M30 30 q4 -3 8 0 t8 0",
  ],
  fish: [
    "M8 16 C14 6 28 6 34 16 C28 26 14 26 8 16 Z",
    "M34 16 L44 9 V23 Z",
    "M18 12 q2 4 0 8",
    "M13 15 h0.01",
  ],
};

interface MapDoodleProps {
  doodle: Doodle;
}

/**
 * A small ink doodle pinned to a map coordinate. Decorative: hidden from
 * assistive tech and transparent to the pointer, so it never blocks a drag.
 */
export function MapDoodle({ doodle }: MapDoodleProps) {
  const [longitude, latitude] = doodle.position;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      style={{ pointerEvents: "none" }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 48 32"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-11 stroke-ink-brown/60 md:w-14"
        style={{ rotate: `${doodle.tilt}deg` }}
      >
        {DOODLE_PATHS[doodle.kind].map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
    </Marker>
  );
}
