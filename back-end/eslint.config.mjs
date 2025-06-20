import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/*', 'node_modules/*', 'logs/*'] },
  {
    rules: {
      'no-console': 'off',
      'no-undef': 'error',
      'no-unused-vars': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      // "prefer-destructuring": "error",
      // "prefer-template": "error",
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      // "space-before-function-paren": ["error", "never"]
      'no-else-return': 'error',
      // "no-use-before-define": "error"
      'no-undef-init': 'error',
      'no-undefined': 'error',
      'no-void': 'error',
      'no-with': 'error',
      // "no-shadow": "error"
      'no-shadow-restricted-names': 'error',
      'no-prototype-builtins': 'error',
      'no-new-wrappers': 'error',
      'no-new-symbol': 'error',
      'no-new-func': 'error',
      'no-new': 'error',
      'no-multi-str': 'error',
      'no-iterator': 'error',
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-implicit-coercion': 'error'
    }
  },
  // files: ["./src/**/*.ts"] }, // parser: "@typescript-eslint/parser"
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended
];
// {js,mjs,cjs,ts}
