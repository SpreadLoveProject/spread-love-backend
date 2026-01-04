import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2021,
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];
