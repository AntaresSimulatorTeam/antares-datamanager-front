/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  READONLY_ROW_CLASSES,
  READONLY_SELECTED_ROW_CLASSES,
  SELECTED_ROW_CLASSES,
  STRIPED_CLASSES,
} from '@common/data/stdTable/const/TableClasses.ts';
import { tableCoreRowClassBuilder } from '@common/data/stdTable/tableCoreRowClassBuilder.ts';

describe('tableCoreRowClassBuilder function', () => {
  it('should have the expected striped classes', () => {
    expect(tableCoreRowClassBuilder(true).includes(STRIPED_CLASSES)).toBe(true);
  });

  it('should have the expected selected classes', () => {
    expect(tableCoreRowClassBuilder(false, true).includes(SELECTED_ROW_CLASSES)).toBe(true);
  });

  it('should have the expected readonly classes', () => {
    expect(tableCoreRowClassBuilder(false, false, true).includes(READONLY_ROW_CLASSES)).toBe(true);
  });

  it('should have the expected additional "tr" classes', () => {
    expect(
      tableCoreRowClassBuilder(false, false, false, READONLY_SELECTED_ROW_CLASSES).includes(
        READONLY_SELECTED_ROW_CLASSES,
      ),
    ).toBe(true);
  });
});
