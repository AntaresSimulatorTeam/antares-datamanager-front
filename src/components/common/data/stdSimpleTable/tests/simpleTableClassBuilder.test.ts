/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ROW_CLASSES, STRIPED_CLASSES, rowClassBuilder } from '../simpleTableClassBuilder';

describe('SimpleTableClassBuilder', () => {
  it('tableClasses should only return the common classes if striped is false', () => {
    expect(rowClassBuilder(false, []).tableClasses.includes(ROW_CLASSES)).toBe(true);
  });
  it('tableClasses should contain both common and striped classes if striped is true', () => {
    expect(rowClassBuilder(true, []).tableClasses.includes(ROW_CLASSES)).toBe(true);
    expect(rowClassBuilder(true, []).tableClasses.includes(STRIPED_CLASSES)).toBe(true);
  });
});
