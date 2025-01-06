/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { renderHook } from '@testing-library/react';
import { ReadOnlyFeature } from '../features/readOnly';

const data = [
  {
    name: 'A',
  },
  {
    name: 'B',
    childRows: [
      {
        name: 'B1',
      },
    ],
  },
];
type TableRowType = (typeof data)[0];

const columns = [
  {
    accessorKey: 'name',
  },
] as ColumnDef<TableRowType>[];

export const getTable = (withReadOnly?: boolean) => {
  const {
    result: { current: table },
  } = renderHook(() =>
    useReactTable({
      _features: withReadOnly ? [ReadOnlyFeature] : [],
      data,
      columns,
      getCoreRowModel: getCoreRowModel<TableRowType>(),
      getExpandedRowModel: getExpandedRowModel(),
      getRowId: (row: TableRowType) => row.name,
      getSubRows: (row) => row.childRows,
      state: {
        readOnly: withReadOnly ? { [data[0].name]: true } : undefined,
      },
    }),
  );
  return table;
};
