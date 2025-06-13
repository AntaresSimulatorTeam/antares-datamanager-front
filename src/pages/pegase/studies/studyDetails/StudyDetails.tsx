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
import { DbTrajectory, HypothesisTab, StudyDTO, WarningMessage } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { createStudy } from '@/shared/services/studyService.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonWithStdIcon } from '@/components/button/ButtonWithStdIcon.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DetailsContent } from '@/components/banner/DetailsContent.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ContainerWithExpander } from '@/components/banner/ContainerWithExpander.tsx';
import { discardWarningMessage } from '@/shared/services/warningService.ts';

interface StudyState {
  study: StudyDTO;
}

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { study } = location.state || {};
  const { t } = useTranslation();
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<HypothesisTab>({
    name: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: StdIconId.LinkedServices,
    isDisabled: false,
  });
  const [messagesWarning, setMessagesWarning] = useState<WarningMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let messages: WarningMessage[] = [];
    const trajectories: DbTrajectory[] | null = studyState[activeTab.name as keyof typeof TRAJECTORY_TYPE] ?? null;
    if (trajectories && trajectories.length > 0) {
      messages = trajectories.flatMap((trajectory) =>
        trajectory.messages.map((message) => ({
          ...message,
          trajectoryId: trajectory.id,
          trajectoryType: activeTab.name,
          trajectory: trajectory.trajectoryName,
          onClickItem: studyState.studyStatus !== StudyStatus.GENERATED ? discardWarningMessage : null,
        })),
      );
    }
    if (activeTab.name === TRAJECTORY_TYPE.AREA) {
      if (studyState?.LINK && studyState?.LINK?.[0]?.messages?.length > 0) {
        const linkMessage = studyState.LINK[0].messages.map((message) => ({
          ...message,
          trajectoryId: studyState?.LINK?.[0].id,
          trajectoryType: TRAJECTORY_TYPE.LINK,
          trajectory: (studyState.LINK?.[0] as DbTrajectory)?.trajectoryName ?? '',
          onClickItem: studyState.studyStatus !== StudyStatus.GENERATED ? discardWarningMessage : null,
        }));
        messages = messages.length > 0 ? messages.concat(linkMessage) : linkMessage;
      }
    }
    setMessagesWarning(messages.sort((a, b) => Number(a.isAck) - Number(b.isAck)));
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
      <p>{t('studyDetails.@loading')}</p>
    </div>
  ) : (
    <div className="flex h-full w-full flex-col pb-20">
      <StudyHeader study={study} />
      <div className="relative flex h-full w-full flex-col">
        <RdsDivider />
        <div className="flex flex-col">
          <DetailsContent content={study} />
        </div>
        <div className="flex px-3 pt-2">
          <div className="flex h-10 items-end self-stretch">
            <StudyNavigationMenu
              onRenderActiveComponent={setActiveContent}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
              setErrorMessage={setErrorMessage}
            />
          </div>
        </div>
        <div className="relative flex flex-1 flex-col overflow-y-auto px-4">
          <div className="flex h-full w-full flex-col gap-4">
            <ContainerWithExpander content={messagesWarning} placeholder={t('studyDetails.@noWarnings')} />
            <div className="flex w-full">{activeContent}</div>
          </div>
          <div className="fixed bottom-0 right-0 -z-20 w-full border-t bg-gray-w px-1 py-1.5">
            <div className="flex h-fit w-full items-center justify-end">
              {!studyState.AREA && !errorMessage && (
                <div className="mr-1 text-error-600">{t('studyDetails.@add_trajectories_message')}</div>
              )}
              {errorMessage && <div className="mr-1 text-error-600">{errorMessage}</div>}
              <ButtonWithStdIcon
                label={t('studyDetails.@generate')}
                onClick={() => void handleGenerateStudy()}
                disabled={!studyState.AREA || studyState.studyStatus === StudyStatus.GENERATED}
                icon={StdIconId.CheckCircle}
                position="right"
                isLoading={isGenerating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyDetails;
