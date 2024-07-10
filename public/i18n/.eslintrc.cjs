const path = require('path');

/* eslint-env node */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
  },
  env: { browser: true, es2020: true, node: true },
  extends: ['plugin:i18n-json/recommended'],
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'i18n-json/identical-keys': [
      2,
      {
        filePath: path.resolve('./public/i18n/fr.json'),
      },
    ],
    'i18n-json/valid-message-syntax': [
      2,
      {
        syntax: path.resolve('./public/i18n/custom-message-syntax.cjs'),
      },
    ],
  },
};
