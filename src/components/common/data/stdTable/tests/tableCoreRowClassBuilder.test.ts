/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  READONLY_ROW_CLASSSES,
  SELECTED_ROW_CLASSSES,
  STRIPED_CLASSSES,
  tableCoreRowClassBuilder,
} from '../tableCoreRowClassBuilder';

const TEST_TR_CLASSES = 'bg-acc1-500 text-caption';

describe('tableCoreRowClassBuilder function', () => {
  it('should have the expected striped classes', () => {
    expect(tableCoreRowClassBuilder(true).includes(STRIPED_CLASSSES)).toBe(true);
  });

  it('should have the expected selected classes', () => {
    expect(tableCoreRowClassBuilder(false, true).includes(SELECTED_ROW_CLASSSES)).toBe(true);
  });

  it('should have the expected readonly classes', () => {
    expect(tableCoreRowClassBuilder(false, false, true).includes(READONLY_ROW_CLASSSES)).toBe(true);
  });

  it('should have the expected additional "tr" classes', () => {
    expect(tableCoreRowClassBuilder(false, false, false, TEST_TR_CLASSES).includes(TEST_TR_CLASSES)).toBe(true);
  });
});
