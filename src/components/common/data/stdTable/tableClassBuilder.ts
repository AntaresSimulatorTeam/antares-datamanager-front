import { Table } from '@tanstack/react-table';
import { clsx } from 'clsx';

const ROW_CLASSES = '[&_tr]:border-b [&_tr]:border-b-gray-400 [&_tr]:text-body-s';
export const tableClassBuilder = <TData>(table: Table<TData>) =>
  clsx(table.options.columnResizeMode ? 'w-fit' : 'w-full', ROW_CLASSES);
