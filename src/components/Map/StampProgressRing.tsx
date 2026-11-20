interface StampProgressRingProps {
  collected: number;
  total: number;
}

// The 48-unit box sits 8px outside a 32px stamp (inset -8px), so 1 unit is
// 1px there; on the 36px md: stamp it scales with the box. The ring clears
// the sticker's 2.5px die-cut edge by 1.5 units.
const VIEWBOX = 48;
const RADIUS = 21.5;
/** Share of each segment left blank between pips. */
const GAP = 0.22;

/**
 * Progress pips around a destination stamp: one arc per Pokémon living
 * there, inked in the sticker's own border colour once discovered, clockwise from
 * the top. Sits just outside the sticker's cream die-cut edge. Decorative:
 * the stamp's accessible name carries the count.
 */
export function StampProgressRing({
  collected,
  total,
}: StampProgressRingProps) {
  if (total === 0) return null;
  const center = VIEWBOX / 2;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      aria-hidden="true"
      className="pointer-events-none absolute -inset-2 size-[calc(100%+1rem)] -rotate-90 overflow-visible"
    >
      {Array.from({ length: total }, (_, index) => (
        <circle
          key={index}
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={total}
          // One segment of length 1 per Pokémon; a lone Pokémon gets the
          // whole circle.
          strokeDasharray={total === 1 ? undefined : `${1 - GAP} ${total}`}
          strokeDashoffset={total === 1 ? undefined : -index - GAP / 2}
          className={
            index < collected ? "stroke-(--habitat-ink)" : "stroke-ink-brown/40"
          }
        />
      ))}
    </svg>
  );
}
