/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fakeDropdownShortList } from '@/mocks/data/components/dropdownItems.mock';
import { render, screen } from '@testing-library/react';
import StdDropdown from '../StdDropdown';
import StdDropdownWithHeader from '../StdDropdownWithHeader';

const TEST_HEADER = 'This is a dropdown header yay!';
const TEST_ID = 'my-dropdown';
// const TEST_SEARCH_TEXT = 'research';

describe('StdDropdown', () => {
  it('properly renders the StdDropdown with the proper id', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('properly renders the items section', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('properly renders the header section when header is passed', () => {
    render(<StdDropdownWithHeader id={TEST_ID} items={fakeDropdownShortList} header={TEST_HEADER} />);
    expect(screen.getByText(TEST_HEADER)).toBeInTheDocument();
  });

  it('properly gives the container the combobox role if dropdown is multiple', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} isMultiple />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders the correct amount of items in the item section with the proper content', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} />);
    expect(screen.getAllByRole('option').length).toBe(fakeDropdownShortList.length);
    expect(document.querySelector(`#${fakeDropdownShortList[0].id}`)).toBeInTheDocument();
    expect(screen.getByText(fakeDropdownShortList[0].label)).toBeInTheDocument();
  });
});
