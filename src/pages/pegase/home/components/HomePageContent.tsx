/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdHeading from '@/components/common/layout/stdHeading/StdHeading';
import { useState } from 'react';

import SearchBar from './SearchBar';
import StudyTableDisplay from './StudyTableDisplay';
import { useTranslation } from 'react-i18next';
import StdChip from '@common/base/stdChip/StdChip';

const HomePageContent = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const userName = 'mouad'; // Replace with actual user name

  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };

  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      searchStudy('');
    } else {
      setActiveChip(true);
      searchStudy(userName);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <StdHeading title="Studies in progress" />
      <div className="flex gap-4 py-2">
        <SearchBar onSearch={searchStudy} chipLabels={['']} />
        <StdChip
          label={t('home.@my_studies')}
          onClick={handleChipClick}
          status={activeChip ? 'secondary' : 'primary'}
        />
      </div>
      <StudyTableDisplay searchStudy={searchTerm} projectId={''} />
    </div>
  );
};

export default HomePageContent;
