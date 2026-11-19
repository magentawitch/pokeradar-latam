"use client";

import { AnimatePresence, motion } from "motion/react";

/** The map controls, in touch wording below md and pointer wording above. */
function HintCopy() {
  return (
    <>
      <span className="md:hidden">
        Arrastrá para moverte · Pellizcá para acercar · Tocá un sello
      </span>
      <span className="hidden md:inline">
        Arrastrá para moverte · Usá la rueda para acercar · Hacé clic en un
        sello para explorar
      </span>
    </>
  );
}

interface HintBarProps {
  /** False once the user has started exploring; the bar fades out. */
  isVisible: boolean;
}

/**
 * Bottom strip with the map controls, shown until the first interaction.
 * After that the same copy lives in the diary's "Cómo explorar" section.
 */
export function HintBar({ isVisible }: HintBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.p
          key="hint"
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute bottom-14 left-1/2 z-10 w-max max-w-[calc(100%-2rem)] md:bottom-9 -translate-x-1/2 rounded-full border border-border bg-card/95 px-3 py-1 text-center text-xs text-ink-muted shadow-sm"
        >
          <HintCopy />
        </motion.p>
      )}
    </AnimatePresence>
  );
}
