/*
 * The journal cover's decorations: a pasted title sticker, a Pokéball doodle
 * on a round paper sticker, a compass inked straight onto the cloth, and a
 * luggage-style "LATAM" label. All spans and SVG, since they render inside
 * the cover button, and all decorative: the button's label names it.
 */
import { cn } from "cn";

/** Clean paper sticker with the journal's title, slightly askew. */
export function CoverTitleLabel() {
  return (
    <span className="flex w-[64%] max-w-80 -rotate-2 md:w-[70%] flex-col items-center gap-1 rounded-md bg-card px-5 pt-4 pb-3 text-center shadow-[2px_4px_8px_-3px_rgb(43_42_38/0.35)]">
      <span className="font-hand text-4xl leading-[0.95] font-bold text-ink-brown-deep md:text-5xl">
        Diario de expedición
      </span>
      <span className="mt-1 h-px w-4/5 bg-hanko/60" />
      <span className="font-sans text-xs font-semibold tracking-wide text-ink-muted md:text-sm">
        PokéRadar · Latinoamérica
      </span>
    </span>
  );
}

interface PokeballStickerProps {
  className?: string;
}

/** A hand-drawn Pokéball on a round paper sticker. */
export function PokeballSticker({ className }: PokeballStickerProps) {
  return (
    <span
      className={cn(
        "flex size-16 items-center justify-center rounded-full bg-card shadow-[1px_3px_6px_-2px_rgb(43_42_38/0.35)] md:size-20",
        className,
      )}
    >
      <svg viewBox="0 0 40 40" className="size-3/5" fill="none">
        <path
          d="M4 20a16 16 0 0 1 32 0Z"
          className="fill-margin/55 stroke-ink-brown"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          className="stroke-ink-brown"
          strokeWidth="2.2"
        />
        <path
          d="M4 20h10M26 20h10"
          className="stroke-ink-brown"
          strokeWidth="2.2"
        />
        <circle
          cx="20"
          cy="20"
          r="5.5"
          className="fill-card stroke-ink-brown"
          strokeWidth="2.2"
        />
        <circle
          cx="20"
          cy="20"
          r="2"
          className="stroke-ink-brown"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
}

interface CompassInkProps {
  className?: string;
}

/** A compass rubber-stamped straight onto the cloth, in faded blue ink. */
export function CompassInk({ className }: CompassInkProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      className={cn("stamp-worn stroke-cover-ink opacity-45", className)}
    >
      <circle cx="30" cy="30" r="27" strokeWidth="1.6" />
      <circle cx="30" cy="30" r="22" strokeWidth="1" />
      <path d="M30 8v4M30 48v4M8 30h4M48 30h4" strokeWidth="1.2" />
      <path
        d="M30 10 34 30 30 50 26 30Z"
        strokeWidth="1"
        className="fill-cover-ink/70"
        transform="rotate(20 30 30)"
      />
      <path
        d="M12 30 30 27 48 30 30 33Z"
        strokeWidth="1"
        transform="rotate(20 30 30)"
      />
      <text
        x="30"
        y="7"
        textAnchor="middle"
        className="fill-cover-ink stroke-none font-display text-[6px] font-bold"
      >
        N
      </text>
    </svg>
  );
}

interface LatamLabelProps {
  className?: string;
}

/** A small luggage-style label with a red ink border. */
export function LatamLabel({ className }: LatamLabelProps) {
  return (
    <span
      className={cn(
        "block -rotate-3 rounded-[3px] bg-card p-1 shadow-[1px_3px_6px_-2px_rgb(43_42_38/0.35)]",
        className,
      )}
    >
      <span className="flex flex-col items-center border-2 border-hanko/80 px-2 py-0.5 text-hanko md:px-3 md:py-1">
        <span className="font-display text-lg leading-tight font-bold tracking-[0.18em] md:text-2xl">
          LATAM
        </span>
        <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase md:text-[0.6rem]">
          Expedición · 2026
        </span>
      </span>
    </span>
  );
}
