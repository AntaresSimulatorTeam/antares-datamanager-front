import { clsx } from 'clsx';
import { COMMON_HEADER_CLASSES, RESIZER_CLASSES, ROW_CLASSES } from '@/shared/const/classesConst.ts';
import { Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';
import { TableHeaderProps } from '@common/data/stdTable/TableHeader.tsx';

export const headerClassBuilder = <TData>({ table, header, columnSize }: TableHeaderProps<TData>) =>
  clsx(
    COMMON_HEADER_CLASSES,
    columnSize === 'meta' ? (header.column.columnDef.meta?.sizeClassNames ?? '') : '',
    table.options.columnResizeMode ? 'group relative' : '',
  );

export const headerDivClassBuilder = <TData>({ table, header }: TableHeaderProps<TData>) =>
  clsx(
    RESIZER_CLASSES,
    table.options.columnResizeDirection === 'ltr' ? 'right-0' : 'left-0',
    header.column.getIsResizing() ? 'bg-gray-500 opacity-100' : '',
  );

export const headerDivStyleBuilder = <TData>({ table, header }: TableHeaderProps<TData>) => ({
  transform:
    table.options.columnResizeMode === 'onEnd' && header.column.getIsResizing()
      ? `translateX(${
          (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
          (table.getState().columnSizingInfo.deltaOffset ?? 0)
        }px)`
      : '',
});

export const tableClassBuilder = <TData>(table: Table<TData>) =>
  clsx(table.options.columnResizeMode ? 'w-fit' : 'w-full', ROW_CLASSES);

export const tableStyleBuilder = <TData>(table: Table<TData>, columnSize: ColumnSizeType) =>
  columnSize === 'pixels'
    ? {
        width: table.getCenterTotalSize(),
      }
    : undefined;
