import { Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';
import { toRem } from '@/shared/utils/arrayUtils.ts';

export const tableStyleBuilder = <TData>(table: Table<TData>, columnSize: ColumnSizeType) =>
  columnSize === 'pixels'
    ? {
        width: table.getCenterTotalSize(),
      }
    : columnSize === 'rem'
      ? { width: `${toRem(table.getCenterTotalSize())}` }
      : {};
