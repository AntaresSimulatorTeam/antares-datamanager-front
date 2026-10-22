import { TableHeaderProps } from '@common/data/stdTable/TableHeader.tsx';
import { toRem } from '@/shared/utils/arrayUtils.ts';
import { Table } from '@tanstack/react-table';

export const getColumnSize = <TData>(table: Table<TData>) => (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
  (table.getState().columnSizingInfo.deltaOffset ?? 0);

export const headerDivStyleBuilder = <TData>({ table, header, columnSize }: TableHeaderProps<TData>) => ({
  transform:
    table.options.columnResizeMode === 'onEnd' && header.column.getIsResizing() && columnSize === 'rem'
      ? `translateX(${toRem(getColumnSize(table))})`
      : `translateX(${getColumnSize(table)}px)`
});
