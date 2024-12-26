/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen, within } from '@testing-library/react';

import { noop } from '@/shared/utils/common/defaultUtils';
import PegaseCardTitle from '../pegaseCardTitle';
import { RdsDropdownOption, RdsIconButton, RdsIconId, RdsTagProps } from 'rte-design-system-react';

const TEST_TITLE = 'Card Title';
const TEST_LEFT_ICON = RdsIconId.StarFilled;
const TEST_LABEL = 'Test Tag';
const TEST_ID = 'card-title-id';
const TEST_TAG: Omit<RdsTagProps, 'onClose'> = {
  label: TEST_LABEL,
};
const TEST_DROPDOWN_ITEMS: RdsDropdownOption[] = [
  { key: 'op1', label: 'Option 1', value: 'op1', onItemClick: noop },
  { key: 'op2', label: 'Option 2', value: 'op2', onItemClick: noop },
  { key: 'op3', label: 'Option 3', value: 'op3', onItemClick: noop },
];

describe('PegaseCardTitle', () => {
  it('renders the default PegaseCardTitle component', () => {
    render(<PegaseCardTitle id={TEST_ID} title={TEST_TITLE} dropdownOptions={TEST_DROPDOWN_ITEMS} />);
    const cardTitle = screen.getByRole('banner');
    expect(cardTitle).toBeInTheDocument();
  });

  it('renders the PegaseCardTitle component with left icon', () => {
    render(
      <PegaseCardTitle
        id={TEST_ID}
        title={TEST_TITLE}
        icons={<RdsIconButton icon={TEST_LEFT_ICON} onClick={noop} />}
        dropdownOptions={TEST_DROPDOWN_ITEMS}
      />,
    );
    const cardTitle = screen.getByRole('banner');
    expect(cardTitle).toBeInTheDocument();
  });

  it('renders the PegaseCardTitle component with tag', () => {
    render(<PegaseCardTitle id={TEST_ID} title={TEST_TITLE} tag={TEST_TAG} dropdownOptions={TEST_DROPDOWN_ITEMS} />);
    const cardTitle = screen.getByRole('banner');
    expect(cardTitle).toBeInTheDocument();

    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
  });

  it('renders the PegaseCardTitle component dropdown menu button disabled with empty dropdown items', () => {
    render(<PegaseCardTitle id={TEST_ID} title={TEST_TITLE} dropdownOptions={[]} />);
    const cardTitle = screen.getByRole('banner');
    expect(cardTitle).toBeInTheDocument();

    const dropdownButton = within(cardTitle).getByRole('button');
    expect(dropdownButton).toBeDisabled();
  });
});
