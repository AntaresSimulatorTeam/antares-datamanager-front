import { Cell, flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';

type TableCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

export const TableCell = <TData,>({ cell }: TableCellProps<TData>) => {
  const cellMemo = useMemo(() => cell, [cell.row.getIsSelected()]);
  return (
    <td className="text-left">
      <div className="px-1 py-0.5">{flexRender(cellMemo.column.columnDef.cell, cellMemo.getContext())}</div>
    </td>
  );
};
