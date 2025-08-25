import * as path from "path";

import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

export default defineConfig({
  test: {
    include: ["**/*.e2e-spec.ts"],
    root: "./",
    globals: true,

    alias: {
      src: path.resolve(__dirname, "./src"),
      "@src": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      "@src": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
  plugins: [swc.vite()],
});
