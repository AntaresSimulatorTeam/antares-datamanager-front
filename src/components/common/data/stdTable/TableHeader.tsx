import { flexRender, Header, Table } from '@tanstack/react-table';
import { ColumnSizeType } from '@common/data/stdTable/TableCore.tsx';
import { headerDivStyleBuilder } from '@common/data/stdTable/headerDivStyleBuilder.ts';
import { headerClassBuilder } from '@common/data/stdTable/headerClassBuilder.ts';
import { headerDivClassBuilder } from '@common/data/stdTable/headerDivClassBuilder.ts';
import { toRem } from '@/shared/utils/arrayUtils.ts';

export type TableHeaderProps<TData> = {
  table: Table<TData>;
  header: Header<TData, unknown>;
  columnSize: ColumnSizeType;
};

export const TableHeader = <TData,>(props: TableHeaderProps<TData>) => {
  const { table, header, columnSize } = props;
  return (
    <th
      className={headerClassBuilder(props)}
      style={
        columnSize === 'rem'
          ? { width: header.getSize() != null ? `${toRem(header.getSize())}` : '100vw' }
          : header.getSize() != null && columnSize === 'pixels'
            ? { width: header.getSize() }
            : { width: header.getSize() ?? '100%' }
      }
    >
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
