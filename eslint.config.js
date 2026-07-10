import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['build/**', 'coverage/**', 'node_modules/**', 'scratch/**'],
  },
  {
    rules: {
      'no-console': 'warn',
      'no-var': 'error',
      'consistent-return': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'object-shorthand': ['error', 'always'],
    },
  }
);
