import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import { rules as prettierConfigRules, rules } from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  // Stylistic plugin
  plugins.stylistic,
  // Import X plugin
  plugins.importX,
  // Airbnb base recommended config
  ...configs.base.recommended,
]);

const nextConfig = defineConfig([
  // React plugin
  plugins.react,
  // React hooks plugin
  plugins.reactHooks,
  // React JSX A11y plugin
  plugins.reactA11y,
  // Next.js plugin
  plugins.next,
  // Airbnb Next.js recommended config
  ...configs.next.recommended,
]);

const typescriptConfig = defineConfig([
  // TypeScript ESLint plugin
  plugins.typescriptEslint,
  // Airbnb base TypeScript config
  ...configs.base.typescript,
  // Airbnb Next.js TypeScript config
  ...configs.next.typescript,
]);

const prettierConfig = defineConfig([
  // Prettier plugin
  {
    name: 'prettier/plugin/config',
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Prettier config
  {
    name: 'prettier/config',
    rules: {
      ...prettierConfigRules,
      'prettier/prettier': 'error',
    },
  },
]);

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  // JavaScript config
  ...jsConfig,
  // Next.js config
  ...nextConfig,
  // TypeScript config
  ...typescriptConfig,
  // Prettier config
  ...prettierConfig,
  {
     rules: {
        'no-console': [
        'error',
        {
            allow: ['error', 'trace', 'info', 'debug', 'warn'],
        },
        ],
        'prettier/prettier': 'error',
        'react-hooks/rules-of-hooks': 'off',
        'react/function-component-definition': 'off',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/forbid-prop-types': 'off',
        'react/require-default-props': [
        'error',
        {
            ignoreFunctionalComponents: true,
        },
        ],
        'react/no-array-index-key': 'off', //investigate
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off', //investigate
        'jsx-a11y/anchor-is-valid': 'off', //investigate
        'jsx-a11y/label-has-associated-control': 'off',
        '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-throw-literal': 'off',
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/only-throw-error': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-unnecessary-type-arguments': 'off',
        'no-await-in-loop': 'off',
        'no-nested-ternary': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'max-classes-per-file': 'off',
        'import/order': 'off',
        'no-restricted-imports': [
        "error",
        {
            "patterns": [
            {
                "group": ["@app/validations/*"],
                "message": "Importing sub-paths from @app/validations results in yup localizations not working. Please import @app/validations instead."
            },
            ],
        },
        ],
        'react/no-unstable-nested-components': [
        'error',
        {
            'allowAsProps': true,
        },
        ],
    },
  },
  {
    files: ['**/e2e/**'],
    rules: {
        'import-x/no-extraneous-dependencies': 'off',
    }
  }
]);
