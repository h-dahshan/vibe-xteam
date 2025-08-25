import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
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
      include: ["app/**/!(*index).[jt]s?(x)"],
      exclude: ["app/**/*.{types,d}.ts", "tests/**", "e2e/**"],
    },
    exclude: ["node_modules/**", "src/**/*.{types,d}.ts", "tests/**", "e2e/**"],
  },
});
