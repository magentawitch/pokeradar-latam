"use client";

import { IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanPlayCries, useSoundMuted } from "@/hooks/usePokemonCry";

/**
 * Mutes the Pokémon cries; pressed means muted. The choice persists in
 * localStorage. Hidden when the browser can't play the cries (Ogg Vorbis), so
 * there is never a control that does nothing.
 */
export function MuteToggle() {
  const canPlayCries = useCanPlayCries();
  const [isMuted, setMuted] = useSoundMuted();

  if (!canPlayCries) return null;

  const Icon = isMuted ? IconVolumeOff : IconVolume;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          variant="outline"
          pressed={isMuted}
          onPressedChange={setMuted}
          aria-label="Silenciar sonidos"
          className="size-10 rounded-full border-border bg-card/95 shadow-sm hover:bg-muted data-[state=on]:bg-card/95 data-[state=on]:hover:bg-muted"
        >
          <Icon className="size-5 text-ink-brown" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {isMuted ? "Activar sonido" : "Silenciar"}
      </TooltipContent>
    </Tooltip>
  );
}
