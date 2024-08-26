/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  COMMON_CLASSES,
  FOCUS_CLASSES,
  VARIANT_CLASSES,
  VARIANT_CLASSES_DISABLED,
  iconButtonClassBuilder,
} from '../iconButtonClassBuilder';

describe('iconButtonClassBuilder function', () => {
  it('should have common classes', () => {
    expect(iconButtonClassBuilder('default', false).includes(COMMON_CLASSES)).toBe(true);
    expect(iconButtonClassBuilder('danger', false).includes(COMMON_CLASSES)).toBe(true);
  });

  it('should have the proper variant classes', () => {
    expect(iconButtonClassBuilder('default', false).includes(VARIANT_CLASSES.default)).toBe(true);
    expect(iconButtonClassBuilder('danger', false).includes(VARIANT_CLASSES.danger)).toBe(true);
  });

  it('should have focus classes if disabled is false', () => {
    expect(iconButtonClassBuilder('default', false).includes(FOCUS_CLASSES)).toBe(true);
    expect(iconButtonClassBuilder('danger', false).includes(FOCUS_CLASSES)).toBe(true);
  });

  it('should not have focus classes if disabled is true', () => {
    expect(iconButtonClassBuilder('default', true).includes(FOCUS_CLASSES)).toBe(false);
    expect(iconButtonClassBuilder('danger', true).includes(FOCUS_CLASSES)).toBe(false);
  });

  it('should have disabled classes', () => {
    expect(iconButtonClassBuilder('default', true).includes(VARIANT_CLASSES_DISABLED)).toBe(true);
    expect(iconButtonClassBuilder('danger', true).includes(VARIANT_CLASSES_DISABLED)).toBe(true);
  });
});
