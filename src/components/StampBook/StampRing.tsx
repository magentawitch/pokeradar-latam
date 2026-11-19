interface StampRingProps {
  /** Unique per stamp; namespaces the text paths. */
  id: number;
  /** Curved along the top: the location's name. */
  topText: string;
  /** Curved along the bottom: the discovery date. */
  bottomText: string;
}

// Plex Mono glyphs are 0.6em wide, so the fitting size is exact.
const MONO_ADVANCE = 0.6;
const TOP_ARC_PX = 104;
const MAX_FONT_SIZE = 8.5;

/**
 * The circular border of a station stamp: double ring in `currentColor`,
 * location name over the top and date along the bottom in the darker
 * `--habitat-stamp-text`, so the text passes AA. No hooks or state,
 * so it renders anywhere. Decorative: the stamp's caption carries the text.
 */
export function StampRing({ id, topText, bottomText }: StampRingProps) {
  const label = topText.toUpperCase();
  const fontSize = Math.min(
    MAX_FONT_SIZE,
    TOP_ARC_PX / (label.length * MONO_ADVANCE),
  );
  const topPathId = `stamp-${id}-top`;
  const bottomPathId = `stamp-${id}-bottom`;

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="absolute inset-0 size-full overflow-visible font-mono"
    >
      <circle
        cx="50"
        cy="50"
        r="47.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Clockwise over the top: glyphs stand outward on the baseline. */}
      <path id={topPathId} d="M 11,50 A 39,39 0 0 1 89,50" fill="none" />
      {/* Anticlockwise under the bottom: glyphs stay upright. */}
      <path id={bottomPathId} d="M 6,50 A 44,44 0 0 0 94,50" fill="none" />
      <text
        className="fill-(--habitat-stamp-text)"
        fontSize={fontSize}
        fontWeight={500}
        textAnchor="middle"
      >
        <textPath href={`#${topPathId}`} startOffset="50%">
          {label}
        </textPath>
      </text>
      <text
        className="fill-(--habitat-stamp-text)"
        fontSize={7.5}
        fontWeight={500}
        textAnchor="middle"
      >
        <textPath href={`#${bottomPathId}`} startOffset="50%">
          {bottomText}
        </textPath>
      </text>
    </svg>
  );
}
