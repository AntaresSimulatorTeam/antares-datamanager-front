import clsx from 'clsx';
import { Header, Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';
import { toRem } from '@/shared/utils/arrayUtils.ts';

type TableHeaderProps<TData> = {
  table: Table<TData>;
  header: Header<TData, unknown>;
  columnSize: ColumnSizeType;
};

const COMMON_HEADER_CLASSES = 'px-1 py-0.5 text-left font-semibold bg-primary-600 text-gray-w';
export const headerClassBuilder = <TData>({ table, header, columnSize }: TableHeaderProps<TData>) =>
  clsx(
    COMMON_HEADER_CLASSES,
    columnSize === 'meta'
      ? (header.column.columnDef.meta?.sizeClassNames ?? '')
      : columnSize === 'rem'
        ? `${header.column.columnDef.size ? toRem(header.column.columnDef.size) : ''}`
        : `${header.column.columnDef.size}px`,
    table.options.columnResizeMode ? 'group relative' : '',
    header.index === 0
      ? 'rounded-tl-lg'
      : header.index === table.getHeaderGroups()[0]?.headers.length - 1
        ? 'rounded-tr-lg'
        : '',
  );
