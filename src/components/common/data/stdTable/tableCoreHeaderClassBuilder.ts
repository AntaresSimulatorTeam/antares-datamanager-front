import { clsx } from 'clsx';
import { TableHeaderProps } from '@common/data/stdTable/TableHeader.tsx';
import { COMMON_HEADER_CLASSES, RESIZER_CLASSES } from '@common/data/stdTable/const/TableClasses.ts';

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
