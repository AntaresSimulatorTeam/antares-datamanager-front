/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RowData } from '@tanstack/react-table';

export type RowDataTest = {
  col1: string;
  col2: string;
  col3: string;
};

export const fakeHeaders = [
  { key: 'col1', dataKey: 'col1', label: 'Column 1' },
  { key: 'col2', dataKey: 'col2', label: 'Column 2' },
  { key: 'col3', dataKey: 'col3', label: 'Column 3' },
];

export const fakeChildSubRows = [
  {
    data: { col1: 'test 2.1.1', col2: 'test 2.1.2', col3: 'test 2.1.3' },
    key: 'row2.1',
  },
  {
    data: { col1: 'test 2.2.1', col2: 'test 2.2.2', col3: 'test 2.2.3' },
    key: 'row2.2',
  },
];

export const fakeChildRows: RowData[] = [
  {
    data: { col1: 'test 1.1', col2: 'test 1.2', col3: 'test 1.3' },
    key: 'row1',
  },
  {
    data: { col1: 'test 2.1', col2: 'test 2.2', col3: 'test 2.3' },
    key: 'row2',
    collapsible: true,
    defaultOpen: true,
    childRows: fakeChildSubRows,
  },
  {
    data: { col1: 'test 3.1', col2: 'test 3.2', col3: 'test 3.3' },
    key: 'row3',
  },
  {
    data: { col1: 'test 4.1', col2: 'test 4.2', col3: 'test 4.3' },
    key: 'row4',
  },
];
