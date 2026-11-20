"use client";

import { useEffect } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: unknown;
  /** Re-fetches the page's data (the roster) and renders it again. */
  retry: () => void;
}

/**
 * Shown when the page itself fails, in practice when PokéAPI is down or
 * changed shape while the roster was being fetched. A paper page in the
 * journal's voice instead of Next's default error screen.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <div
        aria-hidden="true"
        className="graph-paper pointer-events-none absolute inset-0"
      />
      <h1 className="relative font-display text-3xl font-semibold text-ink">
        No pudimos desplegar el mapa
      </h1>
      <p className="relative max-w-sm font-hand text-2xl text-ink-brown">
        Se nos mojó la tinta. Probá de nuevo en un momento.
      </p>
      <Button
        variant="outline"
        size="lg"
        onClick={() => retry()}
        className="relative h-10 gap-2 rounded-full bg-card px-4 font-semibold text-ink shadow-sm"
      >
        <IconRefresh className="size-4 text-ink-brown" />
        Reintentar
      </Button>
    </main>
  );
}
