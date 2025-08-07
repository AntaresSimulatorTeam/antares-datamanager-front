/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  getCoreRowModel as getTstCoreRowModel,
  getExpandedRowModel,
  RowModel,
  Table,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import TableCore, { TableCoreProps } from '../stdTable/TableCore';
import { ReadOnlyFeature } from '@common/data/stdTable/features/readOnly.ts';
import { RowStatus, SelectOption } from '@/shared/types';

export type StdSimpleTableProps<TData> = {
  getCoreRowModel?: (table: Table<TData>) => () => RowModel<TData>;
  getExpandedRowModel?: (table: Table<TData>) => () => RowModel<TData>;
  getSubRows?: (originalRow: TData) => TData[] | undefined;
  updateData?: (rowId: string, value: unknown, status: RowStatus) => void;
  removeRow?: (value: string, rowId?: string) => void | Promise<void>;
  search?: (value?: string, area?: string) => Promise<SelectOption[] | undefined>;
  importData?: (rowId: string, index?: number) => Promise<void>;
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
  enableRowSelection = false,
  enableMultiRowSelection = false,
  enableReadOnly = false,
  updateData,
  removeRow,
  importData,
  search,
  ...tableOptions
}: StdSimpleTableProps<TData>) => {
  const table = useReactTable<TData>({
    _features: [ReadOnlyFeature],
    columns,
    data,
    getCoreRowModel: getCustomCoreRowModel ?? getTstCoreRowModel<TData>(),
    getExpandedRowModel: getExpandedRowModel(),
    columnResizeMode,
    enableRowSelection,
    enableMultiRowSelection,
    enableReadOnly,
    meta: { removeRow, updateData, importData, search },
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
