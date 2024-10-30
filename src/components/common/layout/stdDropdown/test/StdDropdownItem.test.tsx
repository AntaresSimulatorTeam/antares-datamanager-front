/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { noop } from '@/shared/utils/common/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { render, screen } from '@testing-library/react';
import StdDropdownItem from '../subComponents/StdDropdownItem';

const TEST_LABEL = 'Label';
const TEST_VALUE = 'value';
const TEST_ICON = StdIconId.Add;
const TEST_ID = 'my-dropdown-item';

describe('StdDropdownItem', () => {
  it('renders the default StdDropdownItem component', () => {
    render(<StdDropdownItem label={TEST_LABEL} value={TEST_VALUE} onClick={noop} />);
    const item = screen.getByRole('option');
    expect(item).toBeInTheDocument();
    expect(item.textContent).toBe(TEST_LABEL);
  });

  it('renders the StdDropdownItem with the proper id when specified', () => {
    render(<StdDropdownItem label={TEST_LABEL} value={TEST_VALUE} id={TEST_ID} onClick={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdDropdownItem component with icon + label', () => {
    render(<StdDropdownItem label={TEST_LABEL} value={TEST_VALUE} icon={TEST_ICON} onClick={noop} />);
    const item = screen.getByRole('option');
    expect(item).toBeInTheDocument();
    expect(item.textContent).toContain(TEST_LABEL);
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });
});
