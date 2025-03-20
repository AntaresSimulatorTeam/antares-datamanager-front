/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import SearchBar from './SearchBar';
import StudyTableDisplay from './StudyTableDisplay';
import { useTranslation } from 'react-i18next';
import { RdsChip, RdsHeading } from 'rte-design-system-react';
import { useUser } from '@/store/contexts/UserContext.tsx';

const HomePageContent = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
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
    <div className="flex w-full flex-1 flex-col gap-3">
      <RdsHeading title={t('home.@study_table_title')} />
      <div className="flex gap-4 py-2">
        <SearchBar onSearch={searchStudy} chipLabels={['']} />
        <RdsChip
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
