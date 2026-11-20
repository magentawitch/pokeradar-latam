import { CategoryIcon } from "@/components/StampBook/CategoryIcon";
import type { HabitatName } from "@/lib/pokeapi/schemas";
import { SCALLOP_PATH } from "@/utils/sealHelpers";

interface EmptySealProps {
  habitat: HabitatName;
  /** Full page name, for the screen-reader hint. */
  label: string;
  /** Stamps still missing on the page. */
  remaining: number;
}

/**
 * The complete stamp's empty slot: a dashed pinked outline around a faint
 * outline of the page's icon, promising a special stamp once it's full.
 */
export function EmptySeal({ habitat, label, remaining }: EmptySealProps) {
  return (
    <div className="relative flex aspect-square -rotate-6 flex-col items-center justify-end px-4 pb-[24%] text-center">
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
      >
        <path
          d={SCALLOP_PATH}
          fill="none"
          strokeWidth={2}
          strokeDasharray="4 3"
          className="stroke-ink-brown/35"
        />
        <g className="text-ink-brown/20">
          <CategoryIcon
            habitat={habitat}
            x={36}
            y={22}
            size={28}
            fill="currentColor"
          />
        </g>
      </svg>
      <span className="text-[0.65rem] leading-tight text-ink-muted">
        <span className="sr-only">
          Sello conmemorativo pendiente:{" "}
          {remaining === 1 ? "falta 1 sello" : `faltan ${remaining} sellos`}{" "}
          para completar {label}.{" "}
        </span>
        <span aria-hidden="true">Página completa</span>
      </span>
    </div>
  );
}
