import { TableCell } from '@common/data/stdTable/cells/TableCell';
import { Row } from '@tanstack/react-table';
import { tableCoreRowClassBuilder } from '@common/data/stdTable/tableCoreRowClassBuilder.ts';
import { useState } from 'react';

interface TableRowProps<TData> {
  row: Row<TData>;
  trClassName?: string;
  striped?: boolean;
  isSelected: boolean;
}

export const TableRow = <TData,>({ row, trClassName, striped, isSelected }: TableRowProps<TData>) => {
  const [_, setIsRowSelected] = useState(isSelected);

  const handleToggleRow = (rowData: Row<TData>) => {
    if (rowData.getCanSelect()) {
      rowData.toggleSelected();
      setIsRowSelected(rowData.getIsSelected());
    }
  };

  return (
    <tr
      key={row.id}
      className={tableCoreRowClassBuilder(striped, row.getIsSelected(), row.getReadOnly?.(), trClassName)}
      onClick={() => handleToggleRow(row)}
      aria-readonly={row.getReadOnly?.()}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} cell={cell} />
      ))}
    </tr>
  );
};
