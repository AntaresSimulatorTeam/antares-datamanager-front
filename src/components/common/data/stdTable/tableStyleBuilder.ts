import { Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';

export const tableStyleBuilder = <TData>(table: Table<TData>, columnSize: ColumnSizeType) => {
  if (columnSize === 'pixels') {
    return { width: table.getCenterTotalSize()};
  } else if (columnSize !== 'rem') {
    return { width: '100dvw' };
  }
  return undefined;
}
