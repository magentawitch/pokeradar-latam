"use client";

import { useEffect, useState } from "react";
import {
  dreamWorldSpriteUrl,
  officialArtworkUrl,
} from "@/utils/pokemonHelpers";

type StampSprite =
  | { status: "loading" }
  | { status: "ready"; src: string }
  | { status: "failed" };

/**
 * The image a stamp can use as its silhouette mask. A CSS mask never reports
 * a failed load, so this preloads each candidate as a CORS image (masks are
 * fetched in CORS mode too): the dream world SVG, then the official artwork.
 * If both fail, the stamp shows its dex number instead of an empty ring.
 */
export function useStampSprite(id: number): StampSprite {
  const [sprite, setSprite] = useState<StampSprite>({ status: "loading" });

  useEffect(() => {
    let isCancelled = false;
    const candidates = [dreamWorldSpriteUrl(id), officialArtworkUrl(id)];

    const tryLoad = (index: number) => {
      const src = candidates[index];
      if (src === undefined) {
        if (!isCancelled) setSprite({ status: "failed" });
        return;
      }
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (!isCancelled) setSprite({ status: "ready", src });
      };
      image.onerror = () => {
        if (!isCancelled) tryLoad(index + 1);
      };
      image.src = src;
    };

    tryLoad(0);
    return () => {
      isCancelled = true;
    };
  }, [id]);

  return sprite;
}
