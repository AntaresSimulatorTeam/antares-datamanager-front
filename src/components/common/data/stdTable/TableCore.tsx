/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Row, RowData, Table } from '@tanstack/react-table';
import { tableCoreRowClassBuilder } from './tableCoreRowClassBuilder';
import { RowStatus, SelectOption } from '@/shared/types';
import { Fragment } from 'react';
import { TableHeader } from '@common/data/stdTable/TableHeader.tsx';
import { TableDataCell } from '@common/data/stdTable/TableDataCell.tsx';
import { tableStyleBuilder } from '@common/data/stdTable/tableStyleBuilder.ts';
import { useRdsId } from 'rte-design-system-react';
import { tableClassBuilder } from '@common/data/stdTable/tableClassBuilder.ts';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowId: string, value: unknown, status: RowStatus) => void;
    removeRow?: (value: string, rowId?: string) => void | Promise<void>;
    search?: (value: string, rowId: string) => Promise<SelectOption[] | undefined> | undefined;
    importData?: (rowId: string) => Promise<void>;
    viewData?: (rowId: string) => void | Promise<void>;
    activate?: () => void;
  }
}

export type ColumnResizeMode = 'onChange' | 'onEnd';
export type ColumnSizeType = 'pixels' | 'meta' | 'rem';

export type TableCoreProps<TData> = {
  id?: string;
  striped?: boolean;
  trClassName?: string;
  columnSize?: ColumnSizeType;
  columnResizeMode?: ColumnResizeMode;
  table: Table<TData>;
};

const TableCore = <TData,>({ table, id: propId, striped, trClassName, columnSize = 'meta' }: TableCoreProps<TData>) => {
  const id = useRdsId('table-', propId);

  const handleToggleRow = (row: Row<TData>) => () => {
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
          <Fragment key={row.id}>
            <tr
              key={row.id}
              className={tableCoreRowClassBuilder(
                striped,
                row.getIsSelected(),
                row.getReadOnly?.(),
                row.getCanExpand(),
                row.getParentRow()?.getCanExpand(),
                trClassName,
              )}
              onClick={handleToggleRow(row)}
              aria-readonly={row.getReadOnly?.()}
            >
              {row.getVisibleCells().map((cell) => (
                <TableDataCell key={cell.id} cell={cell} />
              ))}
            </tr>
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default TableCore;
