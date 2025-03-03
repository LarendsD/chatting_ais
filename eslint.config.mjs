import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:prettier/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      // Используем глобальные переменные вместо env
      globals: {
        ...globals.browser, // Глобалы для браузера (window, document и т.д.)
        ...globals.node, // Глобалы для Node.js (process, __dirname и т.д.)
        // MyCustomGlobal: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/quotes': [
        'error',
        'single',
        // { avoidEscape: true, allowTemplateLiterals: true },
      ], // Правило для кавычек
    },
  },
];
