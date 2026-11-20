import Image from "next/image";
import type { Explorer } from "@/lib/explorer/store";
import { trainerSpriteUrl } from "@/utils/pokemonHelpers";

interface WelcomeBackPageProps {
  explorer: Explorer;
}

/** The page a returning explorer glimpses as the cover swings open. */
export function WelcomeBackPage({ explorer }: WelcomeBackPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <Image
        src={trainerSpriteUrl(explorer.avatarId)}
        alt=""
        width={80}
        height={80}
        unoptimized
        draggable={false}
        className="size-28 object-contain [image-rendering:pixelated]"
      />
      <p className="font-hand text-3xl text-ink">
        Retomando la expedición, {explorer.name}…
      </p>
    </div>
  );
}
