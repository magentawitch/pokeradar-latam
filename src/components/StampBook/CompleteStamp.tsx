"use client";

import { motion, useReducedMotion } from "motion/react";
import { CategoryIcon } from "@/components/StampBook/CategoryIcon";
import { formatStampDate } from "@/lib/discovery/derive";
import type { HabitatName } from "@/lib/pokeapi/schemas";
import { SCALLOP_PATH } from "@/utils/sealHelpers";

interface CompleteStampProps {
  habitat: HabitatName;
  /** Full page name, for the accessible name. */
  label: string;
  /** Short page name, curved over the top of the stamp. */
  shortLabel: string;
  /** How many stamps the page holds, all collected. */
  total: number;
  /** ISO date the page was completed. */
  completedAt: string;
  /** Seconds to wait before the stamping animation; null skips it. */
  stampDelay: number | null;
  /** Called once the stamping animation ends, so it never replays. */
  onStamped: (habitat: HabitatName) => void;
}

// Plex Mono glyphs are 0.6em wide, so the fitting size is exact.
const MONO_ADVANCE = 0.6;
const TOP_ARC_PX = 60;
const MAX_FONT_SIZE = 7.5;
/** The page-open shine waits for the stamp to land, when it's pressed in. */
const SHINE_AFTER_STAMP_S = 0.45;

const GOLD_STOPS = [
  { offset: "0%", color: "var(--color-gold-dark)" },
  { offset: "38%", color: "var(--color-gold-light)" },
  { offset: "68%", color: "var(--color-gold-mid)" },
  { offset: "100%", color: "var(--color-gold-dark)" },
];

/**
 * The reward for filling a page: a pinked-edge stamp in gold foil (worn by
 * the same ink mask as the Pokémon stamps) with the page's icon, its name
 * over the top and "COMPLETO · n/n" under it. A light sweeps across it when
 * the page opens and on hover. Pressed in like the stamps the first time.
 */
export function CompleteStamp({
  habitat,
  label,
  shortLabel,
  total,
  completedAt,
  stampDelay,
  onStamped,
}: CompleteStampProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldStamp = stampDelay !== null && !shouldReduceMotion;
  const date = formatStampDate(completedAt);
  const topText = shortLabel.toUpperCase();
  const fontSize = Math.min(
    MAX_FONT_SIZE,
    TOP_ARC_PX / (topText.length * MONO_ADVANCE),
  );
  const goldId = `complete-${habitat}-gold`;
  const shineId = `complete-${habitat}-shine`;
  const clipId = `complete-${habitat}-clip`;
  const topPathId = `complete-${habitat}-top`;
  const bottomPathId = `complete-${habitat}-bottom`;
  const shineDelay = shouldStamp ? stampDelay + SHINE_AFTER_STAMP_S : 0.15;

  return (
    <figure
      role="img"
      aria-label={`Categoría ${label} completa, ${total} de ${total}, el ${date}`}
      className="group relative aspect-square -rotate-6"
    >
      <motion.div
        className="stamp-worn absolute inset-0"
        initial={shouldStamp ? { scale: 1.45, opacity: 0, rotate: -12 } : false}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          scale: { type: "spring", stiffness: 420, damping: 12, mass: 0.8 },
          rotate: { type: "spring", stiffness: 300, damping: 18 },
          opacity: { duration: 0.1 },
          delay: stampDelay ?? 0,
        }}
        onAnimationComplete={() => {
          if (shouldStamp) onStamped(habitat);
        }}
      >
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="absolute inset-0 size-full overflow-visible font-mono"
        >
          <defs>
            {/* Diagonal foil: each shape catches the highlight across it. */}
            <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
              {GOLD_STOPS.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  style={{ stopColor: stop.color }}
                />
              ))}
            </linearGradient>
            <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.75" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId}>
              <path d={SCALLOP_PATH} />
            </clipPath>
          </defs>

          <path
            d={SCALLOP_PATH}
            fill="none"
            stroke={`url(#${goldId})`}
            strokeWidth={2.75}
          />
          <circle
            cx="50"
            cy="50"
            r="37"
            fill="none"
            stroke={`url(#${goldId})`}
            strokeWidth={1.25}
          />
          <CategoryIcon
            habitat={habitat}
            x={31.5}
            y={24.5}
            size={37}
            fill={`url(#${goldId})`}
          />
          <text
            x="50"
            y="67"
            fontSize={5}
            fontWeight={500}
            textAnchor="middle"
            className="fill-gold-text"
          >
            {date}
          </text>

          {/* Clockwise over the top: glyphs stand outward on the baseline. */}
          <path id={topPathId} d="M 23,50 A 27,27 0 0 1 77,50" fill="none" />
          {/* Anticlockwise under the bottom: glyphs stay upright. */}
          <path id={bottomPathId} d="M 18,50 A 32,32 0 0 0 82,50" fill="none" />
          <text
            className="fill-gold-text"
            fontSize={fontSize}
            fontWeight={600}
            textAnchor="middle"
          >
            <textPath href={`#${topPathId}`} startOffset="50%">
              {topText}
            </textPath>
          </text>
          <text
            className="fill-gold-text"
            fontSize={5.6}
            fontWeight={600}
            textAnchor="middle"
          >
            <textPath href={`#${bottomPathId}`} startOffset="50%">
              COMPLETO · {total}/{total}
            </textPath>
          </text>

          {/* The shine: a soft band tilted 25°, swept once when the page
              opens and again on each hover. Over bare paper it's near
              invisible, so it reads as light on the gold. */}
          <g clipPath={`url(#${clipId})`} className="motion-reduce:hidden">
            <g transform="rotate(25 50 50)">
              <rect
                x="35"
                y="-40"
                width="30"
                height="180"
                fill={`url(#${shineId})`}
                className="animate-gold-shine [animation-fill-mode:both]"
                style={{ animationDelay: `${shineDelay}s` }}
              />
              <rect
                x="35"
                y="-40"
                width="30"
                height="180"
                fill={`url(#${shineId})`}
                className="[transform:translateX(-90px)] group-hover:animate-gold-shine"
              />
            </g>
          </g>
        </svg>
      </motion.div>
    </figure>
  );
}
