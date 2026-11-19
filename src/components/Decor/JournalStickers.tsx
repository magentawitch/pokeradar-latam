import { cn } from "cn";
import { perforatedRectPath } from "@/utils/decorHelpers";

const STAMP_WIDTH = 60;
const STAMP_HEIGHT = 72;
const STAMP_OUTLINE = perforatedRectPath(STAMP_WIDTH, STAMP_HEIGHT, 2.5, 7.2);

/** A postage stamp: the Andes under a sun, perforated edge. */
function PostageSticker() {
  return (
    <svg
      viewBox={`0 0 ${STAMP_WIDTH} ${STAMP_HEIGHT}`}
      className="w-12 -rotate-6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={STAMP_OUTLINE} className="fill-card" />
      <rect
        x="7"
        y="7"
        width="46"
        height="46"
        className="fill-sticker-teal/15 stroke-sticker-teal"
        strokeWidth="1.5"
      />
      <circle cx="38" cy="20" r="5" className="fill-sticky stroke-ink-brown" />
      <path
        d="M7 47 L19 27 L25 36 L32 24 L45 43 L53 36 V53 H7 Z"
        className="fill-land stroke-ink-brown"
        strokeWidth="1.5"
      />
      <path d="M17 31 L19 27 L21.5 31" className="fill-none stroke-ink-brown" />
      <path d="M30 28 L32 24 L34.5 28" className="fill-none stroke-ink-brown" />
      <text
        x="30"
        y="64"
        textAnchor="middle"
        className="fill-ink font-mono text-[7px] font-medium tracking-[0.2em]"
      >
        LATAM
      </text>
    </svg>
  );
}

/** A round die-cut sticker with a leaf. */
function LeafSticker() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-10 rotate-12"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="24" cy="24" r="23" className="fill-card" />
      <circle
        cx="24"
        cy="24"
        r="18"
        className="fill-sticker-green/15 stroke-sticker-green"
        strokeWidth="1.5"
      />
      <path
        d="M14 34 C14 22 22 13 35 13 C35 26 27 34 14 34 Z"
        className="fill-sticker-green/70 stroke-sticker-green"
        strokeWidth="1.5"
      />
      <path
        d="M14 34 L29 19 M20 28 H25 M24 24 V19"
        className="fill-none stroke-card"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** A luggage-tag sticker counting the Pokémon to log. */
function CountSticker() {
  return (
    <svg
      viewBox="0 0 56 36"
      className="w-12 rotate-6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M10 1 H53 a2 2 0 0 1 2 2 V33 a2 2 0 0 1 -2 2 H10 L1 18 Z"
        className="fill-card"
      />
      <path
        d="M12 5 H50 a1 1 0 0 1 1 1 V30 a1 1 0 0 1 -1 1 H12 L6 18 Z"
        className="fill-sticky stroke-ink-brown"
        strokeWidth="1.25"
      />
      <circle cx="13" cy="18" r="2" className="fill-card stroke-ink-brown" />
      <text
        x="33"
        y="24"
        textAnchor="middle"
        className="fill-ink font-display text-[17px] font-semibold"
      >
        151
      </text>
    </svg>
  );
}

interface JournalStickersProps {
  className?: string;
}

/**
 * A cluster of stickers slapped on the diary's cover. Decorative only;
 * hidden from assistive tech and never takes input.
 */
export function JournalStickers({ className }: JournalStickersProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none flex items-center gap-4 drop-shadow-sm",
        className,
      )}
    >
      <PostageSticker />
      <LeafSticker />
      <CountSticker />
    </div>
  );
}
