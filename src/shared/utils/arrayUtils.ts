/**
 * Determines if two arrays of strings have any differences in their items or lengths.
 *
 * This function compares two arrays of strings to check if they differ in size or
 * if any corresponding elements between the two arrays are not identical.
 *
 * @param {string[]} original - The original array to compare.
 * @param {string[]} updated - The updated array to compare against the original.
 * @returns {boolean} Returns `true` if the arrays differ in length or if any of their
 * corresponding elements are different; otherwise, returns `false`.
 */
export const hasArrayChanged = (original: string[], updated: string[]): boolean => {
  if (original.length !== updated.length) {
    return true;
  }
  return original.some((item, index) => item !== updated[index]);
};

export const toRem = (px: number) => `${px / 16}rem`;
