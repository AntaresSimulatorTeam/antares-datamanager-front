/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  getCoreRowModel as getTstCoreRowModel,
  RowModel,
  Table,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import TableCore, { TableCoreProps } from '../stdTable/TableCore';
import { ReadOnlyFeature } from '@common/data/stdTable/features/readOnly.ts';

export type StdSimpleTableProps<TData> = {
  getCoreRowModel?: (table: Table<TData>) => () => RowModel<TData>;
} & Omit<TableCoreProps<TData>, 'table'> &
  Omit<TableOptions<TData>, 'getCoreRowModel'> & { areRowsMemoized?: boolean };

export type TableRef<TData> = {
  table: Table<TData>;
};

const StdSimpleTable = <TData,>({
  id,
  areRowsMemoized = false,
  data,
  columns,
  getCoreRowModel: getCustomCoreRowModel,
  striped,
  trClassName,
  columnSize = 'meta',
  columnResizeMode = undefined,
  enableRowSelection = false,
  enableMultiRowSelection = false,
  enableReadOnly = false,
  ...tableOptions
}: StdSimpleTableProps<TData>) => {
  const table = useReactTable<TData>({
    _features: [ReadOnlyFeature],
    columns,
    data,
    getCoreRowModel: getCustomCoreRowModel ?? getTstCoreRowModel<TData>(),
    columnResizeMode,
    enableRowSelection,
    enableMultiRowSelection,
    enableReadOnly,
    ...tableOptions,
  });

  return (
    <TableCore
      table={table}
      id={id}
      striped={striped}
      columnSize={columnSize}
      columnResizeMode={columnResizeMode}
      trClassName={trClassName}
      areRowsMemoized={areRowsMemoized}
    />
  );
};

export default StdSimpleTable;
