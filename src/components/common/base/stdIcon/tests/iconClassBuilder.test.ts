/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { POINTER_CLASS, iconClassBuilder } from '../iconClassBuilder';

describe('iconClassBuilder function', () => {
  const TEST_CLASS = 'text-gray-700';
  it('should always include the pointer class', () => {
    expect(iconClassBuilder(undefined).includes(POINTER_CLASS)).toBe(true);
    expect(iconClassBuilder(TEST_CLASS).includes(POINTER_CLASS)).toBe(true);
  });
  it('should have the passed color in the returned string', () => {
    expect(iconClassBuilder(TEST_CLASS).includes(TEST_CLASS)).toBe(true);
  });
});
