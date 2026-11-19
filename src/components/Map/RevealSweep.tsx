"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Marker, useMap } from "react-map-gl/maplibre";
import { SWEEP_DURATION_MS } from "@/lib/biomes/revealOrder";
import type { BiomeConfig } from "@/lib/biomes/types";
import { metersPerPixel } from "@/lib/map/mercator";

const SWEEP_S = SWEEP_DURATION_MS / 1000;
const FADE_S = 0.3;
/** Room around the circle for the pencil tip and stroke. */
const PADDING_PX = 12;

interface RevealSweepProps {
  biome: BiomeConfig;
}

/**
 * A drafting-compass arm swinging once clockwise from north around the
 * location, inking its circle as it goes, then fading out. Its timing matches
 * revealOrder, so each Pokémon pops in as the arm passes. Decorative only;
 * not rendered with reduced motion.
 */
export function RevealSweep({ biome }: RevealSweepProps) {
  const { current: map } = useMap();
  // Sized once for the zoom it starts at; it's gone within two seconds.
  const [radiusPx] = useState(() =>
    map
      ? (biome.spreadKm * 1000) / metersPerPixel(biome.center[1], map.getZoom())
      : 0,
  );
  const [isDone, setIsDone] = useState(false);

  if (isDone || radiusPx <= 0) return null;

  const [longitude, latitude] = biome.center;
  const size = 2 * (radiusPx + PADDING_PX);
  const middle = size / 2;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        aria-hidden="true"
        className="relative"
        style={{ width: size, height: size, color: `var(${biome.accent})` }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{
          duration: SWEEP_S + FADE_S,
          times: [0, SWEEP_S / (SWEEP_S + FADE_S), 1],
        }}
        onAnimationComplete={() => setIsDone(true)}
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0 overflow-visible"
          fill="none"
        >
          <circle
            cx={middle}
            cy={middle}
            r={radiusPx}
            className="fill-current opacity-10"
          />
          {/* Circles start at 3 o'clock; turn back a quarter to start at north. */}
          <g transform={`rotate(-90 ${middle} ${middle})`}>
            <motion.circle
              cx={middle}
              cy={middle}
              r={radiusPx}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: SWEEP_S, ease: "linear" }}
            />
          </g>
        </svg>

        <motion.div
          className="absolute inset-0"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: SWEEP_S, ease: "linear" }}
        >
          <svg
            width={size}
            height={size}
            className="overflow-visible stroke-ink-brown"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Arm from the needle to the pencil, pointing north at rest. */}
            <line
              x1={middle}
              y1={middle}
              x2={middle}
              y2={middle - radiusPx + 7}
              strokeWidth={2.5}
            />
            <path
              d={`M${middle - 4} ${middle - radiusPx + 8} L${middle} ${middle - radiusPx} L${middle + 4} ${middle - radiusPx + 8} Z`}
              className="fill-ink-brown"
              strokeWidth={1}
            />
            <circle
              cx={middle}
              cy={middle}
              r={5}
              className="fill-card"
              strokeWidth={2}
            />
            <circle
              cx={middle}
              cy={middle}
              r={1.5}
              className="fill-ink-brown"
            />
          </svg>
        </motion.div>
      </motion.div>
    </Marker>
  );
}
