/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  textClassBuilder,
  VARIANT_CLASSES,
  CLEAR_CLASSES,
  HELPER_CLASSES,
  COMMON_VARIANT_CLASSES,
  TEXT_CLASSES,
  VARIANT_DISABLED_CLASSES,
  ERROR_CLASSES,
  INPUT_CLASSES,
  BUTTON_CLASSES,
  HIDE_BUTTON_CLASSES,
} from '../textClassBuilder';

describe('textClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(textClassBuilder('outlined', false, false, false).wrapperInputClasses.includes(COMMON_VARIANT_CLASSES)).toBe(
      true,
    );
    expect(textClassBuilder('outlined', false, false, false).clearClasses.includes(CLEAR_CLASSES)).toBe(true);
    expect(textClassBuilder('outlined', false, false, false).helperClasses.includes(HELPER_CLASSES)).toBe(true);
    expect(textClassBuilder('outlined', false, false, false).inputClasses.includes(INPUT_CLASSES)).toBe(true);
    expect(textClassBuilder('outlined', false, false, false).labelClasses.includes(TEXT_CLASSES)).toBe(true);
    expect(textClassBuilder('outlined', false, false, false).buttonClasses.includes(BUTTON_CLASSES)).toBe(true);
    expect(textClassBuilder('text', false, false, false).wrapperInputClasses.includes(COMMON_VARIANT_CLASSES)).toBe(
      true,
    );
    expect(textClassBuilder('text', false, false, false).clearClasses.includes(CLEAR_CLASSES)).toBe(true);
    expect(textClassBuilder('text', false, false, false).helperClasses.includes(HELPER_CLASSES)).toBe(true);
    expect(textClassBuilder('text', false, false, false).inputClasses.includes(INPUT_CLASSES)).toBe(true);
    expect(textClassBuilder('text', false, false, false).labelClasses.includes(TEXT_CLASSES)).toBe(true);
    expect(textClassBuilder('text', false, false, false).buttonClasses.includes(BUTTON_CLASSES)).toBe(true);
  });
  it('should have the proper variant and type classes', () => {
    expect(
      textClassBuilder('outlined', false, false, false).wrapperInputClasses.includes(VARIANT_CLASSES.outlined),
    ).toBe(true);
    expect(textClassBuilder('text', false, false, false).wrapperInputClasses.includes(VARIANT_CLASSES.text)).toBe(true);
  });
  it('should have the proper disabled classes', () => {
    expect(textClassBuilder('outlined', true, false, false).inputClasses.includes(VARIANT_DISABLED_CLASSES)).toBe(true);
    expect(textClassBuilder('outlined', true, false, false).clearClasses.includes(VARIANT_DISABLED_CLASSES)).toBe(true);
    expect(textClassBuilder('text', true, false, false).inputClasses.includes(VARIANT_DISABLED_CLASSES)).toBe(true);
    expect(textClassBuilder('text', true, false, false).clearClasses.includes(VARIANT_DISABLED_CLASSES)).toBe(true);
  });
  it('should have the proper error classes', () => {
    expect(textClassBuilder('outlined', true, true, false).inputClasses.includes(ERROR_CLASSES.input.outlined)).toBe(
      true,
    );
    expect(textClassBuilder('outlined', true, true, false).labelClasses.includes(ERROR_CLASSES.text)).toBe(true);
    expect(textClassBuilder('outlined', true, true, false).helperClasses.includes(ERROR_CLASSES.text)).toBe(true);
    expect(textClassBuilder('text', true, true, false).inputClasses.includes(ERROR_CLASSES.input.text)).toBe(true);
    expect(textClassBuilder('text', true, true, false).labelClasses.includes(ERROR_CLASSES.text)).toBe(true);
    expect(textClassBuilder('text', true, true, false).helperClasses.includes(ERROR_CLASSES.text)).toBe(true);
  });
  it('button should be hidden when you request it', () => {
    expect(textClassBuilder('outlined', false, false, true).buttonClasses.includes(HIDE_BUTTON_CLASSES)).toBe(true);
    expect(textClassBuilder('text', false, false, true).buttonClasses.includes(HIDE_BUTTON_CLASSES)).toBe(true);
  });
});
