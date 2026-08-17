/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import { noop } from '@/shared/utils/common/defaultUtils';
import PegaseCard from '../PegaseCard';
import { DropdownItemProps } from '@design-system-rte/core/components/dropdown/dropdown.interface';

const TEST_TITLE = 'Card Title';
const TEST_CHILDREN = <div role="article"></div>;
const TEST_ID = 123;
const TEST_DROPDOWN_DROPDOWN = [
  { label: 'Option 1', onClick: noop },
  { label: 'Option 2', onClick: noop },
  { label: 'Option 3', onClick: noop },
] as DropdownItemProps[];

describe('PegaseCard', () => {
  it('renders the default PegaseCard component', () => {
    render(<PegaseCard id={TEST_ID} title={TEST_TITLE} dropdownOptions={TEST_DROPDOWN_DROPDOWN} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders the StdCard component with children', () => {
    render(
      <PegaseCard id={TEST_ID} title={TEST_TITLE} dropdownOptions={TEST_DROPDOWN_DROPDOWN}>
        {TEST_CHILDREN}
      </PegaseCard>,
    );
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
