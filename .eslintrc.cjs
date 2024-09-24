/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  ignorePatterns: ['.eslintrc.cjs', '**/scripts/*.js', 'cypress.config.ts', 'vite.config.ts', 'vite.config.d.ts'],
  plugins: ['react-refresh', 'import'],
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    camelcase: 'error',
    'no-alert': 'error',
    'no-console': 'error',
    'no-param-reassign': 'error',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-promise-executor-return': 'error',
    'no-shadow': 'off',
    'no-trailing-spaces': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-use-before-define': ['error', { ignoreTypeReferences: true }],
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },

    'import/resolver': {
      typescript: true,
    },
  },
};
