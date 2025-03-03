import { TableCell } from '@common/data/stdTable/TableCell.tsx';
import { Row } from '@tanstack/react-table';
import { tableCoreRowClassBuilder } from '@common/data/stdTable/tableCoreRowClassBuilder.ts';
import { useState } from 'react';
import { typedMemo } from '@/shared/types/Generic.type.ts';

interface TableRowProps<TData> {
  row: Row<TData>;
  trClassName?: string;
  striped?: boolean;
  isSelected: boolean;
}

const MemoizedTableCell = typedMemo(TableCell);

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
        <MemoizedTableCell key={cell.id} cell={cell} />
      ))}
    </tr>
  );
};
