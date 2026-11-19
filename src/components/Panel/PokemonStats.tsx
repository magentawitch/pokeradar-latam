"use client";

import { PokemonDetailError } from "@/components/Panel/PokemonDetailError";
import { StatsSkeleton } from "@/components/Panel/PokemonDetailSkeleton";
import { StatBars } from "@/components/Panel/StatBars";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import {
  STRENGTH_NOTES,
  statTotal,
  strongestStat,
} from "@/utils/pokemonHelpers";

interface PokemonStatsProps {
  id: number;
}

/**
 * The card's second tab: base stats, their total ruled off like a ledger,
 * and a handwritten note on the strongest one.
 */
export function PokemonStats({ id }: PokemonStatsProps) {
  const detail = usePokemonDetail(id);

  if (detail.isPending) return <StatsSkeleton />;

  if (detail.isError) {
    return (
      <PokemonDetailError
        isRetrying={detail.isFetching}
        onRetry={() => void detail.refetch()}
      />
    );
  }

  const { stats } = detail.data;
  const strongest = strongestStat(stats);

  return (
    <div className="flex flex-col gap-5">
      <StatBars stats={stats} />

      <div className="flex items-end justify-between gap-4 border-t border-dashed border-ink-brown/40 pt-3">
        {strongest && (
          <p className="font-hand text-2xl leading-none text-ink-brown">
            {STRENGTH_NOTES[strongest.name]}
          </p>
        )}
        <p className="ml-auto flex items-baseline gap-2 font-mono">
          <span className="text-xs tracking-widest text-ink-muted uppercase">
            Total
          </span>
          <span className="border-b-[3px] border-double border-ink text-base text-ink">
            {statTotal(stats)}
          </span>
        </p>
      </div>
    </div>
  );
}
