import { Skeleton } from "@/components/ui/skeleton";

/** Paper skeleton shown while the map chunk loads (also the Suspense fallback). */
export function MapFallback() {
  return (
    <div
      role="status"
      className="absolute inset-0 flex items-center justify-center bg-paper"
    >
      <Skeleton className="absolute inset-6 rounded-xl bg-land/40 md:inset-12" />
      <p className="relative font-hand text-2xl text-ink-brown">
        Desplegando el mapa…
      </p>
    </div>
  );
}
