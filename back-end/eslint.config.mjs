import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/*", "node_modules/*", "logs/*"] },
  // files: ["./src/**/*.ts"] }, // parser: "@typescript-eslint/parser"
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended
];
// {js,mjs,cjs,ts}
