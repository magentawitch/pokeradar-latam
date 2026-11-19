"use client";

import { useState } from "react";
import Image from "next/image";

interface PokemonSpriteProps {
  animatedSrc: string | null;
  staticSrc: string | null;
}

/**
 * The animated Showdown gif, falling back to the static sprite when the gif is
 * missing or fails to load. `unoptimized` keeps the gif animated and skips the
 * image optimizer. Decorative: the panel title already names the Pokémon.
 */
export function PokemonSprite({ animatedSrc, staticSrc }: PokemonSpriteProps) {
  // Remembering *which* src failed resets the fallback when the Pokémon changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src =
    animatedSrc !== null && animatedSrc !== failedSrc ? animatedSrc : staticSrc;

  return (
    <div className="flex size-28 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-ink-brown/40 bg-paper">
      {src !== null && (
        <Image
          key={src}
          src={src}
          alt=""
          width={96}
          height={96}
          unoptimized
          draggable={false}
          onError={() => setFailedSrc(src)}
          className="size-20 object-contain [image-rendering:pixelated]"
        />
      )}
    </div>
  );
}
