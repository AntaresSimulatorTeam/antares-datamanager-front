/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { generatePaginationItems } from '../utils';

const TEST_DATA = [
  { lastPage: 0, currentPage: 0, expectedResult: [] },
  { lastPage: 1, currentPage: 1, expectedResult: [1] },
  { lastPage: 6, currentPage: 1, expectedResult: [1, 2, 3, 4, 5, 6] },
  { lastPage: 10, currentPage: 1, expectedResult: [1, 2, 3, 4, 5, -1, 10] },
  { lastPage: 10, currentPage: 4, expectedResult: [1, 2, 3, 4, 5, -1, 10] },
  { lastPage: 10, currentPage: 5, expectedResult: [1, -1, 4, 5, 6, -1, 10] },
  { lastPage: 10, currentPage: 7, expectedResult: [1, -1, 6, 7, 8, 9, 10] },
  { lastPage: 10, currentPage: 10, expectedResult: [1, -1, 6, 7, 8, 9, 10] },
];

describe('generatePaginationItems', () => {
  it(`should return the correct pagination items for each case`, () => {
    for (const data of TEST_DATA) {
      const items = generatePaginationItems(data.lastPage, data.currentPage);
      expect(items).toEqual(data.expectedResult);
    }
  });
});
