"use client";

import { motion } from "motion/react";

interface InkStampProps {
  /** Already formatted, e.g. "19 nov 2026". */
  date: string;
  /** Degrees; a little random so every stamp lands a bit crooked. */
  rotation: number;
  onLanded: () => void;
}

/**
 * The approval stamp pressed onto the ID card: it drops from above (scale
 * down) and lands slightly crooked. With reduced motion, Motion drops the
 * scale and it fades in. Announced as a status message.
 */
export function InkStamp({ date, rotation, onLanded }: InkStampProps) {
  return (
    <motion.div
      initial={{ scale: 2.2, opacity: 0, rotate: rotation }}
      animate={{ scale: 1, opacity: 1, rotate: rotation }}
      transition={{ duration: 0.32, ease: [0.3, 1.4, 0.6, 1] }}
      onAnimationComplete={onLanded}
      className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2"
    >
      <div
        role="status"
        className="stamp-worn flex flex-col items-center rounded-md border-[3px] border-double border-hanko px-4 py-2 text-hanko mix-blend-multiply"
      >
        <span className="font-display text-sm font-bold tracking-wider whitespace-nowrap uppercase md:text-lg md:tracking-widest">
          Expedición autorizada
        </span>
        <span className="font-mono text-xs font-semibold whitespace-nowrap uppercase md:text-sm">
          {date}
        </span>
      </div>
    </motion.div>
  );
}
