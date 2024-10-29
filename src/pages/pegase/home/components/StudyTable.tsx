/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdChip from '@/components/common/base/stdChip/StdChip';
import StdSearchInput from '@/components/common/forms/stdSearchInput/StdSearchInput';
import { useTranslation } from 'react-i18next';
import StudyTableDisplay from './StudyTableDisplay';

const StudyTable = () => {
  const { t } = useTranslation();
  const chipLabels = ['Chip', 'Chip', 'Chip'];
  const searchStudy = (value?: string) => {
    //TODO: Implement search
    // eslint-disable-next-line no-console
    console.log(value);
  };

  return (
    <div className="w-full flex-col overflow-auto p-3">
      <div className="text-white font-['Nunito Sans'] pb-3 text-left text-[28px] font-normal leading-[33.60px]">
        Studies in progress
      </div>
      <div className="flex w-full flex-row justify-between pb-3">
        <div className="inline-flex h-[68px] items-center justify-start gap-8 py-4">
          <StdSearchInput onSearch={searchStudy} placeHolder={t('home.@searchBar')} variant="outlined" />
          <div className="ml-8 flex gap-4">
            {chipLabels.map((label, index) => (
              <StdChip key={index} label={label} />
            ))}
          </div>
        </div>
      </div>
      <StudyTableDisplay />
    </div>
  );
};

export default StudyTable;
