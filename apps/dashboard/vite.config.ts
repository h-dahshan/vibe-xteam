/// <reference types="vitest" />

import * as path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setupTests.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        // set this value later, break if not met!
        // functions: 100,
      },
      include: ["src/**/!(*index).[jt]s?(x)"],
      exclude: ["src/**/*.{types,d}.ts", "tests/**", "e2e/**"],
    },
    exclude: ["node_modules/**", "src/**/*.{types,d}.ts", "tests/**", "e2e/**"],
  },
});
