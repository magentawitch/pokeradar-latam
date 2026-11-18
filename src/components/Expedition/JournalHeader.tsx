import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function JournalHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 md:p-6">
      <Card
        size="sm"
        className="pointer-events-auto max-w-sm rounded-lg bg-card/95 shadow-sm ring-border"
      >
        <CardHeader className="gap-0 px-4">
          <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
            Diario de expedición
          </p>
          <CardTitle>
            <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
              PokéRadar
            </h1>
          </CardTitle>
          <CardDescription className="text-ink-muted">
            Doce destinos de Latinoamérica, 151 Pokémon por registrar.
          </CardDescription>
        </CardHeader>
      </Card>
    </header>
  );
}
