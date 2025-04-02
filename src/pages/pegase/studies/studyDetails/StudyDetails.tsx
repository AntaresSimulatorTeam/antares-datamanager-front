/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';
import StudyHeader from './StudyHeader.tsx';
import { RdsDivider } from 'rte-design-system-react';
import StudyNavigationMenu from '@/pages/pegase/studies/studyDetails/StudyNavigationMenu';
import { StudyDTO } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { createStudy } from '@/shared/services/studyService.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonWithStdIcon } from '@/components/button/ButtonWithStdIcon.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DetailsContent } from '@/components/banner/DetailsContent.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

interface StudyState {
  study: StudyDTO;
}

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { t } = useTranslation();
  const { studyStatus, AREA, LINK } = useStudy();
  const dispatch = useStudyDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const { study } = location.state || {};

  const handleGenerateStudy = async () => {
    try {
      setIsGenerating(true);
      await createStudy(study.id);
      setIsGenerating(false);
      dispatch?.({ type: STUDY_ACTION.SET_STUDY_STATUS, payload: StudyStatus.GENERATED });
    } catch (error) {
      setIsGenerating(false);
    }
  };

  return !study.id ? (
    <div className="flex h-screen items-center justify-center">
      <p>Loading project details...</p>
    </div>
  ) : (
    <div className="flex h-full flex-col">
      <StudyHeader projectName={study.project} studyName={study.name} />
      <RdsDivider />
      <div className="flex flex-col">
        <DetailsContent content={study} />
      </div>
      <div className="flex gap-4 px-3 py-2">
        <div className="flex h-10 items-end self-stretch">
          <StudyNavigationMenu onRenderActiveComponent={setActiveContent} study={study} />
        </div>
      </div>
      <div className="flex h-full flex-col justify-between space-x-4 p-4">
        {activeContent}
        <div className="flex flex-col gap-2">
          <RdsDivider />
          <div className="flex items-center gap-2 self-end">
            {!AREA && <div className={'text-error-600'}>{t('studyDetails.@add_trajectories_message')}</div>}
            {AREA && !LINK && <div className={'text-error-600'}>{t('studyDetails.@add_trajectories_message')}</div>}
            <ButtonWithStdIcon
              label={t('studyDetails.@generate')}
              onClick={() => void handleGenerateStudy()}
              disabled={!AREA?.type || (AREA && !LINK) || studyStatus === StudyStatus.GENERATED}
              icon={StdIconId.CheckCircle}
              position="right"
              isLoading={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyDetails;
