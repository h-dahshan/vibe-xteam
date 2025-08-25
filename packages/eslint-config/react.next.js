import { reactConfig } from "./base.react.js";

import globals from "globals";

import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";

/**
 * A custom ESLint configuration for apps built in nextjs
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const reactNextConfig = [
  ...reactConfig,

  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
];
