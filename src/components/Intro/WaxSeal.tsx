import { cn } from "cn";

/** A wobbly wax blob, generated once: 24 lobes smoothed with quadratics. */
const BLOB =
  "M95.4 56.3 Q96.9 62.6 93.0 67.6 Q89.1 72.6 86.8 78.5 Q84.4 84.4 78.1 86.1 Q71.9 87.9 67.0 91.5 Q62.1 95.0 56.0 93.7 Q50.0 92.4 44.0 93.7 Q37.9 95.0 33.0 91.5 Q28.1 87.9 21.9 86.1 Q15.6 84.4 13.2 78.5 Q10.9 72.6 7.0 67.6 Q3.1 62.6 4.6 56.3 Q6.2 50.0 5.6 44.0 Q5.0 37.9 9.1 33.4 Q13.3 28.8 15.2 22.9 Q17.0 17.0 22.6 14.6 Q28.1 12.1 32.8 7.6 Q37.4 3.1 43.7 3.9 Q50.0 4.8 56.3 3.9 Q62.6 3.1 67.2 7.6 Q71.9 12.1 77.4 14.6 Q83.0 17.0 84.8 22.9 Q86.7 28.8 90.9 33.4 Q95.0 37.9 94.4 44.0 Q93.8 50.0 95.4 56.3Z";

/** Four-point compass star pressed into the wax. */
const COMPASS_STAR =
  "M50 22 L55 45 L78 50 L55 55 L50 78 L45 55 L22 50 L45 45 Z";
const DIAGONAL_STAR =
  "M62 38 L54 50 L62 62 L50 54 L38 62 L46 50 L38 38 L50 46 Z";

interface WaxSealProps {
  className?: string;
}

/**
 * A vermilion wax seal with a compass pressed into it: everything in shades
 * of the wax itself (a darker rim and an embossed star), no white and no
 * black, so it reads as real wax. Decorative.
 */
export function WaxSeal({ className }: WaxSealProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn(
        "drop-shadow-[0_2px_2px_color-mix(in_oklab,var(--color-hanko-deep)_55%,transparent)]",
        className,
      )}
    >
      <path d={BLOB} className="fill-hanko" />
      {/* The pressed-in face: a slightly deeper disc with a raised rim. */}
      <circle cx="50" cy="50" r="32" className="fill-hanko-deep/25" />
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        strokeWidth="3"
        className="stroke-hanko-deep/70"
      />
      <path d={DIAGONAL_STAR} className="fill-hanko-deep/55" />
      <path d={COMPASS_STAR} className="fill-hanko-deep" />
    </svg>
  );
}
