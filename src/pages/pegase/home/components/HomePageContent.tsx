/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdChip from '@/components/common/base/stdChip/StdChip';
import StdSearchInput from '@/components/common/forms/stdSearchInput/StdSearchInput';
import { useState } from 'react';

import SearchBar from './SearchBar';
import StudyTableDisplay from './StudyTableDisplay';

const HomePageContent = () => {
  const chipLabels = ['Chip', 'Chip', 'Chip'];
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');

  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };

  return (
    <div className="self-stretch">
      <div className="text-white font-['Nunito Sans'] pb-3 text-left text-[28px] font-normal leading-[33.60px]">
        Studies in progress
      </div>
      <div className="flex w-full flex-row items-center justify-between pb-3">
        <SearchBar onSearch={searchStudy} chipLabels={chipLabels} />
      </div>
      <StudyTableDisplay searchStudy={searchTerm} />
    </div>
  );
};

export default HomePageContent;
