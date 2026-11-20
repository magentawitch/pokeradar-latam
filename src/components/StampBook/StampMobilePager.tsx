import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { StampSection } from "@/lib/discovery/derive";
import type { HabitatName } from "@/lib/pokeapi/schemas";

interface StampMobilePagerProps {
  sections: readonly StampSection[];
  /** Zero-based. */
  pageIndex: number;
  /** Pages with new stamps not yet visited: their dot gets a vermilion "!". */
  unseenHabitats: ReadonlyMap<HabitatName, number>;
  onPageChange: (pageIndex: number) => void;
}

/**
 * Phone navigation, in place of the tab row: the habitat title between
 * prev/next arrows, and one dot per habitat in its ink (gold once the page is
 * complete; the current one larger and ringed, unvisited ones with new stamps
 * topped by a vermilion "!"). The
 * page's own heading stays for assistive tech, so the title here is hidden
 * from it.
 */
export function StampMobilePager({
  sections,
  pageIndex,
  unseenHabitats,
  onPageChange,
}: StampMobilePagerProps) {
  const current = sections[pageIndex];
  if (!current) return null;

  return (
    <nav
      aria-label="Páginas del libro"
      className="flex flex-col items-center gap-2 border-b border-border px-3 pb-3 book:hidden"
    >
      <div className="flex w-full items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          disabled={pageIndex === 0}
          onClick={() => onPageChange(pageIndex - 1)}
        >
          <IconChevronLeft />
          <span className="sr-only">Página anterior</span>
        </Button>
        <p
          aria-hidden="true"
          className="font-display text-lg font-semibold text-ink"
        >
          {current.label}{" "}
          <span className="font-mono text-sm font-normal text-ink-muted">
            {current.collected}/{current.total}
          </span>
        </p>
        <Button
          variant="ghost"
          size="icon"
          disabled={pageIndex === sections.length - 1}
          onClick={() => onPageChange(pageIndex + 1)}
        >
          <IconChevronRight />
          <span className="sr-only">Página siguiente</span>
        </Button>
      </div>
      <ul className="flex items-center gap-1">
        {sections.map((section, index) => {
          const isUnseen = unseenHabitats.has(section.habitat);
          const isComplete = section.completedAt !== null;
          return (
            <li key={section.habitat}>
              {/* A 24px hit area around each small dot. */}
              <button
                type="button"
                data-habitat={section.habitat}
                aria-label={`${section.label}, ${section.collected} de ${section.total}${isComplete ? ", completa" : ""}${isUnseen ? ", sellos nuevos" : ""}`}
                aria-current={index === pageIndex ? "page" : undefined}
                onClick={() => onPageChange(index)}
                className="group relative flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  data-complete={isComplete || undefined}
                  className="size-2 rounded-full bg-(--habitat-stamp) data-complete:bg-linear-135 data-complete:from-gold-dark data-complete:via-gold-light data-complete:to-gold-dark group-aria-[current=page]:size-3 group-aria-[current=page]:ring-2 group-aria-[current=page]:ring-(--habitat-stamp) group-aria-[current=page]:ring-offset-2 group-aria-[current=page]:ring-offset-card data-complete:group-aria-[current=page]:ring-gold-dark"
                />
                {isUnseen && (
                  <span className="absolute -top-0.5 right-0.5 font-display text-xs leading-none font-bold text-hanko">
                    !
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
