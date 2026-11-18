import { Suspense } from "react";
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
      <JournalHeader />
    </main>
  );
}
