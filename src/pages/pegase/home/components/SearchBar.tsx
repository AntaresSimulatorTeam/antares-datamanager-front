/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { RdsSearchInput } from 'rte-design-system-react';

interface SearchBarProps {
  onSearch: (value?: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder }: SearchBarProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <RdsSearchInput
        onChange={onSearch}
        onSearch={onSearch}
        placeHolder={placeholder ?? t('home.@search_placeholder')}
        variant="filled"
      />
    </div>
  );
};

export default SearchBar;
