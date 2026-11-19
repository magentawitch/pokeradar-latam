"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PokemonCard } from "@/components/Panel/PokemonCard";
import { BIOMES } from "@/lib/biomes/biomes";
import type { RosterEntry } from "@/lib/biomes/types";
import {
  formatDexNumber,
  formatPokemonName,
  pokemonMarkerDomId,
} from "@/utils/pokemonHelpers";

interface DetailPanelProps {
  /** The selected Pokémon; null closes the card. */
  entry: RosterEntry | null;
  onClose: () => void;
}

/**
 * The selected Pokémon's index card, in a modal shadcn Dialog. The overlay is
 * a light ink tint with no blur, so the map (and the marker, which the camera
 * keeps beside the card) still reads underneath. Clicking it, Esc or Cerrar
 * closes the card. Centred from `md:`, anchored to the bottom on phones; it
 * sizes to its content up to 85dvh, past which the body scrolls.
 * useCameraPadding mirrors the desktop width.
 */
export function DetailPanel({ entry, onClose }: DetailPanelProps) {
  // Keeps the last Pokémon on the card while it fades out.
  const [shownEntry, setShownEntry] = useState(entry);
  if (entry !== null && entry !== shownEntry) setShownEntry(entry);

  const biome = shownEntry
    ? BIOMES.find((candidate) => candidate.id === shownEntry.biomeId)
    : undefined;

  return (
    <Dialog
      open={entry !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        // Without a location line there is nothing to describe the dialog.
        {...(biome ? {} : { "aria-describedby": undefined })}
        className="top-auto right-4 bottom-3 left-4 flex max-h-[85dvh] w-auto flex-col max-w-none translate-x-0 translate-y-0 rounded-none bg-transparent p-0 ring-0 sm:max-w-none md:top-1/2 md:right-auto md:bottom-auto md:left-1/2 md:w-md md:-translate-x-1/2 md:-translate-y-1/2 focus:outline-none"
        // Focus the card itself, not the first tab: Radix would otherwise
        // show the tab's focus ring as if the user had tabbed to it. Tab
        // still reaches the tabs and Cerrar next.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
        // Return focus to the marker of the Pokémon on the card. Skipped if
        // the marker is gone (another location revealed); Radix's default
        // applies then.
        onCloseAutoFocus={(event) => {
          if (!shownEntry) return;
          const marker = document.getElementById(
            pokemonMarkerDomId(shownEntry.id),
          );
          if (!marker) return;
          event.preventDefault();
          // The map container clips overflow; scrolling it would shift the map.
          marker.focus({ preventScroll: true });
        }}
      >
        {shownEntry && (
          <PokemonCard
            id={shownEntry.id}
            header={
              <DialogHeader className="relative gap-1 px-5 pt-4 pb-3 md:pt-5 md:pb-4">
                <p className="font-mono text-xs tracking-widest text-ink-muted">
                  {formatDexNumber(shownEntry.id)}
                </p>
                <DialogTitle className="pr-8 font-display text-2xl leading-tight md:text-3xl font-semibold text-ink">
                  {formatPokemonName(shownEntry.name)}
                </DialogTitle>
                {biome && (
                  <DialogDescription className="text-sm text-ink-muted md:text-base">
                    Avistado en {biome.place} · {biome.country}
                  </DialogDescription>
                )}
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-3 right-3"
                  >
                    <IconX />
                    <span className="sr-only">Cerrar</span>
                  </Button>
                </DialogClose>
              </DialogHeader>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
