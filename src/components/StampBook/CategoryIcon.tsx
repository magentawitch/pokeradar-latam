import type { ReactNode } from "react";
import type { HabitatName } from "@/lib/pokeapi/schemas";
import { rectPath, SHELL_RIBS_PATH, starPath } from "@/utils/sealHelpers";

/**
 * One filled silhouette per stamp-book page, drawn in a 100×100 box like the
 * Pokémon silhouettes on the stamps. They take their fill from the parent,
 * so the same shapes work in gold, in ink or as a faint hint. Swap a page's
 * icon by editing its entry here.
 */
const CATEGORY_ICONS: Record<HabitatName, ReactNode> = {
  // Orillas: a scallop shell on its hinge.
  "waters-edge": (
    <>
      <path d={SHELL_RIBS_PATH} />
      <path d="M 40,84 H 60 L 56,94 H 44 Z" />
    </>
  ),
  // Bosques: a three-tier pine on a short trunk.
  forest: (
    <path d="M 50,4 L 72,34 H 62 L 80,58 H 67 L 88,84 H 12 L 33,58 H 20 L 38,34 H 28 Z M 44,84 H 56 V 97 H 44 Z" />
  ),
  // Praderas: a grass tuft with one flower standing above it.
  grassland: (
    <>
      <path d="M 14,94 Q 22,66 8,42 Q 32,62 32,94 Z" />
      <path d="M 28,94 Q 36,58 26,26 Q 48,56 46,94 Z" />
      <path d="M 52,94 Q 66,62 90,48 Q 72,70 70,94 Z" />
      <path d="M 59.5,94 V 32 H 64.5 V 94 Z" />
      {[0, 1, 2, 3, 4].map((petal) => {
        const angle = (petal / 5) * 2 * Math.PI - Math.PI / 2;
        return (
          <circle
            key={petal}
            cx={62 + 8.5 * Math.cos(angle)}
            cy={22 + 8.5 * Math.sin(angle)}
            r={7}
          />
        );
      })}
    </>
  ),
  // Montañas: two peaks, the taller one capped with snow (a cut-out).
  mountain: (
    <path
      fillRule="evenodd"
      d="M 2,88 L 34,34 L 47,54 L 66,16 L 98,88 Z M 66,16 L 76.5,37 L 71,33 L 65,39 L 59,33 L 56,36 Z"
    />
  ),
  // Agreste: a saguaro cactus on the ground.
  "rough-terrain": (
    <>
      <rect x="40" y="8" width="20" height="84" rx="10" />
      <rect x="16" y="32" width="12" height="34" rx="6" />
      <rect x="16" y="54" width="30" height="12" rx="6" />
      <rect x="72" y="22" width="12" height="32" rx="6" />
      <rect x="54" y="42" width="30" height="12" rx="6" />
      <rect x="8" y="88" width="84" height="8" rx="4" />
    </>
  ),
  // Cuevas: a bat with wings spread.
  cave: (
    <path d="M 50,36 L 46,24 L 43.5,37 Q 28,22 2,30 Q 12,42 13,60 Q 24,51 31,63 Q 38,55 44,67 L 50,78 L 56,67 Q 62,55 69,63 Q 76,51 87,60 Q 88,42 98,30 Q 72,22 56.5,37 L 54,24 Z" />
  ),
  // Mar: a curling wave over the swell.
  sea: (
    <path d="M 4,76 Q 18,60 32,62 Q 26,38 48,24 Q 72,10 92,30 Q 72,24 64,38 Q 58,52 72,58 Q 84,62 96,54 V 92 H 4 Z" />
  ),
  // Ciudades: four buildings with cut-out windows and an antenna.
  urban: (
    <path
      fillRule="evenodd"
      d={[
        rectPath(6, 50, 22, 44),
        rectPath(11, 56, 5, 6),
        rectPath(19, 56, 5, 6),
        rectPath(11, 68, 5, 6),
        rectPath(19, 68, 5, 6),
        rectPath(31, 22, 22, 72),
        rectPath(40, 8, 3, 14),
        rectPath(36, 30, 5, 7),
        rectPath(44, 30, 5, 7),
        rectPath(36, 43, 5, 7),
        rectPath(44, 43, 5, 7),
        rectPath(36, 56, 5, 7),
        rectPath(44, 56, 5, 7),
        rectPath(56, 38, 18, 56),
        rectPath(60, 45, 10, 4),
        rectPath(60, 55, 10, 4),
        rectPath(60, 65, 10, 4),
        rectPath(77, 60, 17, 34),
        rectPath(81, 66, 9, 5),
      ].join(" ")}
    />
  ),
  // Raros: a shooting star trailing three streaks.
  rare: (
    <>
      <path d={starPath(66, 34, 26, 11)} />
      <path d="M 44,52 L 8,88 L 14,92 L 50,58 Z" />
      <path d="M 36,40 L 10,62 L 13,66 L 40,45 Z" />
      <path d="M 58,62 L 38,90 L 42,93 L 63,66 Z" />
    </>
  ),
};

interface CategoryIconProps {
  habitat: HabitatName;
  /** Placement inside a parent SVG, in its user units. */
  x: number;
  y: number;
  size: number;
  /** Any SVG paint: a colour or a `url(#gradient)`. */
  fill: string;
}

/** A page's silhouette icon, nested inside a parent SVG. Decorative. */
export function CategoryIcon({ habitat, x, y, size, fill }: CategoryIconProps) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <g fill={fill}>{CATEGORY_ICONS[habitat]}</g>
    </svg>
  );
}
