const { parse } = require('i18next-translation-parser');

module.exports = (message) => {
  const res = parse(message);
  if (!res || !Array.isArray(res) || typeof res[0] !== 'object' || res[0].type !== 'text') {
    throw new SyntaxError(`Not a valid i18next message syntax: ${message}`);
  }
};
