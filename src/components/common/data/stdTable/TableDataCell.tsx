import { Cell, flexRender } from '@tanstack/react-table';

type TableDataCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

export const TableDataCell = <TData,>({ cell }: TableDataCellProps<TData>) => (
  <td className="text-left">
    <div className="px-1">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
  </td>
);
