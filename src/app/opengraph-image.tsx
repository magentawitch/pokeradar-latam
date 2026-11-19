import { ImageResponse } from "next/og";
import { BIOMES } from "@/lib/biomes/biomes";

export const alt =
  "PokéRadar: un diario de expedición con un mapa de Latinoamérica en papel y tinta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The journal palette (see globals.css); ImageResponse can't read CSS vars.
const PAPER = "#f3ebdd";
const LAND = "#d8c3a0";
const INK = "#2b2a26";
const INK_BROWN = "#5b3e29";
const INK_MUTED = "#52493f";
const STICKY = "#f7e27e";
const GRID = "rgba(91, 62, 41, 0.12)";

/** Shared-link preview: the app's title on graph paper beside a compass stamp. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 96px",
        backgroundColor: PAPER,
        backgroundImage: `linear-gradient(to right, ${GRID} 2px, transparent 2px), linear-gradient(to bottom, ${GRID} 2px, transparent 2px)`,
        backgroundSize: "60px 60px",
        color: INK,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            color: INK_MUTED,
          }}
        >
          DIARIO DE EXPEDICIÓN
        </div>
        <div style={{ display: "flex", fontSize: 128, fontWeight: 700 }}>
          PokéRadar
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "14px 24px",
            fontSize: 34,
            backgroundColor: STICKY,
            transform: "rotate(-1.5deg)",
            boxShadow: "0 10px 18px -8px rgba(43, 42, 38, 0.45)",
          }}
        >
          {`${BIOMES.length} destinos de Latinoamérica · 151 Pokémon`}
        </div>
      </div>

      <svg width="300" height="300" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill={PAPER}
          stroke={INK_BROWN}
          strokeWidth="4"
        />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke={INK_BROWN}
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <path
          d="M50 10 L57 43 L90 50 L57 57 L50 90 L43 57 L10 50 L43 43 Z"
          fill={LAND}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M50 10 L57 43 L50 50 L43 43 Z"
          fill="#b4554a"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="4" fill={INK} />
      </svg>
    </div>,
    size,
  );
}
