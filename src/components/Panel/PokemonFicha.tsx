"use client";

import { CryButton } from "@/components/Panel/CryButton";
import { FieldNote } from "@/components/Panel/FieldNote";
import { PokemonDetailError } from "@/components/Panel/PokemonDetailError";
import { FichaSkeleton } from "@/components/Panel/PokemonDetailSkeleton";
import { PokemonSprite } from "@/components/Panel/PokemonSprite";
import { TypeStamps } from "@/components/Panel/TypeStamps";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { usePokemonSpecies } from "@/hooks/usePokemonSpecies";
import { formatHeight, formatWeight } from "@/utils/pokemonHelpers";

interface PokemonFichaProps {
  id: number;
}

/**
 * The card's first tab: sprite, types, measurements and the field note. Both
 * queries start together and fail independently: a detail error replaces the
 * tab with a retry, a species error only affects the field note.
 */
export function PokemonFicha({ id }: PokemonFichaProps) {
  const detail = usePokemonDetail(id);
  const species = usePokemonSpecies(id);

  if (detail.isPending) return <FichaSkeleton />;

  if (detail.isError) {
    return (
      <PokemonDetailError
        isRetrying={detail.isFetching}
        onRetry={() => void detail.refetch()}
      />
    );
  }

  const pokemon = detail.data;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <PokemonSprite
            animatedSrc={pokemon.spriteAnimated}
            staticSrc={pokemon.spriteStatic}
          />
          {pokemon.cry !== null && (
            <CryButton
              url={pokemon.cry}
              className="absolute right-0 bottom-0"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <TypeStamps types={pokemon.types} />
          <dl className="grid h-10 grid-cols-2 gap-x-3 font-mono text-sm">
            <div>
              <dt className="text-xs text-ink-muted">Altura</dt>
              <dd className="text-ink">{formatHeight(pokemon.heightDm)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Peso</dt>
              <dd className="text-ink">{formatWeight(pokemon.weightHg)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <FieldNote
        note={species.data}
        isPending={species.isPending}
        isError={species.isError}
        isRetrying={species.isFetching}
        onRetry={() => void species.refetch()}
      />
    </div>
  );
}
