/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { COMMON_CLASSES, SIZE_CLASSES, WEIGHT_CLASSES, headingClassBuilder } from '../headingClassBuilder';

describe('headingClassBuilder', () => {
  it('should always include the common classes', () => {
    expect(headingClassBuilder('xl', 'semibold').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('l', 'semibold').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('m', 'semibold').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('s', 'semibold').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('xs', 'semibold').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('xl', 'regular').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('l', 'regular').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('m', 'regular').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('s', 'regular').includes(COMMON_CLASSES)).toBe(true);
    expect(headingClassBuilder('xs', 'semibold').includes(COMMON_CLASSES)).toBe(true);
  });
  it('should include semibold classes when weight is semibold', () => {
    expect(headingClassBuilder('xl', 'semibold').includes(WEIGHT_CLASSES['semibold'])).toBe(true);
    expect(headingClassBuilder('l', 'semibold').includes(WEIGHT_CLASSES['semibold'])).toBe(true);
    expect(headingClassBuilder('m', 'semibold').includes(WEIGHT_CLASSES['semibold'])).toBe(true);
    expect(headingClassBuilder('s', 'semibold').includes(WEIGHT_CLASSES['semibold'])).toBe(true);
    expect(headingClassBuilder('xs', 'semibold').includes(WEIGHT_CLASSES['semibold'])).toBe(true);
  });
  it('should not include semibold classes when weight is regular', () => {
    expect(headingClassBuilder('xl', 'regular').includes(WEIGHT_CLASSES['semibold'])).toBe(false);
    expect(headingClassBuilder('l', 'regular').includes(WEIGHT_CLASSES['semibold'])).toBe(false);
    expect(headingClassBuilder('m', 'regular').includes(WEIGHT_CLASSES['semibold'])).toBe(false);
    expect(headingClassBuilder('s', 'regular').includes(WEIGHT_CLASSES['semibold'])).toBe(false);
    expect(headingClassBuilder('xs', 'regular').includes(WEIGHT_CLASSES['semibold'])).toBe(false);
  });
  it('should always include the size classes', () => {
    expect(headingClassBuilder('xl', 'semibold').includes(SIZE_CLASSES['xl'])).toBe(true);
    expect(headingClassBuilder('l', 'semibold').includes(SIZE_CLASSES['l'])).toBe(true);
    expect(headingClassBuilder('m', 'semibold').includes(SIZE_CLASSES['m'])).toBe(true);
    expect(headingClassBuilder('s', 'semibold').includes(SIZE_CLASSES['s'])).toBe(true);
    expect(headingClassBuilder('xs', 'semibold').includes(SIZE_CLASSES['xs'])).toBe(true);
    expect(headingClassBuilder('xl', 'regular').includes(SIZE_CLASSES['xl'])).toBe(true);
    expect(headingClassBuilder('l', 'regular').includes(SIZE_CLASSES['l'])).toBe(true);
    expect(headingClassBuilder('m', 'regular').includes(SIZE_CLASSES['m'])).toBe(true);
    expect(headingClassBuilder('s', 'regular').includes(SIZE_CLASSES['s'])).toBe(true);
    expect(headingClassBuilder('xs', 'regular').includes(SIZE_CLASSES['xs'])).toBe(true);
  });
});
