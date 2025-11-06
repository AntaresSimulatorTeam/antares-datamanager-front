import { clsx } from 'clsx';
import { TableHeaderProps } from '@common/data/stdTable/TableHeader.tsx';

const RESIZER_CLASSES =
  'absolute top-0 h-full w-0.5 cursor-col-resize touch-none select-none bg-gray-900 bg-opacity-50 opacity-0 group-hover:opacity-100';

export const headerDivClassBuilder = <TData>({ table, header }: TableHeaderProps<TData>) =>
  clsx(
    RESIZER_CLASSES,
    table.options.columnResizeDirection === 'ltr' ? 'right-0' : 'left-0',
    header.column.getIsResizing() ? 'bg-gray-500 opacity-100' : '',
  );