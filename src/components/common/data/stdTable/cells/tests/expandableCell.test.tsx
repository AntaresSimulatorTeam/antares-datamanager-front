/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getTable } from '@/components/common/data/stdTable/tests/testTableUtils';
import { render } from '@testing-library/react';
import { ExpandableCell } from '../ExpandableCell';

describe('expandableCell', () => {
  it('renders the row without child correctly', () => {
    const table = getTable();
    const rowA = table.getRow('A');
    const component = render(<ExpandableCell row={rowA} getValue={rowA.getVisibleCells()[0].getValue} />);
    expect(component.queryByRole('button')).not.toBeInTheDocument();
    expect(component.getByTestId('spacer')).toHaveStyle('padding-left: 0rem');
  });
  it('renders the row with child correctly', () => {
    const table = getTable();
    const rowB = table.getRow('B');
    const component = render(<ExpandableCell row={rowB} getValue={rowB.getVisibleCells()[0].getValue} />);
    expect(component.queryByRole('button')).toBeInTheDocument();
    expect(component.getByTestId('spacer')).toHaveStyle('padding-left: 0rem');
  });
  it('renders the child row without child correctly', () => {
    const table = getTable();
    const rowB1 = table.getRow('B1');
    const component = render(<ExpandableCell row={rowB1} getValue={rowB1.getVisibleCells()[0].getValue} />);
    expect(component.queryByRole('button')).not.toBeInTheDocument();
    expect(component.getByTestId('spacer')).toHaveStyle('padding-left: 2rem');
  });
});
