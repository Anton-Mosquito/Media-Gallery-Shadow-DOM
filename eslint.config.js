import js from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import pluginPrettier from "eslint-plugin-prettier";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const prettierConfig = require("eslint-config-prettier");
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, prettier: pluginPrettier },
    extends: ["js/recommended"],
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-env"],
          plugins: ["@babel/plugin-syntax-import-assertions"],
        },
      },
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
  },
]);
