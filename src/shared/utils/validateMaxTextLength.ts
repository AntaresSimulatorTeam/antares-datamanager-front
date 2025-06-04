
/**
 * Validate a string with a maxLength parameter
 * @param {string} text - text to be validated
 * @param {number} maxLength - maximum number of characters
 * @returns {boolean} - true if maximum number is respected
 */
export const validateMaxLength = (text: string, maxLength: number): boolean => {
  const trimmedText = text.trim();
  return trimmedText.length <= maxLength;
};
