import { cn } from "cn";

const DIAGONAL_ANGLES = [45, 135, 225, 315];

/** Outer ring split into four arcs, leaving gaps where the cardinal points poke through. */
const OUTER_ARCS = [
  "M56.12 6.43 A44 44 0 0 1 93.57 43.88",
  "M93.57 56.12 A44 44 0 0 1 56.12 93.57",
  "M43.88 93.57 A44 44 0 0 1 6.43 56.12",
  "M6.43 43.88 A44 44 0 0 1 43.88 6.43",
];

/** Long four-point star for N/E/S/W. */
const CARDINAL_STAR =
  "M50 4 L57.07 42.93 L96 50 L57.07 57.07 L50 96 L42.93 57.07 L4 50 L42.93 42.93 Z";

/** Shorter four-point star tucked behind it on the diagonals. */
const DIAGONAL_STAR =
  "M68.38 31.62 L58 50 L68.38 68.38 L50 58 L31.62 68.38 L42 50 L31.62 31.62 L50 42 Z";

const LABELS = [
  { letter: "N", x: 50, y: -7 },
  { letter: "E", x: 107, y: 50 },
  { letter: "S", x: 50, y: 107 },
  { letter: "W", x: -7, y: 50 },
];

interface CompassRoseProps {
  className?: string;
}

/** Original line-drawn compass rose, fixed to a screen corner. Decorative only. */
export function CompassRose({ className }: CompassRoseProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-16 -16 132 132"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      className={cn(
        "pointer-events-none stroke-ink-brown drop-shadow-sm",
        className,
      )}
    >
      <circle cx="50" cy="50" r="44" className="fill-card/80 stroke-none" />
      <g className="stroke-ink-brown/60">
        {OUTER_ARCS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {DIAGONAL_ANGLES.map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="6"
          x2="50"
          y2="19"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="31" />
      <path d={DIAGONAL_STAR} className="fill-card" />
      <path d={CARDINAL_STAR} className="fill-card" />
      <path d="M50 4 V96 M4 50 H96" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="8" className="fill-card" />
      <circle cx="50" cy="50" r="3" />
      {LABELS.map(({ letter, x, y }) => (
        <text
          key={letter}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-ink stroke-none font-display text-[15px] font-semibold"
        >
          {letter}
        </text>
      ))}
    </svg>
  );
}
