import type { Transition } from "motion/react";

/**
 * A rubber stamp pressed onto paper: it lands oversized and faint, then
 * settles with a small bounce. Shared by the stamp book and the map markers.
 */
export const STAMP_PRESS_INITIAL = { scale: 1.3, opacity: 0 };
export const STAMP_PRESS_ANIMATE = { scale: 1, opacity: 1 };
export const STAMP_PRESS_TRANSITION = {
  scale: { type: "spring", stiffness: 520, damping: 14, mass: 0.7 },
  opacity: { duration: 0.08 },
} satisfies Transition;
