import { Suspense } from "react";
import { CompassRose } from "@/components/Decor/CompassRose";
import { GraphPaperOverlay } from "@/components/Decor/GraphPaperOverlay";
import { ExpeditionApp } from "@/components/Expedition/ExpeditionApp";
import { JournalHeader } from "@/components/Expedition/JournalHeader";
import { MapFallback } from "@/components/Map/MapFallback";
import { getBiomeRoster } from "@/lib/pokeapi/roster";

export default async function Home() {
  const roster = await getBiomeRoster();

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Suspense fallback={<MapFallback />}>
        <ExpeditionApp roster={roster} />
      </Suspense>
      <GraphPaperOverlay />
      <CompassRose className="absolute right-4 bottom-10 size-16 md:top-6 md:right-6 md:bottom-auto md:size-24" />
      <JournalHeader />
    </main>
  );
}
