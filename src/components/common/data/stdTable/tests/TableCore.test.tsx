/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, render, screen } from '@testing-library/react';
import TableCore from '../TableCore';
import { getTable } from './testTableUtils';

const TEST_ID = 'test-id';

describe('TableCore', () => {
  it('renders the default TableCore component with the proper id when specified', () => {
    const table = getTable();
    render(<TableCore id={TEST_ID} table={table} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  it('renders the Table with all its rows', () => {
    const table = getTable();
    const { rerender } = render(<TableCore table={table} />);

    const rows = document.querySelectorAll('tbody > tr');
    expect(rows).toHaveLength(2);

    act(() => table.toggleAllRowsExpanded(true));
    rerender(<TableCore table={table} />);
    const rowsExpanded = document.querySelectorAll('tbody > tr');
    expect(rowsExpanded).toHaveLength(3);
  });
});
