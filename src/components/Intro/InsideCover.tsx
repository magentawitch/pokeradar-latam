import { CompassRose } from "@/components/Decor/CompassRose";
import { DEFAULT_EXPLORER_NAME } from "@/lib/explorer/store";

interface InsideCoverProps {
  /** What the explorer has typed so far; blank shows the default name. */
  name: string;
}

/**
 * The inside of the journal's cover, the open spread's left page: a cloth
 * rim around a pasted paper sheet with a compass and the classic "if found,
 * return to" line, filled in live as the explorer types. Spans only, since
 * it also renders inside the cover button. Decorative: the card has the name.
 */
export function InsideCover({ name }: InsideCoverProps) {
  const shownName = name.trim() === "" ? DEFAULT_EXPLORER_NAME : name.trim();

  return (
    <span
      aria-hidden="true"
      className="book-cloth absolute inset-0 rounded-l-lg rounded-r-sm"
    >
      <span className="paper-grain absolute inset-2 flex flex-col items-center justify-center gap-4 rounded-l-lg rounded-r-sm px-6 text-center shadow-[inset_-14px_0_16px_-12px_rgb(43_42_38/0.35)]">
        <CompassRose className="size-24" />
        <span className="font-hand text-2xl leading-tight text-ink-muted">
          Si encontrás este diario,
          <br />
          devolvelo a:
        </span>
        <span className="w-4/5 truncate border-b-2 border-dashed border-ink-brown/40 pb-1 font-hand text-3xl text-ink">
          {shownName}
        </span>
        <span className="text-xs tracking-[0.18em] text-ink-muted uppercase">
          PokéRadar · Latinoamérica
        </span>
      </span>
    </span>
  );
}
