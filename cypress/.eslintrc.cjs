/* eslint-env node */
module.exports = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // Here . refers to the base directory of the project
    project: './cypress/tsconfig.json',
  },
};
