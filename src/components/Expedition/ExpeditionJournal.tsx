"use client";

import { useState } from "react";
import { IconNotebook } from "@tabler/icons-react";
import { JournalStickers } from "@/components/Decor/JournalStickers";
import { BiomeIndex } from "@/components/Hud/BiomeIndex";
import { ExploreGuide } from "@/components/Hud/ExploreGuide";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BIOMES } from "@/lib/biomes/biomes";
import type { BiomeConfig, BiomeId, BiomeRoster } from "@/lib/biomes/types";

interface ExpeditionJournalProps {
  roster: BiomeRoster;
  activeBiomeId: BiomeId | null;
  onBiomeSelect: (biome: BiomeConfig) => void;
}

/**
 * The app's header: a small "PokéRadar" pill that opens the expedition diary,
 * a drawer from the left with two divider tabs (the same ones as the Pokémon
 * card): the destinations by region, and how to explore with a map legend.
 * Left, so it never meets the Pokémon card (bottom on phones, centre above).
 */
export function ExpeditionJournal({
  roster,
  activeBiomeId,
  onBiomeSelect,
}: ExpeditionJournalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close first, so the flight plays on an uncovered map.
  const handleBiomeSelect = (biome: BiomeConfig) => {
    setIsOpen(false);
    onBiomeSelect(biome);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <header className="absolute top-4 left-4 z-10 md:top-6 md:left-6">
        <h1>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="h-10 gap-2 rounded-full bg-card/95 px-3.5 shadow-sm"
            >
              <IconNotebook className="size-5 text-ink-brown" />
              <span className="font-display text-lg font-semibold text-ink">
                PokéRadar
              </span>
              <span className="sr-only"> · abrir el diario de expedición</span>
            </Button>
          </SheetTrigger>
        </h1>
      </header>

      <SheetContent side="left" className="gap-0 bg-card">
        <SheetHeader className="gap-1 px-5 pt-5 pb-4">
          <JournalStickers className="pb-3" />
          <SheetTitle className="font-display text-3xl font-semibold text-ink">
            PokéRadar
          </SheetTitle>
          <SheetDescription className="text-ink-muted">
            {BIOMES.length} destinos de Latinoamérica, 151 Pokémon por
            registrar.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="destinos" className="min-h-0 flex-1 gap-0">
          <TabsList
            variant="divider"
            aria-label="Secciones del diario"
            className="pl-4"
          >
            <TabsTrigger value="destinos">Destinos</TabsTrigger>
            <TabsTrigger value="como-explorar">Cómo explorar</TabsTrigger>
          </TabsList>
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-border">
            <TabsContent value="destinos" className="px-2.5 py-3">
              <BiomeIndex
                roster={roster}
                activeBiomeId={activeBiomeId}
                onSelect={handleBiomeSelect}
              />
            </TabsContent>
            <TabsContent value="como-explorar">
              <ExploreGuide />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
