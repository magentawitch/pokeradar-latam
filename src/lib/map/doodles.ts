import type { LngLat } from "@/lib/biomes/types";

export type DoodleKind = "waves" | "boat" | "fish";

export type Doodle = {
  /** Unique key for React. */
  id: string;
  kind: DoodleKind;
  position: LngLat;
  /** Slight hand-drawn tilt, in degrees. */
  tilt: number;
};

/** Above this zoom the doodles are hidden: they belong to the continental view. */
export const DOODLE_MAX_ZOOM = 4.5;

/**
 * Ink doodles in open water, clear of every stamp and sea label at the
 * opening zoom (checked at 375, 768 and 1280 px).
 */
export const DOODLES = [
  { id: "pacific-waves", kind: "waves", position: [-101, 7], tilt: 3 },
  { id: "pacific-fish", kind: "fish", position: [-88, -19], tilt: -8 },
  { id: "south-pacific-waves", kind: "waves", position: [-96, -40], tilt: -2 },
  { id: "atlantic-boat", kind: "boat", position: [-40, 13], tilt: 4 },
  { id: "atlantic-waves", kind: "waves", position: [-22, -20], tilt: 2 },
  { id: "south-atlantic-waves", kind: "waves", position: [-46, -42], tilt: -3 },
] as const satisfies readonly Doodle[];
