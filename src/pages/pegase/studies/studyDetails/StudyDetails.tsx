/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';
import StudyHeader from './StudyHeader.tsx';
import { RdsDivider } from 'rte-design-system-react';
import StudyNavigationMenu from '@/pages/pegase/studies/studyDetails/StudyNavigationMenu';
import { DbTrajectoryWithState, HypothesisTab, StudyDTO, WarningMessage } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { createStudy } from '@/shared/services/studyService.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonWithStdIcon } from '@/components/button/ButtonWithStdIcon.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DetailsContent } from '@/components/banner/DetailsContent.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { WithNullableFields } from '@/shared/types/Generic.type.ts';
import { ContainerWithExpander } from '@/components/banner/ContainerWithExpander.tsx';
import { sortByLevel } from '@/shared/utils/trajectoryUtils.ts';

interface StudyState {
  study: StudyDTO;
}

const StudyDetails = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { study } = location.state || {};
  const { t } = useTranslation();
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  const [activeTab, setActiveTab] = useState<HypothesisTab>({
    name: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: StdIconId.LinkedServices,
    isDisabled: false,
  });
  const [messagesWarning, setMessagesWarning] = useState<WarningMessage[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let messages: WarningMessage[] = [];
    const trajectory: WithNullableFields<DbTrajectoryWithState, 'version' | 'userName' | 'creationDate'> | null =
      studyState[activeTab.name as keyof typeof TRAJECTORY_TYPE] ?? null;
    if (trajectory && trajectory?.messages?.length > 0) {
      messages = trajectory.messages.map((message) => ({
        ...message,
        trajectory: trajectory.trajectoryName,
      }));
    }
    if (activeTab.name === TRAJECTORY_TYPE.AREA) {
      if (studyState?.LINK && studyState.LINK.messages.length > 0) {
        const linkMessage = studyState.LINK.messages.map((message) => ({
          ...message,
          trajectory: studyState?.LINK?.trajectoryName ?? '',
        }));
        if (messages.length > 0) {
          const temporaryMessage = messages;
          messages = temporaryMessage.concat(linkMessage);
        } else {
          messages = linkMessage;
        }
      }
    }
    setMessagesWarning(messages?.sort(sortByLevel));
  }, [activeTab, studyState]);

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
      <div className="flex gap-4 px-3 pt-2">
        <div className="flex h-10 items-end self-stretch">
          <StudyNavigationMenu
            onRenderActiveComponent={setActiveContent}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
      </div>
      <div className="flex h-full flex-col justify-between px-4">
        <div className="flex h-full w-full flex-col gap-8">
          <ContainerWithExpander content={messagesWarning} />
          <div className="flex w-full">{activeContent}</div>
        </div>
        <div className="flex flex-col">
          <RdsDivider />
          <div className="my-2 flex items-center gap-2 self-end">
            {(!studyState?.AREA || studyState?.AREA?.state === TRAJECTORY_SELECTION_STATUS.ERROR) && (
              <div className={'text-error-600'}>{t('studyDetails.@add_trajectories_message')}</div>
            )}
            {studyState?.AREA && studyState?.LINK?.state === TRAJECTORY_SELECTION_STATUS.ERROR && (
              <div className={'text-error-600'}>{t('studyDetails.@error_link_trajectory_message')}</div>
            )}
            <ButtonWithStdIcon
              label={t('studyDetails.@generate')}
              onClick={() => void handleGenerateStudy()}
              disabled={
                !studyState?.AREA ||
                studyState?.AREA?.state === TRAJECTORY_SELECTION_STATUS.ERROR ||
                studyState?.LINK?.state === TRAJECTORY_SELECTION_STATUS.ERROR ||
                studyState?.studyStatus === StudyStatus.GENERATED
              }
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
