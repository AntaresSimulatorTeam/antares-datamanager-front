import { Table } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { ROW_CLASSES } from '@common/data/stdTable/const/TableClasses.ts';
import { ColumnSizeType } from '@common/data/stdTable/types/column.type.ts';

export const tableClassBuilder = <TData>(table: Table<TData>) =>
  clsx(table.options.columnResizeMode ? 'w-fit' : 'w-full', ROW_CLASSES);

export const tableStyleBuilder = <TData>(table: Table<TData>, columnSize: ColumnSizeType) =>
  columnSize === 'pixels'
    ? {
        width: table.getCenterTotalSize(),
      }
    : undefined;
