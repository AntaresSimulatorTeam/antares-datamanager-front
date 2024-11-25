/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/useStdId';
import { Cell, flexRender, Header, Row, Table } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { tableCoreRowClassBuilder } from './tableCoreRowClassBuilder';

export type ColumnSizeType = 'pixels' | 'meta';
export type ColumnResizeMode = 'onChange' | 'onEnd';

type TableHeaderProps<TData> = {
  table: Table<TData>;
  header: Header<TData, unknown>;
  columnSize: ColumnSizeType;
};

const COMMON_HEADER_CLASSES = 'px-1 py-0.5 text-left font-semibold';
const headerClassBuilder = <TData,>({ table, header, columnSize }: TableHeaderProps<TData>) =>
  clsx(
    COMMON_HEADER_CLASSES,
    columnSize === 'meta' ? (header.column.columnDef.meta?.sizeClassNames ?? '') : '',
    table.options.columnResizeMode ? 'group relative' : '',
  );

const RESIZER_CLASSES =
  'absolute top-0 h-full w-0.5 cursor-col-resize touch-none select-none bg-gray-900 bg-opacity-50 opacity-0 group-hover:opacity-100';

const headerDivClassBuilder = <TData,>({ table, header }: TableHeaderProps<TData>) =>
  clsx(
    RESIZER_CLASSES,
    table.options.columnResizeDirection === 'ltr' ? 'right-0' : 'left-0',
    header.column.getIsResizing() ? 'bg-gray-500 opacity-100' : '',
  );

const headerDivStyleBuilder = <TData,>({ table, header }: TableHeaderProps<TData>) => ({
  transform:
    table.options.columnResizeMode === 'onEnd' && header.column.getIsResizing()
      ? `translateX(${
          (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
          (table.getState().columnSizingInfo.deltaOffset ?? 0)
        }px)`
      : '',
});

const TableHeader = <TData,>(props: TableHeaderProps<TData>) => {
  const { table, header, columnSize } = props;
  return (
    <th className={headerClassBuilder(props)} style={columnSize === 'pixels' ? { width: header.getSize() } : undefined}>
      <span>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</span>
      {table.options.columnResizeMode && (
        <div
          onDoubleClick={header.column.resetSize}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={headerDivClassBuilder(props)}
          style={headerDivStyleBuilder(props)}
        />
      )}
    </th>
  );
};

type TableDataCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

const TableDataCell = <TData,>({ cell }: TableDataCellProps<TData>) => (
  <td className="text-left">
    <div className="flex flex-1 items-center px-1 py-0.5">
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  </td>
);

export type TableCoreProps<TData> = {
  id?: string;
  striped?: boolean;
  trClassName?: string;
  columnSize?: ColumnSizeType;
  columnResizeMode?: ColumnResizeMode;
  table: Table<TData>;
};

const ROW_CLASSES = '[&_tr]:border-b [&_tr]:border-gray-400 [&_tr]:text-body-s';
const tableClassBuilder = <TData,>(table: Table<TData>) =>
  clsx(table.options.columnResizeMode ? 'w-fit' : 'w-full', ROW_CLASSES);

const tableStyleBuilder = <TData,>(table: Table<TData>, columnSize: ColumnSizeType) =>
  columnSize === 'pixels'
    ? {
        width: table.getCenterTotalSize(),
      }
    : undefined;

const TableCore = <TData,>({ table, id: propId, striped, trClassName, columnSize = 'meta' }: TableCoreProps<TData>) => {
  const id = useStdId('table-', propId);

  const handleToggleRow = (row: Row<unknown>) => () => {
    if (row.getCanSelect()) {
      row.toggleSelected();
    }
  };

  return (
    <table className={tableClassBuilder(table)} id={id} style={tableStyleBuilder(table, columnSize)}>
      <thead>
        <tr>
          {table
            .getHeaderGroups()
            .map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <TableHeader key={header.id} table={table} header={header} columnSize={columnSize} />
              )),
            )}
        </tr>
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className={tableCoreRowClassBuilder(striped, row.getIsSelected(), row.getReadOnly?.(), trClassName)}
            onClick={handleToggleRow(row)}
            aria-readonly={row.getReadOnly?.()}
          >
            {row.getVisibleCells().map((cell) => (
              <TableDataCell key={cell.id} cell={cell} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableCore;
