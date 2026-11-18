"use client";

import dynamic from "next/dynamic";
import { MapFallback } from "@/components/Map/MapFallback";
import type { BiomeRoster } from "@/lib/biomes/types";

const ExpeditionMap = dynamic(
  () =>
    import("@/components/Map/ExpeditionMap").then(
      (mapModule) => mapModule.ExpeditionMap,
    ),
  { ssr: false, loading: () => <MapFallback /> },
);

interface ExpeditionAppProps  {
  roster: BiomeRoster;
};

export function ExpeditionApp({ roster }: ExpeditionAppProps) {
  return <ExpeditionMap roster={roster} />;
}
