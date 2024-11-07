/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState } from 'react';
import StdDropdown, { StdDropdownProps } from './StdDropdown';
import StdDropdownAddFooter from './subComponents/StdDropdownAddFooter';
import StdDropdownSearchHeader from './subComponents/StdDropdownSearchHeader';
import StdEmptySearch from './subComponents/StdEmptySearch';

type SearchOnlyType = {
  mode: 'searchOnly';
  searchPlaceHolder: string;
};

type SearchAddNewType = {
  mode: 'addNew';
  searchPlaceHolder: string;
};
export type StdDropdownWithHeaderProps = { onSearch: () => void } & (SearchOnlyType | SearchAddNewType) &
  Omit<StdDropdownProps, 'header' | 'footer'>;

export const DROPDOWN_SEARCH_BAR = 'dropdown-search-bar';

const StdDropdownWithSearch = ({
  mode,
  searchPlaceHolder,
  items,
  onSearch,
  ...dropdownProps
}: StdDropdownWithHeaderProps) => {
  const [searchInput, setSearchInput] = useState<string>();
  const itemsfiltered = useMemo(
    () =>
      !searchInput
        ? items
        : items.filter((item) => !searchInput || item.label.toLowerCase().includes(searchInput.toLowerCase())),
    [items, searchInput],
  );

  return (
    <>
      <StdDropdown
        {...dropdownProps}
        items={itemsfiltered}
        header={
          <StdDropdownSearchHeader
            onChange={setSearchInput}
            onSearch={onSearch}
            value={searchInput}
            placeHolder={searchPlaceHolder}
            id={DROPDOWN_SEARCH_BAR}
          />
        }
        emptyDropdownItem={<StdEmptySearch />}
        footer={mode === 'addNew' ? <StdDropdownAddFooter /> : undefined}
      />
    </>
  );
};

export default StdDropdownWithSearch;
