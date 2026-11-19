import { formatDexNumber } from "@/utils/pokemonHelpers";

interface EmptyStampProps {
  id: number;
  place: string;
}

/**
 * A stamp still to collect: a dashed outline with the dex number and, as the
 * hint, the location where that Pokémon lives. No hooks, so it stays a plain
 * component wherever it renders.
 */
export function EmptyStamp({ id, place }: EmptyStampProps) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-full border-2 border-dashed border-ink-brown/35 p-3 text-center">
      <span className="font-mono text-[0.65rem] text-ink-muted">
        {formatDexNumber(id)}
      </span>
      <span className="text-[0.7rem] leading-tight text-ink-muted">
        <span className="sr-only">Sello pendiente en </span>
        {place}
      </span>
    </div>
  );
}
