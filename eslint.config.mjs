import { libraryConfig } from "@repo/eslint-config/library";
import tsParser from "@typescript-eslint/parser";

/**
 * A high-level ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export default [
  {
    ignores: ["apps/**", "packages/**", "dist/**", "node_modules/**"],
  },
  ...libraryConfig,
  {
    parser: tsParser,
    parserOptions: {
      project: true,
    },
  },
  {
    rules: {
      // add override for any (a metric ton of them, initial conversion)
      "@typescript-eslint/no-explicit-any": "off",
      // we generally use this in isFunction, not via calling
      "@typescript-eslint/unbound-method": "off",
    },
  },
];
