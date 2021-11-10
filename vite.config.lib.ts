import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import dts from "vite-plugin-dts";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "lib",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "StarterKit",
      fileName: (format) => `starter-kit.${format}.js`,
    },
  },
  plugins: [
    react(),
    checker({
      typescript: true,
    }),
    dts(),
  ],
});
