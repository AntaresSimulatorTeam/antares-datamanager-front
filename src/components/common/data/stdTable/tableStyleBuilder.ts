import { Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';

export const tableStyleBuilder = <TData>(table: Table<TData>, columnSize: ColumnSizeType) =>
  columnSize === 'pixels'
    ? {
        width: table.getCenterTotalSize(),
      }
    : columnSize === 'rem'
      ? undefined
      : { width: '100dvw' };
