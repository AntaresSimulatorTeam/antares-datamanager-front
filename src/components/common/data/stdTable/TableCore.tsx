/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Table } from '@tanstack/react-table';
import { useRdsId } from 'rte-design-system-react';
import { TableHeader } from '@common/data/stdTable/TableHeader.tsx';
import { tableClassBuilder, tableStyleBuilder } from '@common/data/stdTable/tableCoreTableBuilder.ts';
import { ColumnResizeMode, ColumnSizeType } from '@common/data/stdTable/types/column.type.ts';
import { typedMemo } from '@/shared/types/Generic.type.ts';
import { TableRow } from '@common/data/stdTable/TableRow.tsx';

export type TableCoreProps<TData> = {
  id?: string;
  striped?: boolean;
  trClassName?: string;
  columnSize?: ColumnSizeType;
  columnResizeMode?: ColumnResizeMode;
  table: Table<TData>;
  areRowsMemoized?: boolean;
};

const MemoizedTableRow = typedMemo(TableRow);

const TableCore = <TData,>({
  table,
  id: propId,
  striped,
  trClassName,
  columnSize = 'meta',
  areRowsMemoized,
}: TableCoreProps<TData>) => {
  const id = useRdsId('table-', propId);
  const RowComponent = areRowsMemoized ? MemoizedTableRow : TableRow;

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
          <RowComponent
            key={row.id}
            row={row}
            striped={striped}
            trClassName={trClassName}
            isSelected={row.getIsSelected()}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TableCore;
