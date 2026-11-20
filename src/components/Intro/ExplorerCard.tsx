"use client";

import type { FormEvent, RefObject } from "react";
import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AvatarPicker } from "@/components/Intro/AvatarPicker";
import { InkStamp } from "@/components/Intro/InkStamp";
import { WaxSeal } from "@/components/Intro/WaxSeal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_EXPLORER_NAME,
  EXPLORER_NAME_MAX_LENGTH,
  type AvatarId,
} from "@/lib/explorer/store";
import { trainerSpriteUrl } from "@/utils/pokemonHelpers";

interface ExplorerStamp {
  date: string;
  rotation: number;
}

interface ExplorerCardProps {
  nameInputRef: RefObject<HTMLInputElement | null>;
  name: string;
  avatarId: AvatarId;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatarId: AvatarId) => void;
  /** Set once the card is submitted: the stamp lands with this date. */
  stamp: ExplorerStamp | null;
  onSubmit: () => void;
  onStampLanded: () => void;
}

/**
 * The explorer's ID card, filling the journal's first page: a paper
 * credential. The name is optional (blank becomes "Explorador/a") and a photo
 * is preselected, so the shortest path is a single click on the wax seal.
 */
export function ExplorerCard({
  nameInputRef,
  name,
  avatarId,
  onNameChange,
  onAvatarChange,
  stamp,
  onSubmit,
  onStampLanded,
}: ExplorerCardProps) {
  const isStamped = stamp !== null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isStamped) onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="explorer-card-title"
      className="relative flex flex-1 flex-col gap-5 rounded-md md:gap-4 border border-ink-brown/40 bg-card/80 p-4 shadow-[0_2px_0_var(--color-rule),0_8px_16px_-10px_rgb(43_42_38/0.5)] md:p-5"
    >
      <header className="flex items-baseline justify-between gap-3 border-b-2 border-margin/70 pb-2">
        <h2
          id="explorer-card-title"
          className="font-display text-2xl font-semibold text-ink"
        >
          Credencial de explorador/a
        </h2>
        <span className="shrink-0 font-mono text-xs text-ink-muted">
          N.º 0151
        </span>
      </header>

      <div className="flex gap-4">
        {/* The ID photo: the chosen picture. Decorative (the radio group
            below names the choice). */}
        <div
          aria-hidden="true"
          className="flex aspect-[3/4] w-28 shrink-0 items-end justify-center overflow-hidden rounded-sm border-2 border-ink-brown/50 bg-paper shadow-inner"
        >
          <Image
            key={avatarId}
            src={trainerSpriteUrl(avatarId)}
            alt=""
            width={80}
            height={80}
            unoptimized
            draggable={false}
            className="w-[125%] max-w-none translate-y-[4%] [image-rendering:pixelated]"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <Label
            htmlFor="explorer-name"
            className="text-xs leading-snug font-semibold tracking-[0.18em] text-ink-muted uppercase"
          >
            Nombre del explorador/a
          </Label>
          <Input
            ref={nameInputRef}
            id="explorer-name"
            name="explorer-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={EXPLORER_NAME_MAX_LENGTH}
            placeholder={DEFAULT_EXPLORER_NAME}
            autoComplete="off"
            spellCheck={false}
            disabled={isStamped}
            className="h-11 rounded-none border-0 border-b-2 border-dashed border-ink-brown/60 bg-transparent px-1 font-hand text-3xl text-ink placeholder:text-ink-muted/80 focus-visible:border-solid focus-visible:border-ink focus-visible:bg-land/20 focus-visible:ring-0 disabled:bg-transparent disabled:opacity-100 md:text-3xl"
          />
        </div>
      </div>

      <AvatarPicker
        value={avatarId}
        onChange={onAvatarChange}
        disabled={isStamped}
      />

      {/* A wax seal with a compass and the label beside it: the whole row
          is the button. The seal tilts on hover and presses in on click; the
          ink stamp lands where it was. */}
      <Button
        type="submit"
        variant="ghost"
        disabled={isStamped}
        data-stamped={isStamped}
        className="mt-auto h-auto gap-3 self-center rounded-full py-1 pr-4 pl-1 font-display text-xl font-semibold text-ink hover:bg-land/25 focus-visible:ring-3 focus-visible:ring-ink-brown/50 active:not-aria-[haspopup]:translate-y-0 data-[stamped=true]:invisible"
      >
        <WaxSeal className="size-14! transition-transform group-hover/button:-rotate-12 group-active/button:scale-90 motion-reduce:transition-none" />
        <span className="underline decoration-ink-brown/40 decoration-2 underline-offset-4 group-hover/button:decoration-ink-brown">
          Comenzar expedición
        </span>
        <IconArrowRight className="size-5! text-ink-brown transition-transform group-hover/button:translate-x-1 motion-reduce:transition-none" />
      </Button>

      {stamp && (
        <InkStamp
          date={stamp.date}
          rotation={stamp.rotation}
          onLanded={onStampLanded}
        />
      )}
    </form>
  );
}
