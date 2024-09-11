/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import StdSimpleTable from '../StdSimpleTable';

type User = {
  firstName: string;
  lastName: string;
  age: number;
};

const TEST_DATA = [
  {
    firstName: 'John',
    lastName: 'Doe',
    age: 34,
  },
  {
    firstName: 'Keanu',
    lastName: 'Reeves',
    age: 59,
  },
  {
    firstName: 'Anya',
    lastName: 'Taylor-Joy',
    age: 27,
  },
] as User[];

const TEST_HEADERS = [
  {
    header: 'Prénom',
    accessorKey: 'firstName',
  },
  {
    header: 'Nom',
    accessorKey: 'lastName',
  },
  {
    header: 'Âge',
    accessorKey: 'age',
  },
] as ColumnDef<User>[];

describe('StdSimpleTable', () => {
  it('should render the table', () => {
    render(<StdSimpleTable data={TEST_DATA} columns={TEST_HEADERS} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });
  it('should render the table with all its rows and cells', () => {
    render(<StdSimpleTable data={TEST_DATA} columns={TEST_HEADERS} />);
    const rows = document.querySelectorAll('tbody > tr');
    expect(rows).toHaveLength(3);

    const cells = document.querySelectorAll('tbody > tr > td');
    expect(cells).toHaveLength(9);
  });
});
