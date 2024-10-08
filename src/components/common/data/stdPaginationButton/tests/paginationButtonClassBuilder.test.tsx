/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  BUTTON_CLASSES,
  COMMON_NUMBER_CLASSES,
  NUMBER_CLASSES,
  paginationButtonClassBuilder,
} from '../paginationButtonClassBuilder';

describe('paginationButtonClassBuilder function', () => {
  it('should have button classes', () => {
    expect(paginationButtonClassBuilder(true).buttonClasses).toBe(BUTTON_CLASSES);
    expect(paginationButtonClassBuilder(false).buttonClasses).toBe(BUTTON_CLASSES);
  });

  it('should have the common number classes', () => {
    expect(paginationButtonClassBuilder(true).numberClasses.includes(COMMON_NUMBER_CLASSES)).toBe(true);
    expect(paginationButtonClassBuilder(false).numberClasses.includes(COMMON_NUMBER_CLASSES)).toBe(true);
  });

  it('should have the proper number active classes', () => {
    expect(paginationButtonClassBuilder(true).numberClasses.includes(NUMBER_CLASSES.active)).toBe(true);
    expect(paginationButtonClassBuilder(false).numberClasses.includes(NUMBER_CLASSES.default)).toBe(true);
  });
});
