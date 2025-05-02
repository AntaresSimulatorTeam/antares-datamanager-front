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
import { HypothesisTab, StudyDTO } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { createStudy } from '@/shared/services/studyService.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonWithStdIcon } from '@/components/button/ButtonWithStdIcon.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DetailsContent } from '@/components/banner/DetailsContent.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

interface StudyState {
  study: StudyDTO;
}

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { study } = location.state || {};
  const { t } = useTranslation();
  const { studyStatus, AREA, LINK } = useStudy();
  const dispatch = useStudyDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<HypothesisTab>({
    name: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: StdIconId.LinkedServices,
    isDisabled: false,
  });

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
    <div className="flex h-full w-full flex-col">
      <StudyHeader projectName={study.project} studyName={study.name} />
      <div className="flex h-full w-full flex-col overflow-x-auto">
        <RdsDivider />
        <div className="flex flex-col">
          <DetailsContent content={study} />
        </div>
        <div className="flex px-3 py-2">
          <div className="flex h-10 items-end self-stretch">
            <StudyNavigationMenu
              onRenderActiveComponent={setActiveContent}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
          </div>
        </div>
        <div className="flex-start flex h-full flex-col px-4">{activeContent}</div>
        <div className="sticky bottom-0 flex w-full items-center justify-end gap-2 border-t bg-gray-w p-1">
          {(!AREA || AREA?.state === TRAJECTORY_SELECTION_STATUS.ERROR) && (
            <div className={'text-error-600'}>{t('studyDetails.@add_trajectories_message')}</div>
          )}
          {AREA && LINK?.state === TRAJECTORY_SELECTION_STATUS.ERROR && (
            <div className={'text-error-600'}>{t('studyDetails.@error_link_trajectory_message')}</div>
          )}
          <ButtonWithStdIcon
            label={t('studyDetails.@generate')}
            onClick={() => void handleGenerateStudy()}
            disabled={
              !AREA ||
              AREA?.state === TRAJECTORY_SELECTION_STATUS.ERROR ||
              LINK?.state === TRAJECTORY_SELECTION_STATUS.ERROR ||
              studyStatus === StudyStatus.GENERATED
            }
            icon={StdIconId.CheckCircle}
            position="right"
            isLoading={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyDetails;
