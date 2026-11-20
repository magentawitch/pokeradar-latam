"use client";

import { useState, type ReactNode } from "react";
import { PokemonFicha } from "@/components/Panel/PokemonFicha";
import { PokemonStats } from "@/components/Panel/PokemonStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CARD_TABS = ["ficha", "estadisticas"] as const;
type CardTab = (typeof CARD_TABS)[number];

const isCardTab = (value: string): value is CardTab =>
  CARD_TABS.some((tab) => tab === value);

interface PokemonCardProps {
  id: number;
  /** Dex number, name and location; rendered above the ruled body. */
  header: ReactNode;
}

/**
 * The Pokémon's index card: divider tabs on top, a red-ruled header, then a
 * lined body that holds one tab at a time. Each tab loads (and fails) on its
 * own; React Query shares the detail request between them.
 *
 * Both panels stay mounted in one grid cell, so the card is always as tall as
 * the taller one and doesn't change size when switching tabs. The inactive
 * panel is invisible, aria-hidden and inert.
 */
export function PokemonCard({ id, header }: PokemonCardProps) {
  const [tab, setTab] = useState<CardTab>("ficha");

  const panelProps = (value: CardTab) => {
    const isActive = tab === value;
    return {
      value,
      forceMount: true as const,
      "aria-hidden": !isActive,
      inert: !isActive,
      className: "invisible col-start-1 row-start-1 data-active:visible",
    };
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (isCardTab(value)) setTab(value);
      }}
      className="min-h-0 flex-1 gap-0"
    >
      <TabsList
        variant="divider"
        aria-label="Secciones de la ficha"
        className="pl-4"
      >
        <TabsTrigger value="ficha">Ficha</TabsTrigger>
        <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
      </TabsList>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card shadow-[0_18px_40px_-12px_rgb(43_42_38/0.45),0_4px_10px_-4px_rgb(43_42_38/0.25)]">
        <div className="shrink-0 border-b-2 border-margin/60">{header}</div>
        <div className="ruled-card grid min-h-0 flex-1 overflow-y-auto rounded-b-lg px-5 py-4">
          <TabsContent {...panelProps("ficha")}>
            <PokemonFicha id={id} />
          </TabsContent>
          <TabsContent {...panelProps("estadisticas")}>
            {/* Remounted on each visit, so the bars fill in when it opens. */}
            <PokemonStats
              key={tab === "estadisticas" ? "shown" : "hidden"}
              id={id}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
