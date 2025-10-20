import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import security from 'eslint-plugin-security';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      'pnpm-lock.yaml',
      'package-lock.json',
      'app/admin/**',
      'app/dashboard/**',
      'app/dashboard1/**',
      'components/admin/**',
      'components/ui/**',
      'components/sections/**',
      'app/layout.backup.tsx',
      'app/services/page.backup.tsx',
      'lib/db.ts'
    ],
  },
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    plugins: {
      security,
      unicorn,
      '@typescript-eslint': tseslint,
    },
    rules: {
      'react/jsx-key': 'error',
      '@next/next/no-img-element': 'off',
      'security/detect-object-injection': 'off',
      'unicorn/filename-case': [
        'error',
        { cases: { kebabCase: true, pascalCase: true }, ignore: ['^page\\.tsx$', '^layout\\.tsx$'] },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-anonymous-default-export': 'off',
    },
    ignores: ['**/node_modules/**', '**/.next/**', 'next.config.js', 'next.config.mjs'],
  },
];
