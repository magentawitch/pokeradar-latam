"use client";

import type { ReactNode, RefObject } from "react";
import { motion } from "motion/react";
import {
  CompassInk,
  CoverTitleLabel,
  LatamLabel,
  PokeballSticker,
} from "@/components/Intro/CoverDecor";

interface JournalCoverProps {
  coverRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  /** A returning explorer: the same motion, faster (about 0.7 s). */
  isQuick: boolean;
  reduceMotion: boolean;
  /** The inside of the cover: the open spread's left page. */
  inside: ReactNode;
  onOpen: () => void;
  onOpened: () => void;
}

const COVER_EASE = [0.65, 0, 0.35, 1] as const;

/** The opening's timings (seconds), shared with the spread's slide. */
export function coverTimings(isQuick: boolean) {
  return {
    bandDuration: isQuick ? 0.2 : 0.5,
    turnDuration: isQuick ? 0.5 : 0.8,
    ease: COVER_EASE,
  };
}

/**
 * The closed journal: a dusty-blue cloth cover with a stitched spine, a
 * title sticker, a few travel stickers and a purple elastic band. Opening slides the band aside, then swings the cover open
 * from its spine (left edge) in 3D until it lies flat as the left page.
 * With reduced motion it only fades.
 */
export function JournalCover({
  coverRef,
  isOpen,
  isQuick,
  reduceMotion,
  inside,
  onOpen,
  onOpened,
}: JournalCoverProps) {
  const { bandDuration, turnDuration, ease } = coverTimings(isQuick);

  const closed = { rotateY: 0, opacity: 1 };
  // Same keys as `closed`: a key missing here would be animated back to its
  // initial value as a separate, instant animation.
  const opened = reduceMotion
    ? { rotateY: 0, opacity: 0 }
    : { rotateY: -180, opacity: 1 };
  const transition = reduceMotion
    ? { duration: 0.3 }
    : { delay: bandDuration, duration: turnDuration, ease };

  return (
    <motion.button
      ref={coverRef}
      type="button"
      aria-label="Abrir el diario de expedición"
      disabled={isOpen}
      onClick={onOpen}
      initial={closed}
      animate={isOpen ? opened : closed}
      transition={transition}
      onAnimationComplete={(definition) => {
        // Only the turn (or the reduced-motion fade) finishing counts; Motion
        // also reports smaller animations here.
        const isTurnDone =
          typeof definition === "object" &&
          !Array.isArray(definition) &&
          (reduceMotion ? definition.opacity === 0 : "rotateY" in definition);
        if (isOpen && isTurnDone) onOpened();
      }}
      style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
      className="group absolute inset-0 cursor-pointer rounded-l-sm rounded-r-lg text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cover-ink focus-visible:outline-dashed disabled:cursor-default"
    >
      {/* Front: the cloth cover. */}
      <span
        aria-hidden="true"
        className="book-cloth absolute inset-0 flex flex-col items-center justify-center rounded-l-sm rounded-r-lg [backface-visibility:hidden]"
      >
        {/* Spine: a darker strip, with cream stitching beside it. */}
        <span className="absolute inset-y-0 left-0 w-6 rounded-l-sm bg-cover-spine shadow-[inset_-1px_0_0_color-mix(in_oklab,var(--color-cover-ink)_25%,transparent)] md:w-8" />
        <span className="absolute inset-y-4 left-8 border-l-2 border-dashed border-card/75 md:left-10" />

        <PokeballSticker className="absolute top-[9%] left-[16%] rotate-6" />
        <CoverTitleLabel />
        <LatamLabel className="absolute bottom-[15%] left-[14%]" />
        <CompassInk className="absolute right-[17%] bottom-[24%] size-20 rotate-12 md:right-[17%] md:bottom-[14%] md:size-24" />

        <span className="absolute bottom-[4%] left-1/2 -translate-x-1/2 -rotate-2 font-hand text-2xl font-semibold whitespace-nowrap text-cover-ink transition-transform group-hover:-translate-y-0.5 md:text-3xl">
          click para abrir
        </span>

        {/* Elastic band: tugged back a little, then snapped off past the
            cover's edge before the cover turns. On phones this is the part
            of the opening that stays on screen, so it takes its time. */}
        <motion.span
          initial={{ x: 0, rotate: 0, opacity: 1 }}
          animate={
            isOpen
              ? { x: [0, -8, 90], rotate: [0, -2, 6], opacity: [1, 1, 0] }
              : { x: 0, rotate: 0, opacity: 1 }
          }
          transition={{
            duration: bandDuration,
            ease: "easeInOut",
            times: [0, 0.35, 1],
          }}
          // Wraps a little past the top and bottom edges, with rounded
          // ends; the gradient gives it a round, rubbery body.
          className="absolute -inset-y-1.5 right-10 w-2.5 rounded-full bg-elastic bg-[linear-gradient(to_right,color-mix(in_oklab,var(--color-elastic)_70%,var(--color-ink)),var(--color-elastic)_35%,color-mix(in_oklab,var(--color-elastic)_70%,var(--color-card))_55%,var(--color-elastic)_75%,color-mix(in_oklab,var(--color-elastic)_75%,var(--color-ink)))] shadow-[2px_1px_3px_rgb(43_42_38/0.35)] md:right-14 md:w-3"
        />
      </span>

      {/* Back: the inside of the cover, the same paper as the pages. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
      >
        {inside}
      </span>
    </motion.button>
  );
}
