"use client";

import { motion, useReducedMotion } from "motion/react";
import { StampRing } from "@/components/StampBook/StampRing";
import {
  STAMP_PRESS_ANIMATE,
  STAMP_PRESS_INITIAL,
  STAMP_PRESS_TRANSITION,
} from "@/components/StampBook/stampMotion";
import { useStampSprite } from "@/hooks/useStampSprite";
import { formatStampDate, stampRotation } from "@/lib/discovery/derive";
import type { HabitatName } from "@/lib/pokeapi/schemas";
import { formatDexNumber, formatPokemonName } from "@/utils/pokemonHelpers";

interface StampProps {
  id: number;
  name: string;
  habitat: HabitatName;
  place: string;
  discoveredAt: string;
  /** Seconds to wait before the stamping animation; null skips it. */
  stampDelay: number | null;
  /** Called once the stamping animation ends, so it never replays. */
  onStamped: (id: number) => void;
}

/**
 * A collected station stamp: the Pokémon's silhouette in its habitat's ink
 * (the artwork used as a CSS mask over a solid fill), inside a ring with the
 * location and date, tilted a little and worn like a real rubber stamp.
 */
export function Stamp({
  id,
  name,
  habitat,
  place,
  discoveredAt,
  stampDelay,
  onStamped,
}: StampProps) {
  const sprite = useStampSprite(id);
  const shouldReduceMotion = useReducedMotion();
  const date = formatStampDate(discoveredAt);
  const shouldStamp = stampDelay !== null && !shouldReduceMotion;

  return (
    <figure
      data-habitat={habitat}
      className="relative aspect-square text-(--habitat-stamp)"
      style={{ rotate: `${stampRotation(id)}deg` }}
    >
      {/* Pressed onto the paper: lands oversized and faint, then settles
          with a small bounce. */}
      <motion.div
        className="stamp-worn absolute inset-0"
        initial={shouldStamp ? STAMP_PRESS_INITIAL : false}
        animate={STAMP_PRESS_ANIMATE}
        transition={{ ...STAMP_PRESS_TRANSITION, delay: stampDelay ?? 0 }}
        onAnimationComplete={() => {
          if (shouldStamp) onStamped(id);
        }}
      >
        <StampRing id={id} topText={place} bottomText={date} />
        {sprite.status === "ready" && (
          <div
            aria-hidden="true"
            className="absolute inset-[24%] bg-current mask-contain mask-center mask-no-repeat"
            style={{ maskImage: `url("${sprite.src}")` }}
          />
        )}
        {sprite.status === "failed" && (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-mono text-sm font-medium"
          >
            {formatDexNumber(id)}
          </span>
        )}
      </motion.div>
      <figcaption className="sr-only">
        {formatPokemonName(name)}, sellado en {place} el {date}
      </figcaption>
    </figure>
  );
}
