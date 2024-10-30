/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  ACTIVE_CLASSES,
  COMMON_ELEMENT_CLASSES,
  DISABLED_CLASSES,
  dropdownElementClassBuilder,
} from '../dropdownClassBuilder';

const ADDITIONNAL_CLASS = '[&]:text-red-600';

describe('dropdownClassBuilder', () => {
  it('should always have the common classes', () => {
    expect(dropdownElementClassBuilder(false, false, ADDITIONNAL_CLASS).includes(COMMON_ELEMENT_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(false, true).includes(COMMON_ELEMENT_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(true, false).includes(COMMON_ELEMENT_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(true, true).includes(COMMON_ELEMENT_CLASSES)).toBe(true);
  });
  it('should have the extra classes when provided and disabled is false', () => {
    expect(dropdownElementClassBuilder(false, false, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(true);
    expect(dropdownElementClassBuilder(false, true, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(true);
    expect(dropdownElementClassBuilder(true, false, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(false);
    expect(dropdownElementClassBuilder(true, true, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(false);
    expect(dropdownElementClassBuilder(false, false).includes(ADDITIONNAL_CLASS)).toBe(false);
  });
  it('should have the proper active classes', () => {
    expect(dropdownElementClassBuilder(false, false).includes(ACTIVE_CLASSES['inactive'])).toBe(true);
    expect(dropdownElementClassBuilder(false, true).includes(ACTIVE_CLASSES['active'])).toBe(true);
  });
  it('should have the disabled classes when disabled is true', () => {
    expect(dropdownElementClassBuilder(true, false).includes(DISABLED_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(false, false).includes(DISABLED_CLASSES)).toBe(false);
  });
});
