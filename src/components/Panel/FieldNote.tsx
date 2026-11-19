import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpeciesNote } from "@/lib/pokeapi/pokemon";

interface FieldNoteProps {
  note: SpeciesNote | undefined;
  isPending: boolean;
  isError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

/**
 * The species' flavour text, handwritten in the margin. It loads and fails on
 * its own, so a species error never hides the rest of the page. Every state
 * shares the same min height to avoid layout shift.
 */
export function FieldNote({
  note,
  isPending,
  isError,
  isRetrying,
  onRetry,
}: FieldNoteProps) {
  return (
    <section
      aria-labelledby="field-note-heading"
      className="flex min-h-28 flex-col gap-1 rounded-md border border-dashed border-ink-brown/40 bg-paper px-4 py-3"
    >
      <h3
        id="field-note-heading"
        className="font-mono text-xs tracking-widest text-ink-muted uppercase"
      >
        Nota de campo
      </h3>
      <FieldNoteBody
        note={note}
        isPending={isPending}
        isError={isError}
        isRetrying={isRetrying}
        onRetry={onRetry}
      />
    </section>
  );
}

function FieldNoteBody({
  note,
  isPending,
  isError,
  isRetrying,
  onRetry,
}: FieldNoteProps) {
  if (isPending) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-2 pt-1">
        <Skeleton className="h-5 w-full bg-rule" />
        <Skeleton className="h-5 w-4/5 bg-rule" />
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2">
        <p className="text-sm text-ink-muted">
          No pudimos leer esta nota. La tinta se corrió.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!note) {
    return (
      <p className="text-sm text-ink-muted">
        Todavía no hay notas sobre esta especie.
      </p>
    );
  }

  return (
    <p
      lang={note.language}
      className="font-hand text-2xl leading-snug text-ink-brown"
    >
      {note.text}
    </p>
  );
}
