"use client";

import {
  IconHeart,
  IconShield,
  IconShieldStar,
  IconSparkles,
  IconSword,
  IconWind,
  type Icon,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { Progress, ProgressIndicator } from "@/components/ui/progress";
import type { PokemonDetail } from "@/lib/pokeapi/pokemon";
import type { StatName } from "@/lib/pokeapi/schemas";
import { MAX_BASE_STAT, STAT_LABELS } from "@/utils/pokemonHelpers";

/** Bar fill time and the gap between consecutive bars starting. */
const FILL_DURATION_S = 0.6;
const STAGGER_S = 0.06;

const STAT_ICONS = {
  hp: IconHeart,
  attack: IconSword,
  defense: IconShield,
  "special-attack": IconSparkles,
  "special-defense": IconShieldStar,
  speed: IconWind,
} as const satisfies Record<StatName, Icon>;

interface StatBarsProps {
  stats: PokemonDetail["stats"];
}

/**
 * Base stats on one fixed scale (0–255), so bars compare across Pokémon. Each
 * bar is an outlined box filled with pen hatching; icons are decorative, the
 * label names the stat.
 */
export function StatBars({ stats }: StatBarsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <ul className="flex flex-col gap-2.5">
      {stats.map((stat, index) => {
        const labelId = `stat-label-${stat.name}`;
        const StatIcon = STAT_ICONS[stat.name];
        return (
          <li
            key={stat.name}
            className="grid grid-cols-[1.25rem_5.5rem_2.25rem_1fr] items-center gap-2"
          >
            <StatIcon
              aria-hidden="true"
              className="size-5 text-ink-brown"
              stroke={1.75}
            />
            <span id={labelId} className="text-sm text-ink-muted">
              {STAT_LABELS[stat.name]}
            </span>
            <span className="text-right font-mono text-sm text-ink">
              {stat.value}
            </span>
            <Progress
              value={stat.value}
              max={MAX_BASE_STAT}
              getValueLabel={(value, max) => `${value} de ${max}`}
              aria-labelledby={labelId}
              className="h-3 rounded-sm border border-ink-brown/40 bg-card"
            >
              <ProgressIndicator asChild>
                <motion.div
                  className="ink-hatch h-full border-r-2 border-ink-brown"
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${(stat.value / MAX_BASE_STAT) * 100}%` }}
                  transition={{
                    duration: FILL_DURATION_S,
                    delay: index * STAGGER_S,
                    ease: "easeOut",
                  }}
                />
              </ProgressIndicator>
            </Progress>
          </li>
        );
      })}
    </ul>
  );
}
