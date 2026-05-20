import { FlatCompat } from '@eslint/eslintrc';
import pluginTanstackQuery from '@tanstack/eslint-plugin-query';
import pluginTypescript from '@typescript-eslint/eslint-plugin';
import parserTypescript from '@typescript-eslint/parser';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'plugin:@typescript-eslint/recommended'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parserTypescript,
    },
    plugins: {
      '@typescript-eslint': pluginTypescript,
      'unused-imports': pluginUnusedImports,
      '@tanstack/query': pluginTanstackQuery,
    },
    rules: {
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',
    },
  },
  {
    ignores: [
      'node_modules',
      '.pnp',
      '.pnp.js',
      '.next',
      'out',
      'build',
      '.DS_Store',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.vercel',
      '.git',
      '.gitignore',
      'Dockerfile',
      'docker-compose.yml',
      '.dockerignore',
    ],
  },
];

export default eslintConfig;
