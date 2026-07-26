import path from 'node:path';

import { includeIgnoreFile } from '@eslint/config-helpers';
import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import { configs, plugins, rules } from 'eslint-config-airbnb-extended';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
  rules.base.importsStrict,
]);

const nodeConfig = defineConfig([plugins.node, ...configs.node.recommended]);

const vitestConfig = defineConfig({
  files: ['**/*.spec.ts'],
  plugins: { vitest },
  rules: { ...vitest.configs.recommended.rules },
  settings: { vitest: { typecheck: true } },
  languageOptions: { globals: { ...vitest.environments.env.globals } },
});

const typescriptConfig = defineConfig([
  plugins.typescriptEslint,
  ...configs.base.typescript,
  rules.typescript.typescriptEslintStrict,
]);

const customRulesConfig = defineConfig({
  ignores: ['eslint.config.mjs'],
  rules: {
    'class-methods-use-this': 'off',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'import-x/prefer-default-export': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/promise-function-async': 'off',
  },
});

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  ...jsConfig,
  ...nodeConfig,
  ...vitestConfig,
  ...typescriptConfig,
  eslintPluginPrettierRecommended,
  ...customRulesConfig,
]);
