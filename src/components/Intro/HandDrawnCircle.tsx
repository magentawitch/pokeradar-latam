"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A loose pen loop drawn around the chosen starter, like circling an answer
 * on a form. Decorative: the radio's checked state carries the meaning.
 */
export function HandDrawnCircle() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      fill="none"
      className="pointer-events-none absolute -inset-1.5 size-[calc(100%+0.75rem)] stroke-hanko"
    >
      <motion.path
        d="M64 8C34 6 10 28 9 58c-1 31 24 54 54 53 30-1 50-24 48-54C109 29 88 9 58 12c-9 1-16 4-22 8"
        strokeWidth={3.5}
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </svg>
  );
}
