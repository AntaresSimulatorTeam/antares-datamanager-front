/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdSimpleTable from '../StdSimpleTable';
import { HeaderConfig } from '../type/tableType';

type User = {
  firstName: string;
  lastName: string;
  age: number;
};

const TEST_DATA = [
  {
    key: 'John',
    data: {
      firstName: 'John',
      lastName: 'Doe',
      age: 34,
    },
  },
  {
    key: 'Keanu',
    data: {
      firstName: 'Keanu',
      lastName: 'Reeves',
      age: 59,
    },
  },
  {
    key: 'Anya',
    data: {
      firstName: 'Anya',
      lastName: 'Taylor-Joy',
      age: 27,
    },
  },
];

const TEST_HEADERS: HeaderConfig<User>[] = [
  {
    label: 'Prénom',
    dataKey: 'firstName',
    key: 'firstName',
  },
  {
    label: 'Nom',
    dataKey: 'lastName',
    key: 'lastName',
  },
  {
    label: 'Âge',
    key: 'age',
    formatter: (row: User) => <>{row.age} ans</>,
  },
];

describe('StdSimpleTable', () => {
  it('should render the table', () => {
    render(<StdSimpleTable rows={TEST_DATA} headers={TEST_HEADERS} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });
});
