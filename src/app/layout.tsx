import type { Metadata, Viewport } from "next";
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

const DESCRIPTION =
  "Un diario de campo para explorar Latinoamérica y descubrir los Pokémon que habitan cada rincón del mapa.";

// Absolute base for the og:image URL (from opengraph-image.tsx): Vercel's
// production domain when deployed, localhost otherwise.
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PokéRadar · Diario de expedición",
  description: DESCRIPTION,
  applicationName: "PokéRadar",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "PokéRadar",
    title: "PokéRadar · Diario de expedición",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f3ebdd",
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
