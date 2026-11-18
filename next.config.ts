import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
