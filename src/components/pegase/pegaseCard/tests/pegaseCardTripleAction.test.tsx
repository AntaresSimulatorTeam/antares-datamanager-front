/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import { StdButtonProps } from '@/components/common/base/stdButton/StdButton';
import { StdDropdownOption } from '@/components/common/layout/stdDropdown/StdDropdown';
import { noop } from '@/shared/utils/common/defaultUtils';
import PegaseCard from '../pegaseCard';

const TEST_TITLE = 'Card Title';
const TEST_PRIMARY_BUTTON: Omit<StdButtonProps, 'type' | 'size' | 'variant'> = {
  label: 'Primary Button',
};
const TEST_SECONDARY_BUTTON: Omit<StdButtonProps, 'type' | 'size' | 'variant'> = {
  label: 'Secondary Button',
};
const TEST_CHILDREN = <div role="article"></div>;
const TEST_ID = 'card-triple-action-id';
const TEST_DROPDOWN_DROPDOWN: StdDropdownOption[] = [
  { key: 'op1', label: 'Option 1', value: 'op1', onItemClick: noop },
  { key: 'op2', label: 'Option 2', value: 'op2', onItemClick: noop },
  { key: 'op3', label: 'Option 3', value: 'op3', onItemClick: noop },
];

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

  it('renders the StdCard component with primary button', () => {
    render(
      <PegaseCard
        id={TEST_ID}
        title={TEST_TITLE}
        dropdownOptions={TEST_DROPDOWN_DROPDOWN}
        buttons={{ primary: TEST_PRIMARY_BUTTON }}
      >
        {TEST_CHILDREN}
      </PegaseCard>,
    );
    expect(screen.getByText(TEST_PRIMARY_BUTTON.label ?? 'none')).toBeInTheDocument();
  });

  it('renders the StdCard component with secondary button', () => {
    render(
      <PegaseCard
        id={TEST_ID}
        title={TEST_TITLE}
        dropdownOptions={TEST_DROPDOWN_DROPDOWN}
        buttons={{ secondary: TEST_SECONDARY_BUTTON }}
      >
        {TEST_CHILDREN}
      </PegaseCard>,
    );
    expect(screen.getByText(TEST_SECONDARY_BUTTON.label ?? 'none')).toBeInTheDocument();
  });
});
