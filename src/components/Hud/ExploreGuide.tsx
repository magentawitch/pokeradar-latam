import type { ReactNode } from "react";
import { HABITAT_LABELS } from "@/lib/biomes/biomes";
import { HABITAT_NAMES } from "@/lib/pokeapi/schemas";

const sectionHeading =
  "font-mono text-xs tracking-widest text-ink-muted uppercase";

interface LegendEntryProps {
  /** A drawing of the map element; decorative, the text explains it. */
  sample: ReactNode;
  children: ReactNode;
}

function LegendEntry({ sample, children }: LegendEntryProps) {
  return (
    <li className="flex items-center gap-3">
      <span aria-hidden="true" className="flex w-10 shrink-0 justify-center">
        {sample}
      </span>
      <span className="text-ink-muted">{children}</span>
    </li>
  );
}

/** Mirrors the stamp button variant's look, without being a button. */
const stampSample =
  "flex size-8 items-center justify-center rounded-full font-mono text-xs font-semibold shadow-sticker";

/**
 * The diary's "Cómo explorar" tab: the map controls in touch or pointer
 * wording, and a legend of what's drawn on the map.
 */
export function ExploreGuide() {
  return (
    <div className="flex flex-col gap-6 px-5 py-4">
      <section aria-labelledby="guide-controls" className="flex flex-col gap-2">
        <h2 id="guide-controls" className={sectionHeading}>
          Controles
        </h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-ink-muted marker:text-ink-brown">
          <li>Arrastrá el mapa para moverte.</li>
          <li>
            <span className="md:hidden">Pellizcá</span>
            <span className="hidden md:inline">Usá la rueda</span> para acercar
            o alejar.
          </li>
          <li>
            <span className="md:hidden">Tocá</span>
            <span className="hidden md:inline">Hacé clic en</span> un sello para
            revelar los Pokémon de ese destino.
          </li>
          <li>
            <span className="md:hidden">Tocá</span>
            <span className="hidden md:inline">Hacé clic en</span> un Pokémon
            para abrir su ficha.
          </li>
        </ul>
      </section>

      <section aria-labelledby="guide-legend" className="flex flex-col gap-3">
        <h2 id="guide-legend" className={sectionHeading}>
          En el mapa
        </h2>
        <ul className="flex flex-col gap-3">
          <LegendEntry
            sample={
              <span
                data-habitat="forest"
                className={`${stampSample} border-[3px] border-(color:--habitat-ink) bg-(--habitat-fill) text-habitat-label`}
              >
                5
              </span>
            }
          >
            Un destino. El número es cuántos Pokémon viven ahí; el color, su
            hábitat.
          </LegendEntry>
          <LegendEntry
            sample={
              <span
                className={`${stampSample} border-[4px] border-double border-ink bg-card text-ink`}
              >
                9
              </span>
            }
          >
            Varios destinos juntos. Tocalo para acercarte hasta separarlos.
          </LegendEntry>
          <LegendEntry
            sample={
              <svg
                viewBox="0 0 32 32"
                className="size-8 stroke-ink-brown"
                fill="none"
                strokeLinecap="round"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  strokeWidth="2"
                  strokeDasharray="60 82"
                  className="stroke-biome-sea"
                />
                <line x1="16" y1="16" x2="16" y2="5" strokeWidth="2.5" />
                <circle cx="16" cy="16" r="3" className="fill-card" />
              </svg>
            }
          >
            Al llegar, un compás recorre el destino y revela a sus Pokémon.
          </LegendEntry>
        </ul>
      </section>

      <section aria-labelledby="guide-habitats" className="flex flex-col gap-3">
        <h2 id="guide-habitats" className={sectionHeading}>
          Hábitats
        </h2>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
          {HABITAT_NAMES.map((habitat) => (
            <li
              key={habitat}
              className="flex items-center gap-2 text-ink-muted"
            >
              <span
                aria-hidden="true"
                className="border-(color:--habitat-ink) bg-(--habitat-fill) size-3.5 shrink-0 rounded-full border-[3px]"
                data-habitat={habitat}
              />
              {HABITAT_LABELS[habitat]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
