import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Extra hosts the dev server accepts (e.g. a phone on the LAN), comma
  // separated in .env.local: ALLOWED_DEV_ORIGINS=192.168.1.18
  allowedDevOrigins:
    process.env.ALLOWED_DEV_ORIGINS?.split(",").map((origin) =>
      origin.trim(),
    ) ?? [],
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // PokéAPI sprites (static, showdown gifs, official artwork).
    remotePatterns: [
      new URL("https://raw.githubusercontent.com/PokeAPI/sprites/**"),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
