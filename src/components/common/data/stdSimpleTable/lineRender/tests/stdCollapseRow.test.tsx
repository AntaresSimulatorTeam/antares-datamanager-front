/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdCollapseRow from '../StdCollapseRow';
import { fakeChildRows, fakeChildSubRows } from '@/mocks/data/components/collapseTableItems';

describe('stdCollapseRow', () => {
  it('renders the basic stdCollapseRow component', () => {
    render(
      <StdCollapseRow
        headers={[]}
        row={{
          key: 'id',
          data: { col1: 'root1', col2: 'root2', col3: 'root3' },
          collapsible: true,
          defaultOpen: true,
          childRows: fakeChildRows,
        }}
      />,
    );
    expect(screen.getAllByRole('row').length).toBe(fakeChildRows.length + fakeChildSubRows.length + 1);
  });
});
