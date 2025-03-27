import { Cell, flexRender } from '@tanstack/react-table';

type TableCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

export const TableCell = <TData,>({ cell }: TableCellProps<TData>) => (
  <td className="text-left">
    <div className="px-1 py-0.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
  </td>
);
