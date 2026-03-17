// @ts-check
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'eslint.config.mjs', 
      'drizzle/**', 
      'dist/**', 
      'node_modules/**'
    ],
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tsPlugin,
    },
    files: ['src/**/*.ts', 'test/**/*.ts', 'lib/**/*.ts'],
    languageOptions: {
      parser,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 5,
      sourceType: 'module',
    },
    rules: {
      ...stylistic.configs.recommended.rules,
      '@stylistic/array-bracket-newline': ['error', 'consistent'],
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/curly-newline': ['error', { consistent: true }],
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      '@stylistic/lines-around-comment': ['error', {
        afterBlockComment: false,
        beforeBlockComment: false,
        afterLineComment: false,
        beforeLineComment: false,
      }],
      '@stylistic/multiline-ternary': ['error', 'never'],
      '@stylistic/object-curly-newline': ['error', { consistent: true }],
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '=': 'none' } }],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/no-extra-parens': ['error', 'all'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/semi-style': ['error', 'last'],
      '@stylistic/max-len': ['error', { 
        code: 110, 
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
      }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        }
      }],
      '@stylistic/one-var-declaration-per-line': ['error', 'always'],
      '@stylistic/nonblock-statement-body-position': ['error', 'beside'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/quote-props': ['error', 'as-needed'],

      // typescript-eslint rules
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];