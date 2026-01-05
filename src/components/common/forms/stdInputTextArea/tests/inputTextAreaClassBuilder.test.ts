import {
  COMMON_VARIANT_CLASSES,
  ERROR_CLASSES,
  HELPER_CLASSES,
  TEXT_CLASSES,
  VARIANT_DISABLED_CLASSES,
  WRAPPER_CLASSES,
  getMaxHeightClass,
  inputTextAreaClassBuilder,
} from '../inputTextAreaClassBuilder';

const TEST_MAX_HEIGHT = 14;

describe('inputTextAreaClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(inputTextAreaClassBuilder(false, false).wrapperClasses.includes(WRAPPER_CLASSES)).toBe(true);
    expect(inputTextAreaClassBuilder(false, false).helperClasses.includes(HELPER_CLASSES)).toBe(true);
    expect(inputTextAreaClassBuilder(false, false).inputClasses.includes(COMMON_VARIANT_CLASSES)).toBe(true);
    expect(inputTextAreaClassBuilder(false, false).labelClasses.includes(TEXT_CLASSES)).toBe(true);
  });
  it('should have the proper disabled classes', () => {
    expect(inputTextAreaClassBuilder(true, false).inputClasses.includes(VARIANT_DISABLED_CLASSES)).toBe(true);
  });
  it('should have the proper error classes', () => {
    expect(inputTextAreaClassBuilder(true, true).inputClasses.includes(ERROR_CLASSES.input)).toBe(true);
    expect(inputTextAreaClassBuilder(true, true).labelClasses.includes(ERROR_CLASSES.text)).toBe(true);
    expect(inputTextAreaClassBuilder(true, true).helperClasses.includes(ERROR_CLASSES.text)).toBe(true);
  });
  it('should have the proper max height class', () => {
    expect(inputTextAreaClassBuilder(true, true).inputClasses.includes(getMaxHeightClass(0))).toBe(false);

    expect(
      inputTextAreaClassBuilder(true, true, TEST_MAX_HEIGHT).inputClasses.includes(getMaxHeightClass(TEST_MAX_HEIGHT)),
    ).toBe(true);
  });
});
