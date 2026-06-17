/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import StudyTableDisplay from './StudyTableDisplay';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/store/contexts/UserContext.tsx';
import StdHeading from '@common/layout/stdHeading/StdHeading.tsx';
import { Chip, Searchbar } from '@design-system-rte/react';

const HomePageContent = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  const [activeChip, setActiveChip] = useState<boolean>(false);
  const { user } = useUser();

  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };

  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      searchStudy('');
    } else {
      setActiveChip(true);
      searchStudy(user?.profile.sub);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-start gap-4">
      <StdHeading title={t('home.@study_table_title')} />
      <div className="flex w-1/3 items-center gap-4">
        <div className="flex w-3/4">
          <Searchbar onChange={searchStudy} onSearch={searchStudy} label={t('home.@search_placeholder_study')} />
        </div>
        <div className="flex w-1/4">
          <Chip id="chip-home-page" label={t('home.@my_studies')} onClick={handleChipClick} selected={activeChip} />
        </div>
      </div>
      <StudyTableDisplay searchStudy={searchTerm} />
    </div>
  );
};

export default HomePageContent;
