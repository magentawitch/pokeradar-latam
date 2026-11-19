"use client";

import { useCallback } from "react";
import { NO_PADDING, type CameraPadding } from "@/lib/map/reveal";

/** Tailwind's `md` breakpoint, where the card moves from the bottom to the centre. */
const DESKTOP_QUERY = "(min-width: 48rem)";

// This mirrors the DialogContent classes in DetailPanel.tsx.
/** `md:w-md` (Tailwind's `--container-md`, 28rem) */
const CARD_WIDTH_PX = 448;
/** Extra room so a marker doesn't sit flush against the card edge. */
const GUTTER_PX = 16;

/**
 * Screen space the open detail card covers, as camera padding for flights.
 * On desktop the card is centred, so the padding covers the card and
 * everything right of it: the marker lands in the clear strip on the left.
 *
 * On phones the card takes most of the screen; the strip left above it is
 * too short to frame a location in (the flight would zoom out past the reveal
 * threshold), so phones get no padding and the card simply covers the map.
 */
export function useCameraPadding() {
  return useCallback((): CameraPadding => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) return NO_PADDING;
    return {
      ...NO_PADDING,
      right: Math.round(window.innerWidth / 2 + CARD_WIDTH_PX / 2 + GUTTER_PX),
    };
  }, []);
}
