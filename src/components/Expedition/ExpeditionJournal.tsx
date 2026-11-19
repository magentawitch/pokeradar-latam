"use client";

import { useState } from "react";
import { IconMap } from "@tabler/icons-react";
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
import { openAfterOutsideDismiss } from "@/utils/dialogHelpers";

interface ExpeditionJournalProps {
  roster: BiomeRoster;
  activeBiomeId: BiomeId | null;
  onBiomeSelect: (biome: BiomeConfig) => void;
}

/**
 * The app's header: a "Guía" pill (folded-map icon) that opens the expedition diary,
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
      {/* Above the dialog overlays (z-50) and clickable while a modal is
          open, so one click closes the open card or stamp book and opens the
          guide. The drawer itself (z-70) covers this pill. */}
      <header className="pointer-events-auto absolute top-4 left-4 z-60 md:top-6 md:left-6">
        {/* The page heading for assistive tech; on the map the brand only
            appears inside the drawer, so both header pills name an action. */}
        <h1 className="sr-only">PokéRadar</h1>
        <SheetTrigger asChild>
          <Button
            onClick={(event) =>
              openAfterOutsideDismiss(event, isOpen, setIsOpen)
            }
            variant="outline"
            size="lg"
            className="h-10 gap-2 rounded-full bg-card/95 px-3.5 shadow-sm"
          >
            <IconMap className="size-5 text-ink-brown" />
            <span className="font-display text-lg font-semibold text-ink">
              Guía
            </span>
            <span className="sr-only">
              {" "}
              · abrir la guía de destinos y cómo explorar
            </span>
          </Button>
        </SheetTrigger>
      </header>

      <SheetContent side="left" className="z-70 gap-0 bg-card">
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
