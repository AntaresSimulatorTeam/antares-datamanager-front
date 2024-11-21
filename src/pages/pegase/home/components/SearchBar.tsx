/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSearchInput from '@/components/common/forms/stdSearchInput/StdSearchInput';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (value?: string) => void;
  chipLabels: string[];
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div>
        <StdSearchInput onSearch={onSearch} placeHolder={t('home.@searchBar')} variant="outlined" />
      </div>
    </>
  );
};

export default SearchBar;
