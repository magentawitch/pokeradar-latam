"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "cn";

interface StickyNoteProps {
  /** Names the note for assistive tech (it renders as a labelled aside). */
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * A yellow sticky note taped over the map. It never takes pointer input, so
 * drags pass through to the map. Fades in and out; pair it with
 * AnimatePresence to animate its removal.
 */
export function StickyNote({ label, className, children }: StickyNoteProps) {
  return (
    <motion.aside
      aria-label={label}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "pointer-events-none absolute z-10 flex flex-col gap-1.5 bg-sticky px-4 pt-5 pb-4 text-ink shadow-[0_10px_18px_-8px_rgb(43_42_38/0.45)]",
        className,
      )}
    >
      {/* A strip of masking tape holding the note. */}
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 bg-card/70 shadow-sm"
      />
      {children}
    </motion.aside>
  );
}
