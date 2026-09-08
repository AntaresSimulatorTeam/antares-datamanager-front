/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { functionalUpdate, makeStateUpdater, Row, RowData, Table, TableFeature, Updater } from '@tanstack/react-table';
import { ReadOnlyObject, ReadOnlyOptions, ReadOnlyTableState } from '../types/readOnly.type';

export const ReadOnlyFeature: TableFeature = {
  getInitialState: (state): ReadOnlyTableState => ({
    readOnly: {},
    ...state,
  }),

  getDefaultOptions: <TData extends RowData>(table: Table<TData>): ReadOnlyOptions => ({
      enableReadOnly: false,
      onReadOnlyChange: makeStateUpdater('readOnly', table),
    } as ReadOnlyOptions),

  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.setReadOnly = (updater) => {
      const safeUpdater: Updater<ReadOnlyObject> = (old) => functionalUpdate(updater, old);
      return table.options.onReadOnlyChange?.(safeUpdater);
    };
    // table.toggleReadOnly = value => {
    //   table.setReadOnly(old => !old);
    // };
  },

  createRow: <TData extends RowData>(row: Row<TData>, table: Table<TData>): void => {
    row.getReadOnly = () => table.getState().readOnly[row.id];
  },
};
