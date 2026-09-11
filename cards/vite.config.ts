import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 5189,
    strictPort: true,
    cors: true,
    hmr: false,
  },
  build: {
    target: "es2022",
    outDir: "../dist",
    emptyOutDir: true,
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: () => "ha-smart-charging-card.js",
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
