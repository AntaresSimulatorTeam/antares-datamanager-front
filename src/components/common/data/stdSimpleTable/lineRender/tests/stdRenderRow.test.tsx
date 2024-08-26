/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdRenderRow from '../StdRenderRow';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { fakeChildRows, fakeChildSubRows } from '@/mocks/data/components/collapseTableItems';

describe('StdRenderRow', () => {
  it('renders the StdRenderRow component with straight row', () => {
    render(
      <StdRenderRow
        row={fakeChildSubRows[0]}
        headers={[
          { key: 'col1', dataKey: 'col1', label: 'Column 1' },
          { key: 'col2', dataKey: 'col2', label: 'Column 2' },
          { key: 'col3', dataKey: 'col3', label: 'Column 3' },
        ]}
        key=""
      />,
    );
    expect(screen.queryByTitle(StdIconId.KeyboardArrowDown)).not.toBeInTheDocument();
  });

  it('renders the StdRenderRow component with collapse row', () => {
    render(
      <StdRenderRow
        row={fakeChildRows[1]}
        headers={[
          { key: 'col1', dataKey: 'col1', label: 'Column 1' },
          { key: 'col2', dataKey: 'col2', label: 'Column 2' },
          { key: 'col3', dataKey: 'col3', label: 'Column 3' },
        ]}
        key=""
      />,
    );
    expect(screen.getByTitle(StdIconId.KeyboardArrowDown)).toBeInTheDocument();
  });
});
