import { defineConfig } from "vite";

// Single-page build. Relative base so the dist/ folder also works when
// opened from a sub-path or a static host without rewrites.
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
