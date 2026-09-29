import { Cell, flexRender } from '@tanstack/react-table';

type TableDataCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

export const TableDataCell = <TData,>({ cell }: TableDataCellProps<TData>) => (
  <td className="text-left">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
);
