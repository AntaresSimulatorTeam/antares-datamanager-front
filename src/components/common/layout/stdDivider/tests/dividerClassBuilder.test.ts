/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DIVIDER_COMMON_CLASSES, dividerClassBuilder } from '../dividerClassBuilder';

const EXTRA_CLASS = 'bg-primary-600';

describe('dividerClassBuilder', () => {
  it('should have the common classes', () => {
    expect(dividerClassBuilder()).toContain(DIVIDER_COMMON_CLASSES);
    expect(dividerClassBuilder(EXTRA_CLASS)).toContain(DIVIDER_COMMON_CLASSES);
  });
  it('should have the extra passed classes', () => {
    expect(dividerClassBuilder(EXTRA_CLASS)).toContain(EXTRA_CLASS);
  });
});
