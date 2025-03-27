import { Table } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';

const ROW_CLASSES = '[&_tr]:border-b [&_tr]:border-gray-400 [&_tr]:text-body-s';
export const tableClassBuilder = <TData>(table: Table<TData>) =>
  clsx(table.options.columnResizeMode ? 'w-fit' : 'w-full', ROW_CLASSES);

export const tableStyleBuilder = <TData>(table: Table<TData>, columnSize: ColumnSizeType) =>
  columnSize === 'pixels'
    ? {
        width: table.getCenterTotalSize(),
      }
    : undefined;
