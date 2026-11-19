import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { STAT_NAMES } from "@/lib/pokeapi/schemas";

function LoadingStatus({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex flex-col gap-5">
      <span className="sr-only">Cargando la ficha…</span>
      <div aria-hidden="true" className="contents">
        {children}
      </div>
    </div>
  );
}

/** Mirrors PokemonFicha block for block, so nothing jumps on load. */
export function FichaSkeleton() {
  return (
    <LoadingStatus>
      <div className="flex items-center gap-4">
        <Skeleton className="size-28 shrink-0 rounded-full bg-rule" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-7 w-28 bg-rule" />
          <Skeleton className="h-10 w-full bg-rule" />
        </div>
      </div>
      <Skeleton className="h-28 w-full bg-rule" />
    </LoadingStatus>
  );
}

/** Mirrors PokemonStats block for block. */
export function StatsSkeleton() {
  return (
    <LoadingStatus>
      <div className="flex flex-col gap-2.5">
        {STAT_NAMES.map((statName) => (
          <Skeleton key={statName} className="h-5 w-full bg-rule" />
        ))}
      </div>
      <Skeleton className="h-10 w-full bg-rule" />
    </LoadingStatus>
  );
}
