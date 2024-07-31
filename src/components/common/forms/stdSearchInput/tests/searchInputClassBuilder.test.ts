/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  DEFAULT_CLEAR_BUTTON_CLASS,
  INPUT_CLASSES,
  INPUT_WRAPPER,
  INVISIBLE_CLEAR_BUTTON_CLASSES,
  LABEL_CLASSES,
  SIZE_CLASSES,
  VARIANT_CLASSES,
  VARIANT_DISABLED_CLASSES,
  clearClassBuilder,
  searchClassBuilder,
} from '../SearchInputClassBuilder';

describe('searchClassBuilder function', () => {
  it('should have the common classes for wrapper', () => {
    expect(searchClassBuilder('filled', false, 'medium').inputWrapperClass.includes(INPUT_WRAPPER)).toBe(true);
    expect(searchClassBuilder('outlined', false, 'medium').inputWrapperClass.includes(INPUT_WRAPPER)).toBe(true);
  });
  it('should have the common classes for input', () => {
    expect(searchClassBuilder('filled', false, 'medium').inputClasses.includes(INPUT_CLASSES)).toBe(true);
    expect(searchClassBuilder('outlined', false, 'medium').inputClasses.includes(INPUT_CLASSES)).toBe(true);
  });
  it('should have the common classes for label', () => {
    expect(searchClassBuilder('filled', false, 'medium').labelClass.includes(LABEL_CLASSES)).toBe(true);
    expect(searchClassBuilder('outlined', false, 'medium').labelClass.includes(LABEL_CLASSES)).toBe(true);
  });
  it('should have the variant classes for wrapper', () => {
    expect(searchClassBuilder('filled', false, 'medium').inputWrapperClass.includes(VARIANT_CLASSES.filled)).toBe(true);
    expect(searchClassBuilder('outlined', false, 'medium').inputWrapperClass.includes(VARIANT_CLASSES.outlined)).toBe(
      true,
    );
  });
  it('should have the proper wrapper on different variants', () => {
    expect(searchClassBuilder('filled', false, 'medium').inputWrapperClass.includes(INPUT_WRAPPER)).toBe(true);
    expect(searchClassBuilder('outlined', false, 'medium').inputWrapperClass.includes(INPUT_WRAPPER)).toBe(true);
  });
  it('should be disabled on different variant', () => {
    expect(searchClassBuilder('outlined', true, 'medium').inputWrapperClass.includes(VARIANT_DISABLED_CLASSES)).toBe(
      true,
    );
    expect(searchClassBuilder('filled', true, 'medium').inputClasses.includes(VARIANT_DISABLED_CLASSES)).toBe(true);
  });
  it('should have the good size classes', () => {
    expect(searchClassBuilder('filled', false, 'small').inputWrapperClass.includes(SIZE_CLASSES.small)).toBe(true);
    expect(searchClassBuilder('outlined', false, 'medium').inputWrapperClass.includes(SIZE_CLASSES.medium)).toBe(true);
  });
});

describe('clearClassBuilder function', () => {
  it('should be empty when false', () => {
    expect(clearClassBuilder(false)).toBe(DEFAULT_CLEAR_BUTTON_CLASS);
  });
  it('should return hide classes when true', () => {
    expect(clearClassBuilder(true)).toBe(INVISIBLE_CLEAR_BUTTON_CLASSES);
  });
});
