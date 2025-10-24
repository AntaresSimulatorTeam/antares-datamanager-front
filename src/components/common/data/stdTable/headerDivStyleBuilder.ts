import { TableHeaderProps } from '@common/data/stdTable/TableHeader.tsx';
import { toRem } from '@/shared/utils/arrayUtils.ts';

export const headerDivStyleBuilder = <TData>({ table, header, columnSize }: TableHeaderProps<TData>) => ({
  transform:
    table.options.columnResizeMode === 'onEnd' && header.column.getIsResizing() && columnSize === 'rem'
      ? `translateX(${toRem(
          (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
            (table.getState().columnSizingInfo.deltaOffset ?? 0),
        )})`
      : `translateX(${
          (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
          (table.getState().columnSizingInfo.deltaOffset ?? 0)
        }px)`,
});
