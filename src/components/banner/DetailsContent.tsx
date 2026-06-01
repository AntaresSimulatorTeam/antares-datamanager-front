/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { ProjectInfo, StudyDTO } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { Button, Icon } from '@design-system-rte/react';
import StdTagList from '@common/base/StdTagList/StdTagList.tsx';

type DetailsContentProps = {
  content: StudyDTO | ProjectInfo;
  tagsList?: string[];
  onClickButton?: () => void;
};

export const DetailsContent = ({ content, onClickButton, tagsList }: DetailsContentProps) => {
  const { t } = useTranslation();

  return (
    <header className="group flex w-full flex-col gap-1 rounded border border-gray-500 bg-gray-100 p-2">
      {(content as ProjectInfo)?.description && (
        <div className="whitespace-normal break-words text-left text-gray-900">
          {(content as ProjectInfo).description}
        </div>
      )}
      <div className="flex items-center justify-between font-light text-gray-500">
        <div className="flex flex-[1_0_0] items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="font-normal">{`${t('pinned' in content ? 'projectDetails.@bannerProjectName' : 'studyDetails.@bannerStudyName')}: `}</div>
            <div>{content?.name}</div>
          </div>
          {(content as StudyDTO)?.horizon && (
            <>
              <div>|</div>
              <div className="flex items-center gap-1">
                <Icon name="timeline" />
                {(content as StudyDTO)?.horizon}
              </div>
            </>
          )}
          <div>|</div>
          <div className="flex items-center gap-1">
            <Icon name="history" />
            {formatDateToDDMMYYYY(content?.creationDate)}
          </div>
          <div>|</div>
          <div className="flex items-center gap-1">
            <Icon name="user" />
            {t('studyDetails.@bannerCreatedBy', { createdBy: content?.createdBy ?? '' })}
          </div>
          {tagsList?.length != null && tagsList.length > 0 && (
            <div className="flex min-w-32 items-center gap-1">
              <div>|</div> <StdTagList maxVisibleTags={2} tags={tagsList} />
            </div>
          )}
        </div>
        {(('status' in content && content?.status !== StudyStatus.GENERATED) || 'studies' in content) && (
          <Button icon="edit" label={t('project.@edit')} onClick={onClickButton} variant="secondary"></Button>
        )}
      </div>
    </header>
  );
};

export default DetailsContent;
