import { StickyNote } from "@/components/Hud/StickyNote";

/**
 * The first-visit instructions on a square sticky note in the middle of the
 * screen, the first thing to read. It never takes input, so a tap on a stamp
 * underneath still goes through, and it leaves as soon as the user explores.
 */
export function ExpeditionIntro() {
  return (
    <StickyNote
      label="Cómo empezar"
      className="top-1/2 left-1/2 size-56 -translate-x-1/2 -translate-y-1/2 -rotate-2 justify-center md:size-64"
    >
      <p className="font-hand text-2xl leading-6 md:text-[2rem] md:leading-8">
        Elegí un destino para comenzar la expedición
      </p>
      <p className="text-xs leading-snug md:text-sm">
        Cada sello es un lugar; el número, cuántos Pokémon viven ahí.
      </p>
    </StickyNote>
  );
}
