/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  COMMON_CHECKBOX_CLASSES,
  ERROR_CLASSES,
  ERROR_LABEL_TEXT_CLASS,
  LABEL_TEXT_CLASSES,
  OTHER_CHECKBOX_CLASSES,
  checkboxClassBuilder,
} from '../checkboxClassBuilder';

const INDIFFERENT_ERROR = false;

describe('checkboxClassBuilder function', () => {
  it('should always have the common classes', () => {
    expect(checkboxClassBuilder(false, false).inputClasses.includes(COMMON_CHECKBOX_CLASSES)).toBe(true);
    expect(checkboxClassBuilder(false, true).inputClasses.includes(COMMON_CHECKBOX_CLASSES)).toBe(true);
    expect(checkboxClassBuilder(true, false).inputClasses.includes(COMMON_CHECKBOX_CLASSES)).toBe(true);
    expect(checkboxClassBuilder(true, true).inputClasses.includes(COMMON_CHECKBOX_CLASSES)).toBe(true);
  });
  it('should have the disabled classes if disabled', () => {
    expect(checkboxClassBuilder(true, false).inputClasses.includes(OTHER_CHECKBOX_CLASSES.disabled)).toBe(true);
    expect(checkboxClassBuilder(true, true).inputClasses.includes(OTHER_CHECKBOX_CLASSES.disabled)).toBe(true);
  });
  it('should have the enabled classes if not disabled', () => {
    expect(checkboxClassBuilder(false, false).inputClasses.includes(OTHER_CHECKBOX_CLASSES.enabled)).toBe(true);
    expect(checkboxClassBuilder(false, true).inputClasses.includes(OTHER_CHECKBOX_CLASSES.enabled)).toBe(true);
  });
  it('should have the error classes if error and not disabled', () => {
    expect(checkboxClassBuilder(false, true).inputClasses.includes(ERROR_CLASSES)).toBe(true);
    expect(checkboxClassBuilder(false, true).labelClasses.includes(ERROR_LABEL_TEXT_CLASS)).toBe(true);
  });
  it('should not have the error classes if disabled or error is false', () => {
    expect(checkboxClassBuilder(true, true).inputClasses.includes(ERROR_CLASSES)).toBe(false);
    expect(checkboxClassBuilder(true, false).inputClasses.includes(ERROR_CLASSES)).toBe(false);
    expect(checkboxClassBuilder(false, false).inputClasses.includes(ERROR_CLASSES)).toBe(false);
  });
  it('should return the disabled text if disabled', () => {
    expect(checkboxClassBuilder(true, INDIFFERENT_ERROR).labelClasses.includes(LABEL_TEXT_CLASSES.disabled)).toBe(true);
  });
});
