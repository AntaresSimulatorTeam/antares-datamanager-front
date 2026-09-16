/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen, within } from '@testing-library/react';

import { noop } from '@/shared/utils/common/defaultUtils';
import PegaseCardTitle from '../PegaseCardTitle';
import { IconButton } from '@design-system-rte/react';
import { DropdownItemProps } from '@design-system-rte/core/components/dropdown/dropdown.interface';

const TEST_TITLE = 'Card Title';
const TEST_LEFT_ICON = 'close';
const TEST_ID = 'card-title-id';

const TEST_DROPDOWN_ITEMS: DropdownItemProps[] = [
  { label: 'Option 1', onClick: noop },
  { label: 'Option 2', onClick: noop },
  { label: 'Option 3', onClick: noop },
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
        icons={<IconButton name={TEST_LEFT_ICON} onClick={noop} />}
        dropdownOptions={TEST_DROPDOWN_ITEMS}
      />,
    );
    const cardTitle = screen.getByRole('banner');
    expect(cardTitle).toBeInTheDocument();
  });

  it('renders the PegaseCardTitle component dropdown menu button disabled with empty dropdown items', () => {
    render(<PegaseCardTitle id={TEST_ID} title={TEST_TITLE} dropdownOptions={[]} />);
    const cardTitle = screen.getByRole('banner');
    expect(cardTitle).toBeInTheDocument();

    const dropdownButton = within(cardTitle).getByRole('button');
    expect(dropdownButton).toBeDisabled();
  });
});
