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

export type StdSimpleTableProps<TData> = {
  getCoreRowModel?: (table: Table<TData>) => () => RowModel<TData>;
} & Omit<TableCoreProps<TData>, 'table'> &
  Omit<TableOptions<TData>, 'getCoreRowModel'>;

export type TableRef<TData> = {
  table: Table<TData>;
};

const StdSimpleTable = <TData,>({
  id,
  data,
  columns,
  getCoreRowModel: getCustomCoreRowModel,
  striped,
  trClassName,
  columnSize = 'meta',
  columnResizeMode = undefined,
  ...tableOptions
}: StdSimpleTableProps<TData>) => {
  const table = useReactTable<TData>({
    columns,
    data,
    getCoreRowModel: getCustomCoreRowModel ?? getTstCoreRowModel<TData>(),
    columnResizeMode,
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
    />
  );
};

export default StdSimpleTable;
