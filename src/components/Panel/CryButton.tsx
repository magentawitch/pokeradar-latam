"use client";

import { IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCanPlayCries,
  usePokemonCry,
  useSoundMuted,
} from "@/hooks/usePokemonCry";

interface CryButtonProps {
  url: string;
  className?: string;
}

/**
 * Replays the Pokémon's cry from its card. While sound is muted it stays, shown
 * muted and disabled, so the cry is still discoverable; hidden only when the
 * browser can't play cries at all, like the mute toggle.
 */
export function CryButton({ url, className }: CryButtonProps) {
  const canPlayCries = useCanPlayCries();
  const [isMuted] = useSoundMuted();
  const playCry = usePokemonCry();

  if (!canPlayCries) return null;

  const Icon = isMuted ? IconVolumeOff : IconVolume;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Escuchar su grito"
          // aria-disabled, not disabled: it stays focusable and keeps its
          // tooltip, which says why it's silent.
          aria-disabled={isMuted}
          onClick={() => {
            if (!isMuted) playCry(url);
          }}
          className={cn(
            "rounded-full bg-card shadow-sm aria-disabled:cursor-not-allowed aria-disabled:hover:bg-card",
            className,
          )}
        >
          <Icon className={isMuted ? "text-ink-muted" : "text-ink-brown"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {isMuted ? "Sonido silenciado" : "Escuchar"}
      </TooltipContent>
    </Tooltip>
  );
}
