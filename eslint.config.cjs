const js = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const globals = require("globals");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  {
    files: ["app/**/*.js"],
    extends: [js.configs.recommended, prettierRecommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "no-useless-escape": "off",
      "prettier/prettier": "warn",
    },
  },
]);
