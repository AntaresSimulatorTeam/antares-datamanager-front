/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fakeDropdownShortList } from '@/mocks/data/components/dropdownItems.mock';
import { noop } from '@/shared/utils/common/defaultUtils';
import { render, screen } from '@testing-library/react';
import StdDropdownWithSearch from '../StdDropdownWithSearch';

const TEST_ID = 'my-dropdown';
const TEST_SEARCH_TEXT = 'research';

describe('StdDropdownWithSearch', () => {
  it('renders search dropdown should display search bar', () => {
    render(
      <StdDropdownWithSearch
        id={TEST_ID}
        items={fakeDropdownShortList}
        mode="searchOnly"
        searchPlaceHolder={TEST_SEARCH_TEXT}
        onSearch={noop}
      />,
    );
    expect(screen.getByPlaceholderText(TEST_SEARCH_TEXT)).toBeInTheDocument();
  });
});
