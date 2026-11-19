"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RosterEntry } from "@/lib/biomes/types";
import {
  formatPokemonName,
  pokemonMarkerDomId,
  staticSpriteUrl,
} from "@/utils/pokemonHelpers";

/** Pop-in length per marker; the last one starts before SWEEP_DURATION_MS ends. */
const POP_DURATION_S = 0.3;

interface PokemonMarkerProps {
  entry: RosterEntry;
  /** When the sweep reaches this marker; ignored with reduced motion. */
  revealDelayMs: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDeselect: () => void;
}

export function PokemonMarker({
  entry,
  revealDelayMs,
  isSelected,
  onSelect,
  onDeselect,
}: PokemonMarkerProps) {
  const reduceMotion = useReducedMotion();
  const [longitude, latitude] = entry.position;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      // Keep the selected marker above its neighbours.
      style={{ zIndex: isSelected ? 1 : 0 }}
    >
      {/* MapLibre owns the marker root's transform; animate this child instead. */}
      <motion.div
        initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: revealDelayMs / 1000,
          duration: POP_DURATION_S,
          ease: "backOut",
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              id={pokemonMarkerDomId(entry.id)}
              variant="specimen"
              size="specimen"
              // A toggle: pressed while its page is open; pressing again closes it.
              aria-pressed={isSelected}
              onClick={() => (isSelected ? onDeselect() : onSelect(entry.id))}
            >
              {/* Sprites carry wide transparent margins, so draw them past the ring. */}
              <Image
                src={staticSpriteUrl(entry.id)}
                alt={formatPokemonName(entry.name)}
                width={96}
                height={96}
                unoptimized
                draggable={false}
                className="size-[150%] max-w-none [image-rendering:pixelated]"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            {formatPokemonName(entry.name)}
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </Marker>
  );
}
