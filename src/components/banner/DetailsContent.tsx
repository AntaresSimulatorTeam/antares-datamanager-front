/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { ProjectInfo, StudyDTO } from '@/shared/types';
import { RdsIcon, RdsIconId, RdsTagList } from 'rte-design-system-react';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useTranslation } from 'react-i18next';

type DetailsContentProps = {
  content: StudyDTO | ProjectInfo;
};

export const DetailsContent = ({ content }: DetailsContentProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 p-3">
      <header className="group flex flex-col gap-3 rounded bg-acc1-50 p-2">
        {(content as ProjectInfo)?.description && (
          <div className="justify-between text-left font-body text-gray-900">
            {(content as ProjectInfo).description}
          </div>
        )}
        <div className="flex items-center justify-between font-light text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex flex-[1_0_0] items-center gap-6">
              <div>
                {t('pinned' in content ? 'projectDetails.@bannerProjectName' : 'studyDetails.@bannerStudyName', {
                  name: content?.name,
                })}
              </div>
              {(content as StudyDTO)?.horizon && (
                <>
                  <div>|</div>
                  <div className="flex items-center gap-2">
                    <StdIcon name={StdIconId.TimeLine} color="secondary" />
                    {t('studyDetails.@bannerHorizon', { horizon: (content as StudyDTO).horizon })}
                  </div>
                </>
              )}
              <div>|</div>
              <div className="flex items-center gap-2">
                <RdsIcon name={RdsIconId.History} color="secondary" />
                {formatDateToDDMMYYYY(content?.creationDate)}
              </div>
              <div>|</div>
              <div className="flex items-center gap-2">
                <RdsIcon name={RdsIconId.Person} color="secondary" />
                {t('studyDetails.@bannerCreatedBy', { createdBy: content?.createdBy ?? '' })}
              </div>
              {(content as StudyDTO)?.keywords?.length > 0 && (
                <>
                  <div>|</div>
                  <div className="flex h-3 w-32">
                    <RdsTagList id={`${content.id}-tag-list`} tags={(content as StudyDTO).keywords} />
                  </div>
                </>
              )}
              {(content as ProjectInfo)?.tags?.length > 0 && (
                <>
                  <div>|</div>
                  <div className="flex h-3 w-32">
                    <RdsTagList id={`${content.id}-tag-list`} tags={(content as ProjectInfo).tags} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default DetailsContent;
