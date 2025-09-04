/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { ProjectInfo, StudyDTO } from '@/shared/types';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useTranslation } from 'react-i18next';
import StdTagList from '@common/base/StdTagList/StdTagList.tsx';
import StdButton from '@common/base/stdButton/StdButton.tsx';

type DetailsContentProps = {
  content: StudyDTO | ProjectInfo;
  onClickButton?: () => void;
};

export const DetailsContent = ({ content, onClickButton }: DetailsContentProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 p-3">
      <header className="group flex flex-col gap-3 rounded border border-gray-500 bg-gray-200 p-2">
        {(content as ProjectInfo)?.description && (
          <div className="justify-between text-left text-gray-900">{(content as ProjectInfo).description}</div>
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
                  <StdIcon name={StdIconId.TimeLine} color="secondary" />
                  {(content as StudyDTO)?.horizon}
                </div>
              </>
            )}
            <div>|</div>
            <div className="flex items-center gap-1">
              <StdIcon name={StdIconId.History} color="secondary" />
              {formatDateToDDMMYYYY(content?.creationDate)}
            </div>
            <div>|</div>
            <div className="flex items-center gap-1">
              <StdIcon name={StdIconId.Person} color="secondary" />
              {t('studyDetails.@bannerCreatedBy', { createdBy: content?.createdBy ?? '' })}
            </div>
            {(content as StudyDTO)?.keywords?.length > 0 && (
              <>
                <div>|</div>
                <div className="flex h-3 w-32">
                  <StdTagList id={`${content.id}-tag-list`} tags={(content as StudyDTO).keywords} />
                </div>
              </>
            )}
            {(content as ProjectInfo)?.tags?.length > 0 && (
              <>
                <div>|</div>
                <div className="flex h-3 w-32">
                  <StdTagList id={`${content.id}-tag-list`} tags={(content as ProjectInfo).tags} />
                </div>
              </>
            )}
          </div>
          {'tags' in content && (
            <StdButton
              icon={StdIconId.Edit}
              label={t('project.@edit')}
              onClick={onClickButton}
              variant="text"
              color="primary"
            ></StdButton>
          )}
        </div>
      </header>
    </div>
  );
};

export default DetailsContent;
