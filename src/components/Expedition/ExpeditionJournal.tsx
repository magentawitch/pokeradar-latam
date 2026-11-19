"use client";

import { useState } from "react";
import { IconNotebook } from "@tabler/icons-react";
import { BiomeIndex } from "@/components/Hud/BiomeIndex";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BIOMES } from "@/lib/biomes/biomes";
import type { BiomeConfig, BiomeId, BiomeRoster } from "@/lib/biomes/types";

interface ExpeditionJournalProps {
  roster: BiomeRoster;
  activeBiomeId: BiomeId | null;
  onBiomeSelect: (biome: BiomeConfig) => void;
}

const sectionHeading =
  "px-2.5 font-mono text-xs tracking-widest text-ink-muted uppercase";

/**
 * The app's header: a small "PokéRadar" pill that opens the expedition diary,
 * a drawer from the left with the intro, the destinations and how to explore.
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
        <SheetHeader className="gap-1 border-b border-border px-5 pt-5 pb-4">
          <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
            Diario de expedición
          </p>
          <SheetTitle className="font-display text-3xl font-semibold text-ink">
            PokéRadar
          </SheetTitle>
          <SheetDescription className="text-ink-muted">
            {BIOMES.length} destinos de Latinoamérica, 151 Pokémon por
            registrar.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-2.5 py-4">
          <section
            aria-labelledby="journal-destinations"
            className="flex flex-col gap-2"
          >
            <h2 id="journal-destinations" className={sectionHeading}>
              Destinos
            </h2>
            <BiomeIndex
              roster={roster}
              activeBiomeId={activeBiomeId}
              onSelect={handleBiomeSelect}
            />
          </section>

          <section
            aria-labelledby="journal-how-to"
            className="flex flex-col gap-2"
          >
            <h2 id="journal-how-to" className={sectionHeading}>
              Cómo explorar
            </h2>
            <ul className="flex list-disc flex-col gap-1 pr-2.5 pl-7 text-ink-muted marker:text-ink-brown">
              <li>Arrastrá el mapa para moverte.</li>
              <li>
                <span className="md:hidden">Pellizcá</span>
                <span className="hidden md:inline">Usá la rueda</span> para
                acercar o alejar.
              </li>
              <li>
                <span className="md:hidden">Tocá</span>
                <span className="hidden md:inline">Hacé clic en</span> un sello
                para revelar los Pokémon de ese destino.
              </li>
              <li>
                <span className="md:hidden">Tocá</span>
                <span className="hidden md:inline">Hacé clic en</span> un
                Pokémon para abrir su ficha.
              </li>
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
