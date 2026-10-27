import clsx from 'clsx';
import { Header, Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';
import { toRem } from '@/shared/utils/arrayUtils.ts';

type TableHeaderProps<TData> = {
  table: Table<TData>;
  header: Header<TData, unknown>;
  columnSize: ColumnSizeType;
};

const COMMON_HEADER_CLASSES = 'px-1 py-0.5 text-left font-semibold bg-background-brand-default text-content-primary-inverse';

export const headerClassBuilder = <TData>({ table, header }: TableHeaderProps<TData>) => {
  const ROUNDED_TR_CLASS = header.index === table.getHeaderGroups()[0]?.headers.length - 1 ? 'rounded-tr' : '';
  const ROUNDED_CLASS = header.index === 0 ? 'rounded-tl' : ROUNDED_TR_CLASS;

  return clsx(COMMON_HEADER_CLASSES, table.options.columnResizeMode ? 'group relative' : '', ROUNDED_CLASS);
};

export const headerStyleBuilder = <TData>({ header, columnSize }: TableHeaderProps<TData>) => columnSize === 'rem'
    ? { width: header.getSize() != null ? `${toRem(header.getSize())}` : '100vw' }
    : { width: header.getSize() ?? '100%' };
