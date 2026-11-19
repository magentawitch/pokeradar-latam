import { Suspense } from "react";
import { CompassRose } from "@/components/Decor/CompassRose";
import { GraphPaperOverlay } from "@/components/Decor/GraphPaperOverlay";
import { ExpeditionApp } from "@/components/Expedition/ExpeditionApp";
import { MapFallback } from "@/components/Map/MapFallback";
import { StampBook } from "@/components/StampBook/StampBook";
import { getBiomeRoster } from "@/lib/pokeapi/roster";

export default async function Home() {
  const roster = await getBiomeRoster();

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Suspense fallback={<MapFallback />}>
        <ExpeditionApp roster={roster} />
      </Suspense>
      <StampBook roster={roster} />
      <GraphPaperOverlay />
      <CompassRose className="absolute right-3 bottom-28 size-14 md:right-6 md:bottom-12 md:size-20" />
    </main>
  );
}
