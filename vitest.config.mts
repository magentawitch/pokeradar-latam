import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Vite 8 resolves the `@/` alias from tsconfig.json natively.
    tsconfigPaths: true,
  },
  test: {
    // Pure TS by default; component tests opt into jsdom per file.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
