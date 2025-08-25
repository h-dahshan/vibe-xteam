import { reactConfig } from "./base.react.js";

import globals from "globals";

import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

/**
 * A custom ESLint configuration for apps built in vite
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const reactViteConfig = [
  ...reactConfig,

  {
    plugins: {
      "react-refresh": pluginReactRefresh,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactRefresh.configs.vite.rules,
    },
  },
];
