/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from 'vitest';
import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { renderHook } from '@testing-library/react';
import { ReadOnlyFeature } from '../features/readOnly';

interface TestNode {
  id: string;
  name: string;
  subRows?: TestNode[];
}

const testData: TestNode[] = [
  {
    id: 'row-1',
    name: 'Row 1',
  },
  {
    id: 'row-2',
    name: 'Parent Row 2',
    subRows: [
      {
        id: 'row-2.1',
        name: 'Child Row 2.1',
        subRows: [
          {
            id: 'row-2.1.1',
            name: 'Grandchild Row 2.1.1',
          },
        ],
      },
      {
        id: 'row-2.2',
        name: 'Child Row 2.2',
      },
    ],
  },
  {
    id: 'row-3',
    name: 'Row 3',
  },
];

const columns: ColumnDef<TestNode>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
];

const createTestTable = (initialReadOnly: Record<string, boolean> = {}) => {
  const { result } = renderHook(() =>
    useReactTable({
      _features: [ReadOnlyFeature],
      data: testData,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getRowId: (row) => row.id,
      getSubRows: (row) => row.subRows,
      initialState: {
        readOnly: initialReadOnly,
      },
      state: {
        readOnly: initialReadOnly,
      },
    }),
  );
  return result.current;
};

describe('ReadOnlyFeature', () => {
  it('should initialize with default readOnly state', () => {
    const table = createTestTable({});
    expect(table.getState().readOnly).toEqual({});
  });

  it('should return true when the row itself is readOnly', () => {
    const table = createTestTable({ 'row-1': true, 'row-3': false });
    const row1 = table.getRow('row-1');
    const row3 = table.getRow('row-3');

    expect(row1.getReadOnly()).toBe(true);
    expect(row3.getReadOnly()).toBe(false);
  });

  it('should return false for child row when neither self nor parent is readOnly', () => {
    const table = createTestTable({});
    const parentRow = table.getRow('row-2');
    const childRow = table.getRow('row-2.1');

    expect(parentRow.getReadOnly()).toBe(false);
    expect(childRow.getReadOnly()).toBe(false);
  });

  it('should inherit readOnly from parent row even if child is not explicitly in readOnly state', () => {
    const table = createTestTable({ 'row-2': true });
    const parentRow = table.getRow('row-2');
    const childRow21 = table.getRow('row-2.1');
    const childRow22 = table.getRow('row-2.2');
    const grandchildRow = table.getRow('row-2.1.1');

    expect(parentRow.getReadOnly()).toBe(true);
    expect(childRow21.getReadOnly()).toBe(true);
    expect(childRow22.getReadOnly()).toBe(true);
    expect(grandchildRow.getReadOnly()).toBe(true);
  });

  it('should return true for child row if child is readOnly even when parent is not', () => {
    const table = createTestTable({ 'row-2': false, 'row-2.1': true });
    const parentRow = table.getRow('row-2');
    const childRow21 = table.getRow('row-2.1');
    const childRow22 = table.getRow('row-2.2');

    expect(parentRow.getReadOnly()).toBe(false);
    expect(childRow21.getReadOnly()).toBe(true);
    expect(childRow22.getReadOnly()).toBe(false);
  });
});
