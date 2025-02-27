/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ColumnResizeMode, Row, Table } from '@tanstack/react-table';
import { tableCoreRowClassBuilder } from './tableCoreRowClassBuilder';
import { useRdsId } from 'rte-design-system-react';
import { tableClassBuilder, tableStyleBuilder } from '@/shared/utils/tableClassBuilder.ts';
import { TableHeader } from '@common/data/stdTable/TableHeader.tsx';
import { ColumnSizeType } from '@/shared/types/Table.type.ts';
import MemoizedTableCell from '@common/data/stdTable/TableCell.tsx';

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
              <MemoizedTableCell key={cell.id} cell={cell} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableCore;
