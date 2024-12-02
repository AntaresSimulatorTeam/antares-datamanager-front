/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Row, RowData, Table, TableFeature } from '@tanstack/react-table';
import { ReadOnlyOptions, ReadOnlyTableState } from '../types/readOnly.type';

export const ReadOnlyFeature: TableFeature = {
  getInitialState: (state): ReadOnlyTableState => ({
    readOnly: {},
    ...state,
  }),

  getDefaultOptions: <TData extends RowData>(_table: Table<TData>): ReadOnlyOptions => ({}) as ReadOnlyOptions,

  createRow: <TData extends RowData>(row: Row<TData>, table: Table<TData>): void => {
    row.getReadOnly = () => !!table.getState().readOnly[row.id];
  },
};
