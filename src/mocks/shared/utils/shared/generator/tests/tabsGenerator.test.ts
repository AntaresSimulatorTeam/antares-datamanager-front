/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { tabsGenerator } from '../tabsGenerator';

describe('tabGenerator test', () => {
  it('should have the good number of primary tablist', () => {
    const tabs = tabsGenerator({ primaryNumber: 12, secondaryNumber: 0 });
    expect(tabs.length).toBe(12);
    expect(tabs[0].secondary?.length).toBe(0);
  });

  it('should have the good number of primary and second tablist', () => {
    const tabs = tabsGenerator({ primaryNumber: 8, secondaryNumber: 4 });
    expect(tabs.length).toBe(8);
    expect(tabs[0].secondary?.length).toBe(4);
  });
});
