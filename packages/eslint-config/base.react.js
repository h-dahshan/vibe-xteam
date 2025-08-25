import { config as baseConfig } from "./base.js";

import globals from "globals";

import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

/**
 * A custom ESLint configuration for apps/libs that use reactjs
 *
 * @type {import("eslint").Linter.Config[]} */
export const reactConfig = [
  ...baseConfig,

  pluginReact.configs.flat.recommended,

  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
      ecmaVersion: 2020,
    },
  },

  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
    },
  },
];
