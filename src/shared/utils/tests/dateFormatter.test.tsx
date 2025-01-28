/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { formatDateToDDMMYYYY } from '../dateFormatter';

describe('formatDate', () => {
  it('should format date as YYYY-MM-DD when includeTime is false or not provided', () => {
    const date = new Date('2024-07-25T10:07:21');
    const formattedDate = formatDateToDDMMYYYY(date);
    expect(formattedDate).toBe('2024-07-25');
  });

  it('should format date as YYYY-MM-DD HH:mm:ss when includeTime is true', () => {
    const date = new Date('2024-07-25T10:07:21');
    const formattedDate = formatDateToDDMMYYYY(date, true);
    expect(formattedDate).toBe('2024-07-25 10:07:21');
  });
});
