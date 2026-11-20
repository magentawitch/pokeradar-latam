"use client";

import Image from "next/image";
import { HandDrawnCircle } from "@/components/Intro/HandDrawnCircle";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AVATARS, type AvatarId } from "@/lib/explorer/store";
import { trainerSpriteUrl } from "@/utils/pokemonHelpers";

interface AvatarPickerProps {
  value: AvatarId;
  onChange: (avatarId: AvatarId) => void;
  disabled?: boolean;
}

/**
 * The ID-card photo choice as a radio group (arrow keys move between them).
 * The radio itself is visually hidden; its label is the whole tile, and the
 * chosen one gets a hand-drawn ink circle instead of a filled dot.
 */
export function AvatarPicker({ value, onChange, disabled }: AvatarPickerProps) {
  const handleValueChange = (raw: string) => {
    const avatar = AVATARS.find((candidate) => candidate.id === raw);
    if (avatar) onChange(avatar.id);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
        Foto de la credencial
      </legend>
      <RadioGroup
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        className="grid-cols-3 gap-3"
      >
        {AVATARS.map((avatar) => {
          const inputId = `avatar-${avatar.id}`;
          const isSelected = avatar.id === value;
          return (
            <Label
              key={avatar.id}
              htmlFor={inputId}
              className="group/avatar relative flex cursor-pointer flex-col items-center gap-1.5 text-ink transition-transform select-none motion-safe:hover:-rotate-2"
            >
              <RadioGroupItem
                id={inputId}
                value={avatar.id}
                className="sr-only"
              />
              <span className="relative size-20 rounded-full group-has-focus-visible/avatar:outline-2 group-has-focus-visible/avatar:outline-offset-4 group-has-focus-visible/avatar:outline-ink-brown">
                <span className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-full border border-dashed border-ink-brown/40 bg-paper">
                  <Image
                    src={trainerSpriteUrl(avatar.id)}
                    alt=""
                    width={80}
                    height={80}
                    unoptimized
                    draggable={false}
                    className="w-[115%] max-w-none translate-y-[6%] [image-rendering:pixelated]"
                  />
                </span>
                {isSelected && <HandDrawnCircle />}
              </span>
              <span
                className={
                  isSelected
                    ? "font-hand text-xl leading-none text-ink"
                    : "font-hand text-xl leading-none text-ink-muted"
                }
              >
                {avatar.label}
              </span>
            </Label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
