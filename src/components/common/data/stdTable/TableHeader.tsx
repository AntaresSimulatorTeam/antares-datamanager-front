import { flexRender, Header, Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';
import { headerDivStyleBuilder } from '@common/data/stdTable/headerDivStyleBuilder.ts';
import { headerClassBuilder, headerStyleBuilder } from '@common/data/stdTable/headerClassBuilder.ts';
import { headerDivClassBuilder } from '@common/data/stdTable/headerDivClassBuilder.ts';

export type TableHeaderProps<TData> = {
  table: Table<TData>;
  header: Header<TData, unknown>;
  columnSize: ColumnSizeType;
};

export const TableHeader = <TData,>(props: TableHeaderProps<TData>) => {
  const { table, header } = props;
  return (
    <th
      className={headerClassBuilder(props)}
      style={headerStyleBuilder(props)}
    >
      <span>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</span>
      {table.options.columnResizeMode && (
        <div
          role="tab"
          tabIndex={header.index}
          onDoubleClick={header.column.resetSize}
          onMouseDown={header.getResizeHandler()}
          onKeyDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={headerDivClassBuilder(props)}
          style={headerDivStyleBuilder(props)}
        />
      )}
    </th>
  );
};
