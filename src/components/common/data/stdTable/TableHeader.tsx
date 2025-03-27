import { flexRender, Header, Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';
import {
  headerClassBuilder,
  headerDivClassBuilder,
  headerDivStyleBuilder,
} from '@common/data/stdTable/tableCoreHeaderClassBuilder.ts';

export type TableHeaderProps<TData> = {
  table: Table<TData>;
  header: Header<TData, unknown>;
  columnSize: ColumnSizeType;
};

export const TableHeader = <TData,>(props: TableHeaderProps<TData>) => {
  const { table, header, columnSize } = props;
  return (
    <th className={headerClassBuilder(props)} style={columnSize === 'pixels' ? { width: header.getSize() } : undefined}>
      <span>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</span>
      {table.options.columnResizeMode && (
        <div
          onDoubleClick={header.column.resetSize}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={headerDivClassBuilder(props)}
          style={headerDivStyleBuilder(props)}
        />
      )}
    </th>
  );
};
