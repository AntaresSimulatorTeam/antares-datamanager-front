/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  APPEAR_EFFECT_CLASSES,
  COMMON_CLASSES,
  FOCUS_CLASSES,
  VARIANT_CLASSES,
  VARIANT_CLASSES_DISABLED,
  iconButtonClassBuilder,
} from '../iconButtonClassBuilder';

describe('iconButtonClassBuilder function', () => {
  it('should have common classes', () => {
    expect(iconButtonClassBuilder('default', false, false).includes(COMMON_CLASSES)).toBe(true);
    expect(iconButtonClassBuilder('danger', false, false).includes(COMMON_CLASSES)).toBe(true);
  });

  it('should have the proper variant classes', () => {
    expect(iconButtonClassBuilder('default', false, false).includes(VARIANT_CLASSES.default)).toBe(true);
    expect(iconButtonClassBuilder('danger', false, false).includes(VARIANT_CLASSES.danger)).toBe(true);
  });

  it('should have focus classes if disabled is false', () => {
    expect(iconButtonClassBuilder('default', false, false).includes(FOCUS_CLASSES)).toBe(true);
    expect(iconButtonClassBuilder('danger', false, false).includes(FOCUS_CLASSES)).toBe(true);
  });

  it('should not have focus classes if disabled is true', () => {
    expect(iconButtonClassBuilder('default', true, false).includes(FOCUS_CLASSES)).toBe(false);
    expect(iconButtonClassBuilder('danger', true, false).includes(FOCUS_CLASSES)).toBe(false);
  });

  it('should have disabled classes', () => {
    expect(iconButtonClassBuilder('default', true, false).includes(VARIANT_CLASSES_DISABLED)).toBe(true);
    expect(iconButtonClassBuilder('danger', true, false).includes(VARIANT_CLASSES_DISABLED)).toBe(true);
  });

  it('should have appear effect classes', () => {
    expect(iconButtonClassBuilder('default', false, true).includes(APPEAR_EFFECT_CLASSES)).toBe(true);
    expect(iconButtonClassBuilder('danger', false, true).includes(APPEAR_EFFECT_CLASSES)).toBe(true);
  });

  it("should't have appear effect classes", () => {
    expect(iconButtonClassBuilder('default', true, true).includes(APPEAR_EFFECT_CLASSES)).toBe(false);
    expect(iconButtonClassBuilder('danger', true, true).includes(APPEAR_EFFECT_CLASSES)).toBe(false);
  });
});
