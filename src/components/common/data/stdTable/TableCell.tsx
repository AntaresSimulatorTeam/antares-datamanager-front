import { Cell, flexRender } from '@tanstack/react-table';
import { memo } from 'react';

type TableCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

const TableCell = <TData,>({ cell }: TableCellProps<TData>) => (
  <td className="text-left">
    <div className="px-1 py-0.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
  </td>
);

const MemoizedTableCell = memo(TableCell) as <TData>(props: TableCellProps<TData>) => JSX.Element;

export default MemoizedTableCell;
