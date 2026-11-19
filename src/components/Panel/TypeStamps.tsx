import { Badge } from "@/components/ui/badge";
import type { PokemonType } from "@/lib/pokeapi/schemas";
import { TYPE_LABELS, TYPE_STAMP_CLASSES } from "@/utils/typeHelpers";

/** Alternating tilt, so a pair of stamps looks pressed by hand. */
const STAMP_TILTS = ["-rotate-2", "rotate-1"] as const;

interface TypeStampsProps {
  types: PokemonType[];
}

export function TypeStamps({ types }: TypeStampsProps) {
  return (
    <ul aria-label="Tipos" className="flex flex-wrap gap-2">
      {types.map((type, index) => (
        <li key={type}>
          <Badge
            variant="outline"
            className={`h-7 rounded-sm border-2 bg-card px-2.5 font-mono text-xs font-medium tracking-widest uppercase ${TYPE_STAMP_CLASSES[type]} ${STAMP_TILTS[index % STAMP_TILTS.length]}`}
          >
            {TYPE_LABELS[type]}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
