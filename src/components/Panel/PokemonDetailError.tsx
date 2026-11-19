import { Button } from "@/components/ui/button";

interface PokemonDetailErrorProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export function PokemonDetailError({
  isRetrying,
  onRetry,
}: PokemonDetailErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-md border border-dashed border-ink-brown/40 bg-paper px-4 py-8 text-center"
    >
      <p className="font-display text-xl text-ink">
        Esta página del diario quedó en blanco
      </p>
      <p className="text-sm text-ink-muted">
        No pudimos traer los datos de campo. Revisá tu conexión y probá de
        nuevo.
      </p>
      <Button type="button" onClick={onRetry} disabled={isRetrying}>
        Reintentar
      </Button>
    </div>
  );
}
