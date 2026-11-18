import type { Metadata } from "next";
import { Caveat, Fraunces, IBM_Plex_Mono, Nunito } from "next/font/google";
import { Providers } from "./Providers";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "PokéRadar - Diario de expedición",
  description:
    "Un diario de campo para explorar Latinoamérica y descubrir los Pokémon que habitan cada rincón del mapa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fontVariables = [fraunces, nunito, caveat, plexMono]
    .map((font) => font.variable)
    .join(" ");

  return (
    <html lang="es" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
