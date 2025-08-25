/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  useTabs: false,
  tabWidth: 2,
  semi: true,

  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "es5",
  arrowParens: "always",

  bracketSpacing: true,
  bracketSameLine: false,

  endOfLine: "lf",
};

export default config;
